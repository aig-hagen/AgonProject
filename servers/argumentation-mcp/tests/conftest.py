from __future__ import annotations

import json
from collections.abc import Callable

import httpx
import pytest

from argumentation_mcp.config import Config
from argumentation_mcp.dung import DungBackend
from argumentation_mcp.generation import GraphGenBackend
from argumentation_mcp.share import ShareBackend

Handler = Callable[[dict], httpx.Response]


@pytest.fixture
def config() -> Config:
    return Config(dung_url="http://backend.test/dung", timeout_seconds=5, max_request_bytes=1024)


def make_backend(config: Config, handler: Handler) -> DungBackend:
    """Build a DungBackend whose HTTP calls are served by ``handler``.

    ``handler`` receives the decoded request body and returns an ``httpx.Response``.
    """

    def transport_handler(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content.decode("utf-8"))
        return handler(body)

    client = httpx.AsyncClient(transport=httpx.MockTransport(transport_handler))
    return DungBackend(config, client=client)


def answer(text: str, *, status: str = "SUCCESS", time: float = 12.0) -> httpx.Response:
    return httpx.Response(200, json={"time": time, "answer": text, "status": status})


def make_graphgen(config: Config, handler=None) -> GraphGenBackend:
    """Build a GraphGenBackend served by ``handler`` (a raw httpx request handler).

    Defaults to reporting no algorithms and an unavailable backend.
    """

    def default(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=[])

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler or default))
    return GraphGenBackend(config, client=client)


def make_share(config: Config, handler=None) -> ShareBackend:
    """Build a ShareBackend served by ``handler`` (a raw httpx request handler).

    Defaults to minting a fixed share URL for any POST.
    """

    def default(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/shares" and request.method == "POST":
            return httpx.Response(201, json={"id": "abc123", "url": "https://app.test/share/abc123"})
        return httpx.Response(404, json={"error": "Share not found"})

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler or default))
    return ShareBackend(config, client=client)
