from __future__ import annotations

import httpx
import pytest

from argumentation_mcp.errors import ErrorCode, ServiceError
from argumentation_mcp.share import ShareBackend
from tests.conftest import make_share


async def test_create_share_returns_service_url(config):
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["path"] = request.url.path
        captured["body"] = request.content.decode("utf-8")
        return httpx.Response(201, json={"id": "x", "url": "https://app.test/share/x"})

    share = make_share(config, handler)
    url = await share.create_share('{"apiVersion":"argumentation-framework/v1"}')
    assert url == "https://app.test/share/x"
    assert captured["path"] == "/shares"
    assert "apiVersion" in captured["body"]


async def test_too_large_maps_to_request_too_large(config):
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(413, json={"error": "too big"})

    with pytest.raises(ServiceError) as exc:
        await make_share(config, handler).create_share("x")
    assert exc.value.code is ErrorCode.REQUEST_TOO_LARGE


async def test_rate_limited_maps_to_unavailable(config):
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, json={"error": "slow down"})

    with pytest.raises(ServiceError) as exc:
        await make_share(config, handler).create_share("x")
    assert exc.value.code is ErrorCode.BACKEND_UNAVAILABLE


async def test_missing_url_maps_to_share_failed(config):
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(201, json={"id": "x"})

    with pytest.raises(ServiceError) as exc:
        await make_share(config, handler).create_share("x")
    assert exc.value.code is ErrorCode.SHARE_FAILED


async def test_transport_error_maps_to_unavailable(config):
    def handler(_request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("no route")

    with pytest.raises(ServiceError) as exc:
        await make_share(config, handler).create_share("x")
    assert exc.value.code is ErrorCode.BACKEND_UNAVAILABLE
