import { useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import ConversationSidebar from '../components/ConversationSidebar';
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import TTSButton from '../components/TTSButton';

export default function ChatPage() {
  const { messages, isLoading, error, loadConversations } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-slate-950">
      <ConversationSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-900 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-300">Welcome to MOTU</p>
              <p className="text-sm mt-1">Start a conversation, speak, or select one from the sidebar.</p>
              <div className="flex items-center gap-4 mt-6 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Push-to-talk
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Read aloud
                </span>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="group">
                <ChatMessage message={msg} />
                {msg.role === 'assistant' && (
                  <div className="flex justify-start mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TTSButton text={msg.content} />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-sm px-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              MOTU is thinking...
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput />
      </div>
    </div>
  );
}
