import { create } from 'zustand';

export type OperatingMode = 'idle' | 'listening' | 'thinking' | 'speaking';

interface Message {
  id: string;
  sender: 'user' | 'motu';
  text: string;
  timestamp: string;
}

interface UIState {
  currentMode: OperatingMode;
  setMode: (mode: OperatingMode) => void;
  cpuUsage: number;
  ramUsage: number;
  messages: Message[];
  addMessage: (sender: 'user' | 'motu', text: string) => void;
  updateMetrics: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentMode: 'idle',
  setMode: (currentMode) => set({ currentMode }),
  cpuUsage: 1.4,
  ramUsage: 3.42,
  messages: [
    {
      id: 'init',
      sender: 'motu',
      text: 'Consciousness initialized. I am online, entirely private, and running locally. How shall we expand our reasoning matrix today?',
      timestamp: '10:26 PM'
    }
  ],
  addMessage: (sender, text) => set((state) => ({
    messages: [
      ...state.messages,
      {
        id: Math.random().toString(36).substring(7),
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  })),
  updateMetrics: () => set((state) => {
    const scaleFactor = state.currentMode === 'thinking' ? 12.5 : state.currentMode === 'speaking' ? 4.2 : 1.2;
    return {
      cpuUsage: scaleFactor + Math.random() * 1.5,
      ramUsage: 3.42 + Math.random() * 0.03
    };
  })
}));