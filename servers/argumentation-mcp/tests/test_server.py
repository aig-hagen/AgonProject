from __future__ import annotations

import json

import httpx

from argumentation_mcp.server import build_server
from tests.conftest import answer, make_backend, make_graphgen, make_share


def _config():
    from argumentation_mcp.config import Config

    return Config(dung_url="http://backend.test/dung", timeout_seconds=5, max_request_bytes=4096)


async def test_tools_are_advertised_with_output_schema():
    server = build_server(_config(), make_backend(_config(), lambda body: answer("[]")), make_graphgen(_config()), make_share(_config()))
    tools = {t.name: t for t in await server.list_tools()}
    assert set(tools) == {
        "get_capabilities", "enumerate_extensions", "check_acceptance",
        "generate_framework", "share_framework",
    }
    for tool in tools.values():
        assert tool.output_schema is not None
        assert tool.annotations is not None
    # Reasoning tools are read-only; share_framework writes to the share service.
    assert tools["share_framework"].annotations.read_only_hint is False
    for name in ("get_capabilities", "enumerate_extensions", "check_acceptance", "generate_framework"):
        assert tools[name].annotations.read_only_hint is True
    for name in ("enumerate_extensions", "check_acceptance"):
        assert "instead of relying solely on manual reasoning" in tools[name].description


async def test_enumerate_call_returns_structured_and_text():
    cfg = _config()
    server = build_server(cfg, make_backend(cfg, lambda body: answer("[{1},{2,3}]")), make_graphgen(cfg), make_share(cfg))
    result = await server.call_tool(
        "enumerate_extensions",
        {"framework_text": "a\nb\nc\na -> b\nb -> c\n", "semantics": "PR"},
    )
    assert result.is_error is False
    assert result.structured_content["extensions"] == [["a"], ["b", "c"]]
    assert "extension" in result.content[0].text


async def test_error_call_returns_structured_error_payload():
    cfg = _config()
    server = build_server(cfg, make_backend(cfg, lambda body: answer("[]")), make_graphgen(cfg), make_share(cfg))
    # Both framework and framework_text omitted -> INVALID_REQUEST.
    result = await server.call_tool("enumerate_extensions", {"semantics": "PR"})
    assert result.is_error is True
    payload = json.loads(result.content[0].text)
    assert payload["code"] == "INVALID_REQUEST"
    assert payload["retryable"] is False


async def test_generate_call_returns_named_framework():
    cfg = _config()

    def gg(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/generate":
            return httpx.Response(200, json={"nr_of_arguments": 2, "attacks": [[1, 2]]})
        return httpx.Response(200, json=[])

    server = build_server(cfg, make_backend(cfg, lambda body: answer("[]")), make_graphgen(cfg, gg), make_share(cfg))
    result = await server.call_tool("generate_framework", {"algorithm": "erdos-renyi", "seed": 1})
    assert result.is_error is False
    fw = result.structured_content["framework"]
    assert fw["arguments"] == ["a1", "a2"]
    assert result.structured_content["seed"] == 1


async def test_share_call_returns_link():
    cfg = _config()
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["body"] = json.loads(request.content.decode("utf-8"))
        return httpx.Response(201, json={"id": "k9", "url": "https://app.test/share/k9"})

    server = build_server(
        cfg, make_backend(cfg, lambda body: answer("[]")), make_graphgen(cfg), make_share(cfg, handler)
    )
    result = await server.call_tool(
        "share_framework",
        {"framework_text": "a\nb\na -> b\n", "name": "Demo"},
    )
    assert result.is_error is False
    assert result.structured_content["url"] == "https://app.test/share/k9"
    assert result.structured_content["nr_of_arguments"] == 2
    assert "https://app.test/share/k9" in result.content[0].text
    shared = json.loads(captured["body"]["content"])
    assert shared["apiVersion"] == "argumentation-framework/v1"
    assert shared["name"] == "Demo"
    assert shared["layoutType"] == "ForceDirected"
