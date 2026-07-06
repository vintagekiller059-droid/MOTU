import { ChatRequest, ChatChunk, Conversation, ConversationDetail, Message } from '../types/chat';

const API_BASE = '/api/v1';

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT
// ═══════════════════════════════════════════════════════════════════════════════

export async function* streamChat(request: ChatRequest): AsyncGenerator<ChatChunk> {
  const response = await fetch(`${API_BASE}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Chat request failed');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  if (!reader) throw new Error('No response body');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield data as ChatChunk;
        } catch {
          // Skip malformed lines
        }
      }
    }
  }
}

export async function getModels(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/chat/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  return data.models || [];
}

export async function checkHealth(): Promise<{ status: string; ollama: boolean }> {
  const res = await fetch(`${API_BASE}/chat/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATIONS (Memory)
// ═══════════════════════════════════════════════════════════════════════════════

export async function listConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function createConversation(title?: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title || 'New Conversation' }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return res.json();
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  const res = await fetch(`${API_BASE}/conversations/${id}`);
  if (!res.ok) throw new Error('Failed to fetch conversation');
  return res.json();
}

export async function updateConversation(id: string, title: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to update conversation');
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

export async function addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error('Failed to add message');
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE
// ═══════════════════════════════════════════════════════════════════════════════

export async function speechToText(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');

  const res = await fetch(`${API_BASE}/voice/stt`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Speech-to-text failed');
  const data = await res.json();
  return data.text;
}

export async function textToSpeech(text: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/voice/tts?text=${encodeURIComponent(text)}`, {
    method: 'POST',
  });

  if (!res.ok) throw new Error('Text-to-speech failed');
  return res.blob();
}

export async function checkVoiceHealth(): Promise<{ whisper: boolean; piper: boolean; status: string }> {
  const res = await fetch(`${API_BASE}/voice/health`);
  if (!res.ok) throw new Error('Voice health check failed');
  return res.json();
}
