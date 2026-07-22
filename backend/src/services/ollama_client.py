"""Asynchronous client service for interacting with the local Ollama node with connection pooling."""

import json
from typing import AsyncGenerator, Dict, Any, List, Optional
import httpx
from src.config import settings
from src.utils.logger import setup_logger

logger = setup_logger("OllamaClient")


class OllamaClient:
    """Handles persistent HTTP communications, streaming, and model inspection with Ollama."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_URL).rstrip("/")
        self._client: Optional[httpx.AsyncClient] = None

    def _get_client(self) -> httpx.AsyncClient:
        """Returns or creates a persistent HTTP async client with custom timeouts."""
        if self._client is None or self._client.is_closed:
            timeout = httpx.Timeout(connect=5.0, read=300.0, write=300.0, pool=10.0)
            limits = httpx.Limits(max_keepalive_connections=20, max_connections=50)
            self._client = httpx.AsyncClient(
                base_url=self.base_url, 
                timeout=timeout, 
                limits=limits
            )
        return self._client

    async def close(self):
        """Cleanly closes persistent client connections."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            logger.info("Ollama HTTP persistent client closed.")

    async def check_health(self) -> bool:
        """Verifies if the local Ollama process is reachable."""
        try:
            client = self._get_client()
            response = await client.get("/")
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
            return False

    async def list_models(self) -> List[Dict[str, Any]]:
        """Fetches all locally installed models from Ollama."""
        try:
            client = self._get_client()
            response = await client.get("/api/tags")
            if response.status_code == 200:
                data = response.json()
                return data.get("models", [])
            logger.error(f"Failed to fetch models. Status: {response.status_code}")
            return []
        except Exception as e:
            logger.error(f"Error connecting to Ollama on /api/tags: {e}")
            return []

    async def generate_stream(
        self, 
        prompt: str, 
        model: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Streams generation tokens asynchronously with disconnection fault-tolerance."""
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True,
            "options": {"temperature": temperature}
        }
        if system_prompt:
            payload["system"] = system_prompt

        client = self._get_client()

        try:
            async with client.stream("POST", "/api/generate", json=payload) as response:
                if response.status_code != 200:
                    yield f"[Error: Ollama status {response.status_code}]"
                    return

                async for line in response.aiter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            token = chunk.get("response", "")
                            if token:
                                yield token
                        except json.JSONDecodeError:
                            continue
        except (httpx.TransportError, httpx.HTTPError) as e:
            logger.error(f"Ollama connection dropped during generation: {e}")
            yield "\n[Error: Ollama service disconnected mid-generation]"
        except Exception as e:
            logger.error(f"Unexpected streaming exception: {e}")
            yield f"\n[Stream Error: {str(e)}]"


ollama_client = OllamaClient()