// Memory Store — long-term memory state management

import { create } from 'zustand'
import type { MemoryEntry, MemorySearchResult } from '../types'

interface MemoryState {
  memories: MemoryEntry[]
  searchResults: MemorySearchResult[]
  loading: boolean
  error: string | null

  setMemories: (memories: MemoryEntry[]) => void
  setSearchResults: (results: MemorySearchResult[]) => void
  addMemory: (memory: MemoryEntry) => void
  removeMemory: (id: string) => void
  updateMemory: (memory: MemoryEntry) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useMemoryStore = create<MemoryState>()((set) => ({
  memories: [],
  searchResults: [],
  loading: false,
  error: null,

  setMemories: (memories) => set({ memories }),
  setSearchResults: (searchResults) => set({ searchResults }),
  addMemory: (memory) =>
    set((state) => ({ memories: [memory, ...state.memories] })),
  removeMemory: (id) =>
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    })),
  updateMemory: (memory) =>
    set((state) => ({
      memories: state.memories.map((m) => (m.id === memory.id ? memory : m)),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
