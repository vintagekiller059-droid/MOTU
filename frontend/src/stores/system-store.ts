import { create } from 'zustand';

interface SystemState {
  connected: boolean;
  cpuUsage: number;
  ramUsage: number;
  modelName: string;
  version: string;
  setMetrics: (cpu: number, ram: number) => void;
  setConnected: (status: boolean) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  connected: true,
  cpuUsage: 0,
  ramUsage: 0,
  modelName: 'llama3.1',
  version: 'v1.0',
  setMetrics: (cpuUsage, ramUsage) => set({ cpuUsage, ramUsage }),
  setConnected: (connected) => set({ connected }),
}));