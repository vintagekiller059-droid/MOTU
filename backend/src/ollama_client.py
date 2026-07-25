"""Async HTTP client for local Ollama instance."""

import json
import logging
from typing import AsyncGenerator, List, Dict, Any

import httpx

from config import settings

logger = logging.getLogger(__name__)

_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=settings.OLLAMA_URL,
            timeout=httpx.Timeout(120.0, connect=5.0),
        )
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


async def check_health() -> bool:
    try:
        client = get_client()
        resp = await client.get("/api/tags", timeout=3.0)
        return resp.status_code == 200
    except Exception:
        return False


async def list_models() -> List[Dict[str, Any]]:
    client = get_client()
    resp = await client.get("/api/tags")
    resp.raise_for_status()
    data = resp.json()

    models = []
    for m in data.get("models", []):
        name = m.get("name", "unknown")
        size = m.get('size', 0)
        param_count = "unknown"
        if ":" in name:
            tag = name.split(":")[1]
            if "b" in tag.lower():
                param_count = tag.lower().replace("b", "B")
        models.append({
            "name": name,
            "size": size,
            "parameter_count": param_count,
            "format": m.get("details", {}).get("format", "gguf"),
        })
    return models


async def stream_chat(
    messages: List[Dict[str, str]],
    model: str | None = None,
) -> AsyncGenerator[str, None]:
    client = get_client()
    model = model or settings.MODEL_NAME

    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
    }

    async with client.stream("POST", "/api/chat", json=payload) as resp:
        resp.raise_for_status()
        async for line in resp.aiter_lines():
            if not line.strip():
                continue
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                logger.warning("Ollama sent invalid JSON: %s", line)
                continue

            msg = data.get("message", {})
            token = msg.get("content", "")
            if token:
                yield token

            if data.get("done"):
                break
