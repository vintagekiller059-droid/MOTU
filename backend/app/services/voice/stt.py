"""Speech-to-Text using OpenAI Whisper (local)."""
import whisper
import tempfile
import os
from pathlib import Path
from typing import Optional

_model = None


def _get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("base")
    return _model


def transcribe_audio(audio_bytes: bytes, filename: Optional[str] = None) -> str:
    suffix = Path(filename).suffix if filename else ".wav"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = _get_model()
        result = model.transcribe(tmp_path, language="en", fp16=False)
        return result["text"].strip()
    finally:
        os.unlink(tmp_path)


def transcribe_file(file_path: str) -> str:
    model = _get_model()
    result = model.transcribe(file_path, language="en", fp16=False)
    return result["text"].strip()
