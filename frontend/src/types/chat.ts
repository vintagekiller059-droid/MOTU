export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface ChatRequest {
  message: string;
  model: string;
  temperature?: number;
  conversation_id?: string;
}

export interface ChatChunk {
  content?: string;
  done?: boolean;
  error?: string;
  conversation_id?: string;
}

export interface VoiceState {
  isRecording: boolean;
  isPlaying: boolean;
  transcript: string;
}
