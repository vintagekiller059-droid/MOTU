// Unified application state store
// Split into 4 atomic stores to prevent unnecessary rerenders
// Each component subscribes ONLY to the state it needs

import { create } from 'zustand';

export type OperatingMode = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'motu';
  text: string;
  timestamp: string;
}

export interface SessionItem {
  id: string;
  title: string;
  model: string;
  updatedAt: string;
  messageCount: number;
}

export interface ModelItem {
  name: string;
  size: number;
  parameterCount: string;
  format: string;
}

// ── Chat Store (isolated) ──
// Only RightPanel subscribes to this
interface ChatState {
  messages: ChatMessage[];
  currentSessionId: string | null;
  isStreaming: boolean;
  streamingMessageId: string | null;
  setMessages: (messages: ChatMessage[]) => void;
  setCurrentSessionId: (id: string | null) => void;
  setIsStreaming: (v: boolean) => void;
  setStreamingMessageId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  appendToMessage: (id: string, token: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  currentSessionId: null,
  isStreaming: false,
  streamingMessageId: null,
  setMessages: (messages) => set({ messages }),
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  setIsStreaming: (v) => set({ isStreaming: v }),
  setStreamingMessageId: (id) => set({ streamingMessageId: id }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  appendToMessage: (id, token) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, text: m.text + token } : m
      ),
    })),
}));

// ── Session Store (isolated) ──
// Only Sidebar subscribes to this
interface SessionState {
  sessions: SessionItem[];
  setSessions: (sessions: SessionItem[]) => void;
  addSession: (session: SessionItem) => void;
  removeSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<SessionItem>) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    })),
  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
}));

// ── Model Store (isolated) ──
// Only Sidebar (Models tab) subscribes to this
interface ModelState {
  models: ModelItem[];
  selectedModel: string;
  setModels: (models: ModelItem[]) => void;
  setSelectedModel: (name: string) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  models: [],
  selectedModel: 'qwen2.5:1.5b',
  setModels: (models) => set({ models }),
  setSelectedModel: (name) => set({ selectedModel: name }),
}));

// ── UI Store (isolated) ──
// Sidebar, BottomCards subscribe to this (not RightPanel or AICore)
interface AppUIState {
  sidebarTab: 'sessions' | 'models' | 'settings';
  isLoading: boolean;
  error: string | null;
  backendOnline: boolean;
  ollamaOnline: boolean;
  setSidebarTab: (tab: 'sessions' | 'models' | 'settings') => void;
  setIsLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  setBackendOnline: (v: boolean) => void;
  setOllamaOnline: (v: boolean) => void;
}

export const useAppUIStore = create<AppUIState>((set) => ({
  sidebarTab: 'sessions',
  isLoading: false,
  error: null,
  backendOnline: false,
  ollamaOnline: false,
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setIsLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),
  setBackendOnline: (v) => set({ backendOnline: v }),
  setOllamaOnline: (v) => set({ ollamaOnline: v }),
}));
