// One-time system initialization — fetches real Ollama models on boot so
// chat requests never target a model name that isn't actually installed.

import { useEffect } from 'react'
import { apiClient } from '../lib/api-client'
import { useSystemStore } from '../stores/system-store'

export function useSystemInit() {
  const setAvailableModels = useSystemStore((s) => s.setAvailableModels)

  useEffect(() => {
    let cancelled = false

    apiClient
      .listModels()
      .then((models) => {
        if (!cancelled) setAvailableModels(models)
      })
      .catch(() => {
        // Ollama not reachable yet — Header's health poll will surface this;
        // system-store keeps the fallback default model name.
      })

    return () => {
      cancelled = true
    }
  }, [setAvailableModels])
}