"""Text-to-Speech using Piper (local, lightweight, fast)."""
import subprocess
import tempfile
import os
from pathlib import Path
from typing import Optional

DEFAULT_MODEL_PATH = Path(__file__).parent.parent.parent.parent / "data" / "voices" / "en_US-lessac-medium.onnx"


def synthesize_speech(
    text: str,
    model_path: Optional[str] = None,
    output_path: Optional[str] = None
) -> str:
    model = model_path or str(DEFAULT_MODEL_PATH)

    if not Path(model).exists():
        raise FileNotFoundError(
            f"Piper model not found at {model}. "
            "Download from https://github.com/rhasspy/piper/releases"
        )

    if output_path is None:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            output_path = tmp.name

    cmd = ["piper", "--model", model, "--output_file", output_path]

    process = subprocess.run(
        cmd,
        input=text.encode("utf-8"),
        capture_output=True
    )

    if process.returncode != 0:
        raise RuntimeError(f"Piper TTS failed: {process.stderr.decode()}")

    return output_path


def synthesize_to_bytes(text: str, model_path: Optional[str] = None) -> bytes:
    output_path = synthesize_speech(text, model_path)
    try:
        with open(output_path, "rb") as f:
            return f.read()
    finally:
        os.unlink(output_path)
