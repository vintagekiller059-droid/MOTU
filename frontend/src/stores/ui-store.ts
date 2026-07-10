// UI Store — theme, layout, focus state
// Persisted to localStorage

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'cyberpunk'
export type PanelId = 'chat' | 'memory' | 'voice' | 'automation' | 'settings' | null

interface UIState {
  theme: Theme
  activePanel: PanelId
  inputFocused: boolean
  animationEnabled: boolean
  setTheme: (theme: Theme) => void
  setActivePanel: (panel: PanelId) => void
  togglePanel: (panel: Exclude<PanelId, null>) => void
  setInputFocused: (focused: boolean) => void
  setAnimationEnabled: (enabled: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      activePanel: null,
      inputFocused: false,
      animationEnabled: true,
      setTheme: (theme) => set({ theme }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      togglePanel: (panel) =>
        set({ activePanel: get().activePanel === panel ? null : panel }),
      setInputFocused: (focused) => set({ inputFocused: focused }),
      setAnimationEnabled: (enabled) => set({ animationEnabled: enabled }),
    }),
    {
      name: 'motu-ui-store',
      partialize: (state) => ({
        theme: state.theme,
        animationEnabled: state.animationEnabled,
      }),
    },
  ),
)