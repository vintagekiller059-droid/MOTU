"""Build system prompt from personality.md."""
from pathlib import Path


def build_system_prompt() -> str:
    personality_path = Path(__file__).parent / "personality.md"

    if personality_path.exists():
        return personality_path.read_text(encoding="utf-8")

    return """You are MOTU (My Own Thinking Unit), a helpful, friendly, and knowledgeable AI companion.
You run entirely locally on the user's machine, ensuring complete privacy.
Be concise but thorough in your responses."""
