# ADR-001: MOTU Architecture

## Status
Accepted

## Context
MOTU is a fully local AI companion. All data must stay on the user's machine.

## Decision
- Backend: FastAPI + Python (single package root at `backend/`)
- Frontend: React 18 + Vite + TypeScript + Tailwind
- AI: Ollama + Qwen (local LLM)
- Memory: SQLite via SQLAlchemy
- Voice: Whisper (STT) + Piper (TTS) + WebRTC VAD
- State: Zustand (frontend)
- Streaming: SSE (not WebSockets)

## Consequences
- Zero cloud dependencies
- Simple deployment (single machine)
- Easy to extend (modular services)
