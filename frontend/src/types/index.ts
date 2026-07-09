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
  parameterCount: number
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
}
