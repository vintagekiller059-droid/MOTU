// Typed fetch wrapper for the MOTU backend API

import type { ModelInfo, Session, SystemHealth } from '../types'

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

export { ApiError }