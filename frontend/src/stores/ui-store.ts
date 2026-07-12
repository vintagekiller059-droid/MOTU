import { create } from 'zustand';

interface UIState {
  theme: 'dark' | 'light' | 'cyberpunk';
  sidebarOpen: boolean;
  inputFocused: boolean;
  settingsOpen: boolean;
  animationEnabled: boolean;
  setSettingsOpen: (open: boolean) => void;
  setInputFocused: (focused: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  sidebarOpen: false,
  inputFocused: false,
  settingsOpen: false,
  animationEnabled: true,
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setInputFocused: (inputFocused) => set({ inputFocused }),
}));