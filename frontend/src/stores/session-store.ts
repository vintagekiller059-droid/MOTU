// frontend/src/stores/session-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface SessionStore {
  sessions: Session[];
  currentSessionId: string | null;
  messages: Message[];

  // Actions
  setCurrentSession: (sessionId: string) => void;
  createSession: () => string;
  addMessage: (message: Message) => void;
  appendToken: (messageId: string, token: string) => void;
  finalizeMessage: (messageId: string) => void;
  loadSession: (sessionId: string) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      messages: [],

      setCurrentSession: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        set({
          currentSessionId: sessionId,
          messages: session ? [...session.messages] : [],
        });
      },

      createSession: () => {
        const id = crypto.randomUUID();
        const newSession: Session = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: id,
          messages: [],
        }));
        return id;
      },

      addMessage: (message) => {
        set((state) => {
          const updatedMessages = [...state.messages, message];
          const updatedSessions = state.sessions.map((s) =>
            s.id === state.currentSessionId
              ? { ...s, messages: updatedMessages, updatedAt: Date.now() }
              : s
          );
          return { messages: updatedMessages, sessions: updatedSessions };
        });
        console.log('[MOTU] ✓ Store updated (addMessage)');
      },

      appendToken: (messageId, token) => {
        set((state) => {
          const updatedMessages = state.messages.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: msg.content + token }
              : msg
          );
          const updatedSessions = state.sessions.map((s) =>
            s.id === state.currentSessionId
              ? { ...s, messages: updatedMessages, updatedAt: Date.now() }
              : s
          );
          return { messages: updatedMessages, sessions: updatedSessions };
        });
        console.log('[MOTU] ✓ Store updated (appendToken):', token);
      },

      finalizeMessage: (messageId) => {
        set((state) => {
          const updatedMessages = state.messages.map((msg) =>
            msg.id === messageId
              ? { ...msg, isStreaming: false }
              : msg
          );
          const updatedSessions = state.sessions.map((s) =>
            s.id === state.currentSessionId
              ? { ...s, messages: updatedMessages, updatedAt: Date.now() }
              : s
          );
          return { messages: updatedMessages, sessions: updatedSessions };
        });
        console.log('[MOTU] ✓ Store updated (finalizeMessage)');
      },

      loadSession: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session) {
          set({
            currentSessionId: sessionId,
            messages: [...session.messages],
          });
        }
      },
    }),
    { 
      name: 'motu-sessions',
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);