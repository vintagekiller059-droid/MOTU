# MOTU — My Own Thinking Unit

A fully local, private AI companion that runs on your own hardware.

## Quick Start

```bash
# 1. Start Ollama (ensure Qwen is pulled)
ollama pull qwen2.5:1.5b

# 2. Start Backend (from the backend/ directory)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. Start Frontend (new terminal, from the frontend/ directory)
cd frontend
npm install
npm run dev
```

## Project Structure

```
MOTU/
├── backend/              ← Python package root
│   ├── app/              ← FastAPI application
│   │   ├── api/          ← Route handlers (chat, memory, voice)
│   │   ├── core/         ← Config, security
│   │   ├── models/       ← Pydantic schemas
│   │   ├── services/     ← Business logic (Ollama, STT, TTS, VAD)
│   │   ├── db/           ← SQLAlchemy ORM + SQLite
│   │   └── main.py       ← App entry point
│   ├── ai/               ← Personality, prompts
│   ├── data/             ← SQLite database + voice models
│   ├── requirements.txt
│   └── .env              ← Local config
│
├── frontend/             ← React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   ← Reusable UI pieces
│   │   ├── pages/        ← Screens
│   │   ├── stores/       ← Zustand state
│   │   ├── services/     ← API calls
│   │   ├── types/        ← TypeScript interfaces
│   │   └── utils/        ← Helpers (uuid, date)
│   └── package.json
│
└── docs/                 ← Architecture decisions, roadmap
```

## Running the Backend

**IMPORTANT**: Always run uvicorn from the `backend/` directory:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The `backend/` directory is the Python package root. All imports are absolute
relative to this directory (e.g., `from app.core.config import settings`).

## Architecture Principles

1. **Single Python Package Root**: `backend/` is the only package root. All
   Python code lives inside it. No `sys.path` hacks.
2. **Absolute Imports Only**: Every module uses `from app.xxx` or `from ai.xxx`.
3. **Frontend Independence**: Frontend is not a Python package. It communicates
   with backend via HTTP API only.
4. **Privacy First**: Nothing leaves your laptop unless you choose.
5. **Modular**: Swap any component without breaking the system.

## Versions

- **v1** — Local chat with modern UI ✅
- **v2** — Conversation memory (SQLite) ✅
- **v3** — Voice (STT + TTS) ✅
- **v4** — Vision (webcam + image understanding)
- **v5** — 3D avatar
- **v6** — Autonomous conversations
- **v7** — Personal assistant features

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 18 + Vite + TS + Tailwind | Fast, typed, modern styling |
| State | Zustand | Lightweight, no boilerplate |
| Backend | FastAPI + Python | Async, typed, great AI ecosystem |
| AI | Ollama + Qwen | Local, private, capable |
| Memory | SQLite + SQLAlchemy | Zero-config, single file |
| Speech | Whisper (STT) + Piper TTS | Fully offline voice |
| VAD | WebRTC VAD | Lightweight speech detection |

## Voice Setup (v3)

### Whisper (STT)
Already included via `openai-whisper` in requirements. First run will download the model (~150MB for "base").

### Piper (TTS)
1. Download Piper from: https://github.com/rhasspy/piper/releases
2. Extract and add `piper` to your PATH
3. Download a voice model (e.g., `en_US-lessac-medium.onnx`)
4. Place it in `backend/data/voices/`

### Test Voice
```bash
curl -X POST "http://localhost:8000/api/v1/voice/stt" -F "audio=@test.wav"
curl -X POST "http://localhost:8000/api/v1/voice/tts?text=Hello+from+MOTU" --output speech.wav
```
