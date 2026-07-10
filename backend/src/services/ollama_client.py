"""Ollama HTTP client + streaming."""

import json
from collections.abc import AsyncGenerator

import httpx

from config import settings


class OllamaError(Exception):
    """Raised when Ollama is unreachable or returns an error."""


class OllamaClient:
    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                return resp.status_code == 200
        except httpx.HTTPError:
            return False

    async def list_models(self) -> list[dict]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPError as exc:
            raise OllamaError(f"Could not reach Ollama at {self.base_url}: {exc}") from exc

        models = []
        for m in data.get("models", []):
            details = m.get("details", {})
            models.append(
                {
                    "name": m.get("name", "unknown"),
                    "size": m.get("size", 0),
                    "parameter_count": details.get("parameter_size", ""),
                    "format": details.get("format", ""),
                }
            )
        return models

    async def chat_stream(
        self, messages: list[dict], model: str
    ) -> AsyncGenerator[str, None]:
        """Yield response tokens one at a time from Ollama's streaming chat API."""
        payload = {"model": model, "messages": messages, "stream": True}

        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream(
                    "POST", f"{self.base_url}/api/chat", json=payload
                ) as response:
                    if response.status_code != 200:
                        body = await response.aread()
                        raise OllamaError(
                            f"Ollama returned {response.status_code}: {body.decode(errors='ignore')}"
                        )

                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                        try:
                            chunk = json.loads(line)
                        except json.JSONDecodeError:
                            continue

                        if chunk.get("error"):
                            raise OllamaError(chunk["error"])

                        content = chunk.get("message", {}).get("content", "")
                        if content:
                            yield content

                        if chunk.get("done"):
                            break
        except httpx.ConnectError as exc:
            raise OllamaError(
                f"Could not connect to Ollama at {self.base_url}. Is it running?"
            ) from exc
        except httpx.HTTPError as exc:
            raise OllamaError(f"Ollama request failed: {exc}") from exc


ollama_client = OllamaClient()