// Memory management hook — list, search, create, pin, delete

import { useCallback, useState } from 'react'
import { apiClient } from '../lib/api-client'
import { useMemoryStore } from '../stores/memory-store'
import type { MemoryEntry, MemorySearchResult } from '../types'

export function useMemory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storeSetMemories = useMemoryStore((s) => s.setMemories)
  const storeSetSearchResults = useMemoryStore((s) => s.setSearchResults)
  const storeAddMemory = useMemoryStore((s) => s.addMemory)
  const storeRemoveMemory = useMemoryStore((s) => s.removeMemory)
  const storeUpdateMemory = useMemoryStore((s) => s.updateMemory)

  const listMemories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const memories = await apiClient.listMemories()
      storeSetMemories(memories)
      return memories
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load memories.'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [storeSetMemories])

  const searchMemories = useCallback(
    async (query: string, limit?: number, entryType?: string | null) => {
      setLoading(true)
      setError(null)
      try {
        const results = await apiClient.searchMemories({
          query,
          limit,
          entryType,
        })
        storeSetSearchResults(results)
        return results
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search memories.'
        setError(message)
        return []
      } finally {
        setLoading(false)
      }
    },
    [storeSetSearchResults],
  )

  const createMemory = useCallback(
    async (params: {
      content: string
      entryType: string
      importance?: number
      source?: string
      confidence?: number
      tags?: string[]
      sourceSessionId?: string | null
      sourceMessageId?: string | null
    }) => {
      setLoading(true)
      setError(null)
      try {
        const memory = await apiClient.createMemory(params)
        storeAddMemory(memory)
        return memory
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create memory.'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [storeAddMemory],
  )

  const pinMemory = useCallback(
    async (memoryId: string, isPinned: boolean) => {
      try {
        const memory = await apiClient.pinMemory(memoryId, isPinned)
        storeUpdateMemory(memory)
        return memory
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to pin memory.'
        setError(message)
        throw err
      }
    },
    [storeUpdateMemory],
  )

  const updateImportance = useCallback(
    async (memoryId: string, importance: number) => {
      try {
        const memory = await apiClient.updateMemoryImportance(memoryId, importance)
        storeUpdateMemory(memory)
        return memory
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update importance.'
        setError(message)
        throw err
      }
    },
    [storeUpdateMemory],
  )

  const deleteMemory = useCallback(
    async (memoryId: string) => {
      try {
        await apiClient.deleteMemory(memoryId)
        storeRemoveMemory(memoryId)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete memory.'
        setError(message)
        throw err
      }
    },
    [storeRemoveMemory],
  )

  return {
    loading,
    error,
    listMemories,
    searchMemories,
    createMemory,
    pinMemory,
    updateImportance,
    deleteMemory,
  }
}
