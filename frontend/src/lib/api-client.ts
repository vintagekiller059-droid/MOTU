// Typed fetch wrapper for the MOTU backend API

import type { MemoryEntry, MemorySearchResult, ModelInfo, Session, SystemHealth } from '../types'

const BASE_URL = 'http://localhost:8000/api/v1'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...init,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(body.detail || response.statusText, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const apiClient = {
  health: () =>
    request<{
      status: 'ok' | 'error'
      version: string
      uptime: number
      cpu_percent: number
      memory_percent: number
      memory_used_gb: number
      ollama_connected: boolean
    }>('/health').then(
      (r): SystemHealth => ({
        status: r.status,
        version: r.version,
        uptime: r.uptime,
        cpuPercent: r.cpu_percent,
        memoryPercent: r.memory_percent,
        memoryUsedGb: r.memory_used_gb,
        ollamaConnected: r.ollama_connected,
      }),
    ),

  sendMessage: (params: { sessionId?: string; message: string; model?: string }) =>
    request<{ session_id: string; message_id: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        session_id: params.sessionId,
        message: params.message,
        model: params.model,
      }),
    }),

  streamUrl: (sessionId: string, model?: string) => {
    const params = new URLSearchParams({ session_id: sessionId })
    if (model) params.set('model', model)
    return `${BASE_URL}/chat/stream?${params.toString()}`
  },

  listSessions: () =>
    request<{ sessions: RawSession[] }>('/sessions').then((r) =>
      r.sessions.map(mapSession),
    ),

  createSession: (params?: { title?: string; model?: string }) =>
    request<RawSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(params ?? {}),
    }).then(mapSession),

  getSession: (sessionId: string) =>
    request<{
      id: string
      title: string
      model: string
      created_at: string
      updated_at: string
      messages: Array<{
        id: string
        session_id: string
        role: 'user' | 'assistant' | 'system'
        content: string
        created_at: string
      }>
    }>(`/sessions/${sessionId}`),

  deleteSession: (sessionId: string) =>
    request<void>(`/sessions/${sessionId}`, { method: 'DELETE' }),

  listModels: () =>
    request<{ models: RawModel[] }>('/models').then((r) => r.models.map(mapModel)),

  // ─────────────────────────────────────────────────────────
  // Memory API
  // ─────────────────────────────────────────────────────────

  listMemories: () =>
    request<{ memories: RawMemoryEntry[] }>('/memory').then((r) =>
      r.memories.map(mapMemoryEntry),
    ),

  createMemory: (params: {
    content: string
    entryType: string
    importance?: number
    source?: string
    confidence?: number
    tags?: string[]
    sourceSessionId?: string | null
    sourceMessageId?: string | null
  }) =>
    request<RawMemoryEntry>('/memory', {
      method: 'POST',
      body: JSON.stringify({
        content: params.content,
        entry_type: params.entryType,
        importance: params.importance ?? 50,
        source: params.source ?? 'user',
        confidence: params.confidence ?? 1.0,
        tags: params.tags ?? [],
        source_session_id: params.sourceSessionId ?? null,
        source_message_id: params.sourceMessageId ?? null,
      }),
    }).then(mapMemoryEntry),

  searchMemories: (params: { query: string; limit?: number; entryType?: string | null }) =>
    request<{ results: Array<{ entry: RawMemoryEntry; score: number }> }>('/memory/search', {
      method: 'POST',
      body: JSON.stringify({
        query: params.query,
        limit: params.limit ?? 10,
        entry_type: params.entryType ?? null,
      }),
    }).then((r) =>
      r.results.map((res) => ({
        entry: mapMemoryEntry(res.entry),
        score: res.score,
      })),
    ),

  pinMemory: (memoryId: string, isPinned: boolean) =>
    request<RawMemoryEntry>(`/memory/${memoryId}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ is_pinned: isPinned }),
    }).then(mapMemoryEntry),

  updateMemoryImportance: (memoryId: string, importance: number) =>
    request<RawMemoryEntry>(`/memory/${memoryId}/importance`, {
      method: 'PATCH',
      body: JSON.stringify({ importance }),
    }).then(mapMemoryEntry),

  deleteMemory: (memoryId: string) =>
    request<void>(`/memory/${memoryId}`, { method: 'DELETE' }),
}

interface RawSession {
  id: string
  title: string
  model: string
  created_at: string
  updated_at: string
  message_count: number
}

function mapSession(raw: RawSession): Session {
  return {
    id: raw.id,
    title: raw.title,
    model: raw.model,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    messageCount: raw.message_count,
  }
}

interface RawModel {
  name: string
  size: number
  parameter_count: string
  format: string
}

function mapModel(raw: RawModel): ModelInfo {
  return {
    name: raw.name,
    size: raw.size,
    parameterCount: raw.parameter_count,
    format: raw.format,
  }
}

interface RawMemoryEntry {
  id: string
  content: string
  entry_type: string
  importance: number
  source: string
  schema_version: number
  fingerprint: string
  source_session_id: string | null
  source_message_id: string | null
  confidence: number
  is_pinned: boolean
  access_count: number
  created_at: string
  updated_at: string
  last_accessed_at: string | null
  tags: string[]
}

function mapMemoryEntry(raw: RawMemoryEntry): MemoryEntry {
  return {
    id: raw.id,
    content: raw.content,
    entryType: raw.entry_type,
    importance: raw.importance,
    source: raw.source,
    schemaVersion: raw.schema_version,
    fingerprint: raw.fingerprint,
    sourceSessionId: raw.source_session_id,
    sourceMessageId: raw.source_message_id,
    confidence: raw.confidence,
    isPinned: raw.is_pinned,
    accessCount: raw.access_count,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    lastAccessedAt: raw.last_accessed_at,
    tags: raw.tags,
  }
}

export { ApiError }
