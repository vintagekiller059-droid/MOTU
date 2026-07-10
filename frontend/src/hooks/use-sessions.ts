// Conversation management — create, load, and delete sessions

import { useCallback, useState } from 'react'
import { apiClient } from '../lib/api-client'
import { useSessionStore } from '../stores/session-store'
import type { Message, Session } from '../types'

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)

  const { setSessionId, setMessages, resetSession } = useSessionStore()

  const refreshSessions = useCallback(async () => {
    setLoading(true)
    try {
      const list = await apiClient.listSessions()
      setSessions(list)
    } finally {
      setLoading(false)
    }
  }, [])

  const startNewSession = useCallback(() => {
    resetSession()
  }, [resetSession])

  const loadSession = useCallback(
    async (sessionId: string) => {
      const detail = await apiClient.getSession(sessionId)
      setSessionId(detail.id)
      setMessages(
        detail.messages.map(
          (m): Message => ({
            id: m.id,
            sessionId: m.session_id,
            role: m.role,
            content: m.content,
            createdAt: m.created_at,
          }),
        ),
      )
    },
    [setSessionId, setMessages],
  )

  const removeSession = useCallback(
    async (sessionId: string) => {
      await apiClient.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    },
    [],
  )

  return { sessions, loading, refreshSessions, startNewSession, loadSession, removeSession }
}