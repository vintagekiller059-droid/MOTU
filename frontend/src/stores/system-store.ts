import { create } from 'zustand';

interface SystemState {
  connected: boolean;
  cpuUsage: number;
  ramUsage: number;
  modelName: string;
  version: string;
  backendOnline: boolean;
  ollamaOnline: boolean;
  setMetrics: (cpu: number, ram: number) => void;
  setConnected: (status: boolean) => void;
  setBackendOnline: (online: boolean) => void;
  setOllamaOnline: (online: boolean) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  connected: true,
  cpuUsage: 0,
  ramUsage: 0,
  modelName: 'llama3.1',
  version: 'v1.0',
  backendOnline: false,
  ollamaOnline: false,
  setMetrics: (cpuUsage, ramUsage) => set({ cpuUsage, ramUsage }),
  setConnected: (connected) => set({ connected }),
  setBackendOnline: (backendOnline) => set({ backendOnline }),
  setOllamaOnline: (ollamaOnline) => set({ ollamaOnline }),
}));