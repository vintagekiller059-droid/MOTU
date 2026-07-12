export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

export interface Session {
  id: string
  title: string
  model: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

export interface ModelInfo {
  name: string
  size: number
  parameterCount: string
  format: string
}

export interface Settings {
  theme: 'dark' | 'light' | 'cyberpunk'
  modelDefault: string
  maxTokens: number
  temperature: number
}

export interface SystemHealth {
  status: 'ok' | 'error'
  version: string
  uptime: number
  cpuPercent: number
  memoryPercent: number
  memoryUsedGb: number
  ollamaConnected: boolean
}

export interface MemoryEntry {
  id: string
  content: string
  entryType: string
  importance: number
  source: string
  schemaVersion: number
  fingerprint: string
  sourceSessionId: string | null
  sourceMessageId: string | null
  confidence: number
  isPinned: boolean
  accessCount: number
  createdAt: string
  updatedAt: string
  lastAccessedAt: string | null
  tags: string[]
}

export interface MemorySearchResult {
  entry: MemoryEntry
  score: number
}
