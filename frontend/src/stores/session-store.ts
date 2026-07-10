// Session Store — current conversation state
// Ephemeral — no persistence (conversations live in SQLite; this is a view)

import { create } from 'zustand'
import type { Message } from '../types'

interface SessionState {
  sessionId: string | null
  messages: Message[]
  isStreaming: boolean
  streamingContent: string
  error: string | null

  setSessionId: (id: string | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  startStreaming: () => void
  appendStreamToken: (token: string) => void
  finishStreaming: (messageId: string) => void
  setError: (error: string | null) => void
  resetSession: () => void
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  sessionId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  error: null,

  setSessionId: (id) => set({ sessionId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set({ messages: [...get().messages, message] }),

  startStreaming: () => set({ isStreaming: true, streamingContent: '', error: null }),
  appendStreamToken: (token) =>
    set({ streamingContent: get().streamingContent + token }),
  finishStreaming: (messageId) => {
    const content = get().streamingContent
    const sessionId = get().sessionId
    if (content && sessionId) {
      set({
        messages: [
          ...get().messages,
          {
            id: messageId,
            sessionId,
            role: 'assistant',
            content,
            createdAt: new Date().toISOString(),
          },
        ],
        isStreaming: false,
        streamingContent: '',
      })
    } else {
      set({ isStreaming: false, streamingContent: '' })
    }
  },

  setError: (error) => set({ error, isStreaming: false }),
  resetSession: () =>
    set({ sessionId: null, messages: [], isStreaming: false, streamingContent: '', error: null }),
}))