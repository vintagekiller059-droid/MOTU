# MOTU — My Own Thinking Unit

System Architecture Design v2.0 (Revised) | July 2026

## Project Structure

```
MOTU/
├── frontend/          # React 19 + Vite + TypeScript + Tailwind v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # AppShell, Header, Workspace, FloatingDock
│   │   │   ├── chat/        # MessageStream, MessageBubble, InputOrbit, etc.
│   │   │   ├── ui/          # Button, GlassCard, Icon primitives
│   │   │   └── settings/    # SettingsPanel
│   │   ├── hooks/           # useWebSocket, useStreaming, useSessions, useKeyboard
│   │   ├── stores/          # ui-store, session-store, system-store (Zustand)
│   │   ├── styles/          # tokens.css, themes.css, animations.css
│   │   ├── lib/             # api-client, streaming-parser
│   │   ├── types/           # Shared TypeScript types
│   │   ├── design-system/   # Central design tokens export
│   │   ├── constants/       # App constants
│   │   └── shared/          # Common utilities
│   ├── public/
│   │   ├── fonts/           # Inter, JetBrains Mono
│   │   └── sounds/          # notification.mp3
│   └── config files         # vite, tsconfig, eslint, prettier, etc.
│
├── backend/           # FastAPI + SQLAlchemy + SQLite
│   ├── src/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Pydantic settings
│   │   ├── dependencies.py  # Dependency injection
│   │   ├── routers/         # chat, sessions, models, settings
│   │   ├── services/        # ChatService, SessionService, OllamaClient
│   │   ├── models/          # Pydantic schemas, SQLAlchemy models
│   │   ├── database/        # connection, migrations, seeds
│   │   └── utils/           # logger, validators
│   ├── tests/
│   ├── pyproject.toml
│   └── requirements.txt
│
├── assets/            # Ollama model storage, fonts, etc.
├── config/            # Environment configs, Ollama model configs
├── scripts/           # setup.ps1, dev.ps1
├── docs/              # Architecture docs, sprint reports
├── .gitignore
└── README.md
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend (future)
```bash
cd backend
pip install -r requirements.txt
python src/main.py
```

## Architecture

- **Presentation Layer**: React 19 + Vite + Tailwind CSS v4 + Framer Motion
- **Gateway Layer**: FastAPI — HTTP REST + WebSocket (future)
- **Service Layer**: Chat Service — business logic
- **AI Layer**: Ollama — local LLM inference
- **Data Layer**: SQLite — conversations, config, meta

## Status

Phase 1 — Sprint 1: Project Bootstrap (FE-001) ✅
