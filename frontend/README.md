# MOTU Frontend

**My Own Thinking Unit** — Phase 1 Frontend Bootstrap

## Architecture

- React 19 + Vite + TypeScript 5.5 (strict)
- Tailwind CSS v4
- Framer Motion + CSS keyframes
- Lucide React icons
- Glassmorphism UI (CSS only, no WebGL)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build

```bash
npm run build
```

### Lint & Format

```bash
npm run lint
npm run format
```

## Design Principles

1. **No chat bubbles** — Glass cards with subtle borders
2. **No avatars** — Small indicator dots only (user=blue, AI=cyan)
3. **No sidebar** — Command palette (Cmd+K) for conversation list
4. **No scrollbars** — Custom thin scrollbar or auto-hide
5. **No loading spinners** — Pulsing orbital dot or typing wave
6. **No alert banners** — Subtle status bar color shifts
7. **Keyboard-first** — Every action has a shortcut

## Performance Rules

- React.memo on MessageBubble
- GPU-friendly animations only (transform + opacity)
- CSS animations paused when tab hidden
- Debounced input (150ms)
- Lazy-loaded routes
- No setState in loops — Batch streaming tokens every 50ms

## Current Status

Bootstrap complete. All placeholder components and hooks are in place.
Waiting for FE-002 approval to proceed.
