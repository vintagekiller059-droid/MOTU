import { create } from "zustand";

export type OperatingMode = "idle" | "listening" | "thinking" | "speaking";

interface UIState {
  currentMode: OperatingMode;
  setMode: (mode: OperatingMode) => void;
  cpuUsage: number;
  ramUsage: number;
  updateMetrics: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentMode: "idle",
  setMode: (currentMode) => set({ currentMode }),
  cpuUsage: 1.4,
  ramUsage: 3.42,
  updateMetrics: () =>
    set((state) => {
      const scaleFactor =
        state.currentMode === "thinking"
          ? 12.5
          : state.currentMode === "speaking"
          ? 4.2
          : 1.2;
      return {
        cpuUsage: scaleFactor + Math.random() * 1.5,
        ramUsage: 3.42 + Math.random() * 0.03,
      };
    }),
}));
