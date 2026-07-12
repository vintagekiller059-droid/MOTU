import { create } from 'zustand';

interface SystemMetric {
  value: string | number;
  history: number[];
}

interface UIState {
  currentModel: string;
  ollamaStatus: 'Online' | 'Offline';
  inferenceSpeed: number;
  aiMode: 'Eco' | 'Balanced' | 'Performance' | 'Turbo' | 'Auto';
  metrics: {
    cpu: SystemMetric;
    ram: SystemMetric;
    gpu: SystemMetric;
    temp: number;
    memoryStorage: number;
  };
  setAIMode: (mode: UIState['aiMode']) => void;
  updateMetrics: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentModel: 'Llama 3.1',
  ollamaStatus: 'Online',
  inferenceSpeed: 120,
  aiMode: 'Balanced',
  metrics: {
    cpu: { value: 33.2, history: [25, 40, 35, 50, 30, 45, 33.2] },
    ram: { value: 14.8, history: [14.2, 14.5, 14.6, 14.8, 14.8] },
    gpu: { value: 60, history: [50, 55, 62, 58, 60] },
    temp: 42,
    memoryStorage: 53.2,
  },
  setAIMode: (aiMode) => set({ aiMode }),
  updateMetrics: () => set((state) => {
    const nextCpu = +(25 + Math.random() * 20).toFixed(1);
    const cpuHist = [...state.metrics.cpu.history.slice(1), nextCpu];
    return {
      metrics: {
        ...state.metrics,
        cpu: { value: nextCpu, history: cpuHist }
      }
    };
  })
}));