"""Async Ollama HTTP client."""
import httpx
import json
from typing import AsyncGenerator, List, Dict, Any

from app.core.config import settings


class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.client = httpx.AsyncClient(timeout=120.0)

    async def chat_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": temperature}
        }

        async with self.client.stream(
            "POST",
            f"{self.base_url}/api/chat",
            json=payload
        ) as response:
            async for line in response.aiter_lines():
                if line.strip():
                    try:
                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            yield data["message"]["content"]
                        if data.get("done"):
                            break
                    except json.JSONDecodeError:
                        continue

    async def list_models(self) -> List[str]:
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            data = response.json()
            return [m["name"] for m in data.get("models", [])]
        except Exception:
            return []

    async def health_check(self) -> Dict[str, Any]:
        try:
            response = await self.client.get(f"{self.base_url}/api/tags", timeout=5.0)
            return {"status": "ok", "ollama": response.status_code == 200}
        except Exception:
            return {"status": "ok", "ollama": False}
