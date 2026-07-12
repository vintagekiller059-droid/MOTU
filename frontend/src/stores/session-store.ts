import { create } from 'zustand';

// Enforced strict role mapping types directly inside the core State interfaces
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface SessionState {
  messages: Message[];
  sessionId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  setSessionId: (id: string | null) => void;
  addMessage: (msg: Message) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  messages: [],
  sessionId: null,
  isStreaming: false,
  streamingContent: '',
  error: null,
  setSessionId: (sessionId) => set({ sessionId }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearSession: () => set({ messages: [], sessionId: null, streamingContent: '', error: null }),
}));