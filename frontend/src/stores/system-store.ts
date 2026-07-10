// System Store — connection, health, module status
// Ephemeral — refreshed on mount via /health polling

import { create } from 'zustand'
import type { ModelInfo } from '../types'

interface SystemState {
  connected: boolean
  cpuPercent: number
  ramGb: number
  modelName: string
  version: string
  ollamaConnected: boolean
  availableModels: ModelInfo[]
  setHealth: (health: {
    cpuPercent: number
    ramGb: number
    version: string
    ollamaConnected: boolean
  }) => void
  setModelName: (name: string) => void
  setConnected: (connected: boolean) => void
  setAvailableModels: (models: ModelInfo[]) => void
}

export const useSystemStore = create<SystemState>()((set, get) => ({
  connected: false,
  cpuPercent: 0,
  ramGb: 0,
  modelName: 'llama3.1',
  version: '1.0.0',
  ollamaConnected: false,
  availableModels: [],
  setHealth: ({ cpuPercent, ramGb, version, ollamaConnected }) =>
    set({ cpuPercent, ramGb, version, ollamaConnected, connected: true }),
  setModelName: (modelName) => set({ modelName }),
  setConnected: (connected) => set({ connected }),
  setAvailableModels: (availableModels) => {
    set({ availableModels })
    // If the currently selected model isn't actually installed, fall back
    // to the first model Ollama reports so chat requests don't 404.
    const current = get().modelName
    const stillValid = availableModels.some((m) => m.name === current)
    if (!stillValid && availableModels.length > 0) {
      set({ modelName: availableModels[0].name })
    }
  },
}))