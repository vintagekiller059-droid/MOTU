"""
Embedding service placeholder.
Responsible for converting text chunks into dense vector representations.
"""
from typing import List


class EmbeddingService:
    """Interface for generating text embeddings using local or external models."""

    def __init__(self, model_name: str = "nomic-embed-text"):
        self.model_name = model_name

    async def embed_text(self, text: str) -> List[float]:
        """Generates a vector embedding for a given text snippet."""
        # TODO: Implement local embedding call (e.g. via Ollama / SentenceTransformers)
        raise NotImplementedError("Embedding generation not yet implemented.")

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates vector embeddings for a list of text snippets."""
        # TODO: Implement batch embedding generation
        raise NotImplementedError("Batch embedding generation not yet implemented.")