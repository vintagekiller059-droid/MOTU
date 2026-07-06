import { useState, useRef, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { streamChat } from '../services/api';
import { generateUUID } from '../utils/uuid';
import VoiceButton from './VoiceButton';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const { addMessage, setLoading, setError, currentConversationId, createNewConversation } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async () => {
    const message = input.trim();
    if (!message) return;

    setInput('');
    setLoading(true);
    setError(null);

    let conversationId = currentConversationId;
    if (!conversationId) {
      await createNewConversation();
      conversationId = useChatStore.getState().currentConversationId;
    }

    const userMsg = {
      id: generateUUID(),
      conversation_id: conversationId!,
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);

    const assistantMsgId = generateUUID();
    let assistantContent = '';

    try {
      abortRef.current = new AbortController();

      for await (const chunk of streamChat({
        message,
        model: 'qwen2.5:1.5b',
        conversation_id: conversationId!,
      })) {
        if (chunk.error) throw new Error(chunk.error);

        if (chunk.content) {
          assistantContent += chunk.content;
          const currentMessages = useChatStore.getState().messages;
          const lastMsg = currentMessages[currentMessages.length - 1];

          if (lastMsg?.role === 'assistant' && lastMsg.id === assistantMsgId) {
            useChatStore.setState({
              messages: currentMessages.map((m) =>
                m.id === assistantMsgId ? { ...m, content: assistantContent } : m
              ),
            });
          } else {
            addMessage({
              id: assistantMsgId,
              conversation_id: conversationId!,
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date().toISOString(),
              model: 'qwen2.5',
            });
          }
        }

        if (chunk.done) break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, currentConversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAutoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="border-t border-slate-800 p-4 bg-slate-950">
      <div className="max-w-3xl mx-auto relative flex items-end gap-2">
        <VoiceButton onTranscript={(text) => setInput((prev) => prev + text)} />
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); handleAutoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Message MOTU..."
            rows={1}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-12
                       text-slate-200 placeholder-slate-500 resize-none
                       focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20
                       transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="absolute right-3 bottom-3 p-1.5 rounded-lg
                       bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500
                       text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
