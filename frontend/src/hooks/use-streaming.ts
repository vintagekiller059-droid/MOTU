// Token stream consumer — owns the send-message + SSE streaming flow

import { useCallback, useRef } from 'react'
import { apiClient, ApiError } from '../lib/api-client'
import { consumeChatStream } from '../lib/streaming-parser'
import { useSessionStore } from '../stores/session-store'
import { useSystemStore } from '../stores/system-store'

export function useStreaming() {
  const abortRef = useRef<(() => void) | null>(null)

  const {
    sessionId,
    setSessionId,
    addMessage,
    startStreaming,
    appendStreamToken,
    finishStreaming,
    setError,
    isStreaming,
  } = useSessionStore()

  const modelName = useSystemStore((s) => s.modelName)

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      addMessage({
        id: `local-${Date.now()}`,
        sessionId: sessionId ?? '',
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      })

      try {
        const { session_id } = await apiClient.sendMessage({
          sessionId: sessionId ?? undefined,
          message: trimmed,
          model: modelName,
        })

        if (session_id !== sessionId) {
          setSessionId(session_id)
        }

        startStreaming()

        const abort = consumeChatStream(apiClient.streamUrl(session_id, modelName), {
          onToken: appendStreamToken,
          onDone: finishStreaming,
          onError: (code, message) => setError(`${code}: ${message}`),
        })
        abortRef.current = abort
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to send message.'
        setError(message)
      }
    },
    [
      sessionId,
      isStreaming,
      modelName,
      addMessage,
      setSessionId,
      startStreaming,
      appendStreamToken,
      finishStreaming,
      setError,
    ],
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.()
    abortRef.current = null
  }, [])

  return { sendMessage, stopStreaming }
}