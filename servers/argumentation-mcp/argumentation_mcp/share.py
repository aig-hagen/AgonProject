"""Adapter around the share service ``/shares`` endpoint.

Stores a serialized framework and returns the public ``/share/<id>`` link the
service mints (from its own configured frontend URL), which the caller relays
unchanged.
"""

from __future__ import annotations

import httpx

from argumentation_mcp.config import Config
from argumentation_mcp.errors import ErrorCode, ServiceError


class ShareBackend:
    """Async client for the share service."""

    def __init__(self, config: Config, client: httpx.AsyncClient | None = None):
        self._config = config
        self._base = config.share_url.rstrip("/")
        self._client = client or httpx.AsyncClient(timeout=config.timeout_seconds + 5)

    async def aclose(self) -> None:
        await self._client.aclose()

    async def is_available(self) -> bool:
        try:
            response = await self._client.get(f"{self._base}/shares/__healthcheck__")
        except httpx.HTTPError:
            return False
        # A reachable service answers 404 (unknown id); anything routed is "up".
        return response.status_code < 500

    async def create_share(self, content: str) -> str:
        try:
            response = await self._client.post(f"{self._base}/shares", json={"content": content})
        except httpx.TimeoutException as exc:
            raise ServiceError(ErrorCode.BACKEND_TIMEOUT, "The share service timed out.") from exc
        except httpx.HTTPError as exc:
            raise ServiceError(ErrorCode.BACKEND_UNAVAILABLE, "The share service is unavailable.") from exc

        if response.status_code == 413:
            raise ServiceError(ErrorCode.REQUEST_TOO_LARGE, "The framework is too large to share.")
        if response.status_code in (429, 502, 503):
            raise ServiceError(ErrorCode.BACKEND_UNAVAILABLE, "The share service is unavailable.")
        if response.status_code >= 400:
            raise ServiceError(ErrorCode.SHARE_FAILED, "Sharing the framework failed.")

        try:
            url = response.json()["url"]
        except (ValueError, KeyError, TypeError) as exc:
            raise ServiceError(ErrorCode.SHARE_FAILED, "The share service returned an unexpected shape.") from exc
        if not isinstance(url, str) or not url:
            raise ServiceError(ErrorCode.SHARE_FAILED, "The share service returned no link.")
        return url
