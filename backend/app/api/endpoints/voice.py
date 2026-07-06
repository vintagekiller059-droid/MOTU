"""Voice endpoints — STT + TTS."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import io

from app.services.voice.stt import transcribe_audio
from app.services.voice.tts import synthesize_to_bytes

router = router = APIRouter(tags=["voice"])


@router.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        print(f"DEBUG: Received {len(audio_bytes)} bytes, filename={audio.filename}")
        text = transcribe_audio(audio_bytes, filename=audio.filename)
        return {"text": text, "success": True}
    except Exception as e:
        import traceback
        print(f"DEBUG STT ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")


@router.post("/tts")
async def text_to_speech(text: str, model_path: Optional[str] = None):
    try:
        audio_bytes = synthesize_to_bytes(text, model_path)
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"}
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@router.get("/health")
async def voice_health():
    whisper_ok = False
    try:
        import whisper
        whisper_ok = True
    except ImportError:
        pass

    piper_ok = False
    try:
        import subprocess
        result = subprocess.run(["piper", "--version"], capture_output=True)
        piper_ok = result.returncode == 0
    except FileNotFoundError:
        pass

    return {
        "whisper": whisper_ok,
        "piper": piper_ok,
        "status": "ok" if (whisper_ok and piper_ok) else "degraded"
    }
