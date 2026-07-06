import { create } from 'zustand';
import { Message, Conversation, VoiceState } from '../types/chat';
import { 
  listConversations, 
  createConversation, 
  deleteConversation, 
  getConversation 
} from '../services/api';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversations: Conversation[];
  currentConversationId: string | null;
  sidebarOpen: boolean;
  voice: VoiceState;

  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  loadConversations: () => Promise<void>;
  createNewConversation: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  removeConversation: (id: string) => Promise<void>;
  setCurrentConversationId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  setVoiceState: (state: Partial<VoiceState>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  conversations: [],
  currentConversationId: null,
  sidebarOpen: true,
  voice: {
    isRecording: false,
    isPlaying: false,
    transcript: '',
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [], currentConversationId: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  loadConversations: async () => {
    try {
      const conversations = await listConversations();
      set({ conversations });
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  },

  createNewConversation: async () => {
    try {
      const conversation = await createConversation();
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversationId: conversation.id,
        messages: [],
      }));
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  },

  selectConversation: async (id) => {
    try {
      const detail = await getConversation(id);
      set({
        currentConversationId: id,
        messages: detail.messages,
      });
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  },

  removeConversation: async (id) => {
    try {
      await deleteConversation(id);
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
        messages: state.currentConversationId === id ? [] : state.messages,
      }));
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  },

  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setVoiceState: (voiceState) => set((state) => ({ 
    voice: { ...state.voice, ...voiceState } 
  })),
}));
