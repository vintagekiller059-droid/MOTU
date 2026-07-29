import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useChatStore } from '../stores/app-store';
import { useUIStore } from '../stores/ui-store';
import { apiClient } from '../lib/api-client';

// ── Memoized Message Bubble ──
// Each message only rerenders if its own text changes
// Other messages updating does NOT cause this to rerender
const MessageBubble = memo(({ msg }: { msg: { id: string; sender: 'user' | 'motu'; text: string; timestamp: string } }) => {
  const isUser = msg.sender === 'user';
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed transition-all duration-300 ${
          isUser
            ? 'bg-cyan-500/15 text-cyan-100 border border-cyan-500/30 rounded-br-none'
            : 'bg-slate-900/60 text-slate-200 border border-slate-700/40 rounded-bl-none'
        }`}
      >
        <div className="flex items-center gap-1.5 mb-1 text-[9px] text-slate-400 font-mono">
          {isUser ? (
            <svg className="w-2.5 h-2.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          ) : (
            <svg className="w-2.5 h-2.5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          )}
          {msg.sender.toUpperCase()} • {msg.timestamp}
        </div>
        <p className="whitespace-pre-wrap">{msg.text}</p>
      </div>
    </div>
  );
});
MessageBubble.displayName = 'MessageBubble';

// ── Thinking Indicator ──
// Shows inside chat as MOTU message while waiting for first token
// Automatically replaced when streaming begins
const ThinkingIndicator = memo(() => (
  <div className="flex flex-col items-start">
    <div className="max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed bg-slate-900/60 text-slate-200 border border-slate-700/40 rounded-bl-none">
      <div className="flex items-center gap-1.5 mb-1 text-[9px] text-cyan-400 font-mono">
        <svg className="w-2.5 h-2.5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
        MOTU • Thinking
      </div>
      <div className="flex items-center gap-1.5 text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-150" />
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-300" />
      </div>
    </div>
  </div>
));
ThinkingIndicator.displayName = 'ThinkingIndicator';

export const RightPanel: React.FC = () => {
  const {
    messages,
    currentSessionId,
    isStreaming,
    setMessages,
    setCurrentSessionId,
    setIsStreaming,
    addMessage,
    appendToMessage,
    setStreamingMessageId,
  } = useChatStore();

  const { setMode } = useUIStore();

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll only when user is at bottom
  // Dependency: messages.length (not messages array) = fewer rerenders
  useEffect(() => {
    if (shouldAutoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, shouldAutoScroll]);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isAtBottom);
  }, []);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userText = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    addMessage({
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: now,
    });

    setInput('');
    setIsStreaming(true);
    setMode('thinking');
    setShouldAutoScroll(true);

    try {
      const response = await fetch(apiClient.streamChatUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: userText,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMsgId: string | null = null;
      let hasReceivedToken = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.error) {
              addMessage({
                id: `error-${Date.now()}`,
                sender: 'motu',
                text: `Error: ${event.error}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
              break;
            }

            if (event.token !== undefined) {
              if (!hasReceivedToken) {
                hasReceivedToken = true;
                setMode('speaking');
                assistantMsgId = `assistant-${Date.now()}`;
                addMessage({
                  id: assistantMsgId,
                  sender: 'motu',
                  text: event.token,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
                setStreamingMessageId(assistantMsgId);
              } else {
                appendToMessage(assistantMsgId, event.token);
              }
            }

            if (event.done) {
              if (event.session_id) {
                setCurrentSessionId(event.session_id);
              }
              break;
            }
          } catch {
            // Ignore malformed lines
          }
        }
      }
    } catch (err) {
      addMessage({
        id: `error-${Date.now()}`,
        sender: 'motu',
        text: err instanceof Error ? err.message : 'Connection failed. Is the backend running?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
      setMode('idle');
    }
  }, [input, isStreaming, currentSessionId, setMode, setIsStreaming, setCurrentSessionId, setStreamingMessageId, addMessage, appendToMessage, setShouldAutoScroll]);

  return (
    <aside className="w-[360px] h-full glass-panel border-l border-cyan-500/10 flex flex-col justify-between p-5 z-20 box-border overflow-hidden">
      {/* HEADER */}
      <div className="flex-shrink-0">
        <div className="text-[10px] tracking-[0.2em] text-cyan-400 font-mono uppercase">
          MOTU Operating System
        </div>
        <h2 className="text-xl font-medium text-slate-100 tracking-tight mt-0.5 mb-3">
          Intelligent Mind
        </h2>

        <div className="space-y-2 text-xs font-mono border-b border-cyan-500/10 pb-3">
          <div className="text-[10px] uppercase text-slate-500 tracking-widest font-semibold">
            Core State
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">CURRENT STATE</span>
            <span className="text-cyan-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              IDLE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">REASONING</span>
            <span className="text-cyan-400 font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">OLLAMA NODE</span>
            <span className="text-slate-200">Online</span>
          </div>
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 my-3 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs text-center px-4">
            <div>
              <div className="text-cyan-400 mb-2 text-lg">✦</div>
              <div>Start a conversation</div>
              <div className="text-[10px] mt-1 opacity-60">Your messages are stored locally</div>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {/* Show thinking indicator ONLY after user message and before first token */}
        {isStreaming && messages[messages.length - 1]?.sender === 'user' && (
          <ThinkingIndicator />
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="flex-shrink-0 pt-2 border-t border-cyan-500/10">
        <form onSubmit={handleSend} className="relative flex items-center mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isStreaming ? 'MOTU is thinking...' : 'Command MOTU...'}
            disabled={isStreaming}
            className="w-full bg-slate-950/80 border border-cyan-500/20 focus:border-cyan-400/60 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all duration-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="absolute right-2.5 p-1 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

        <div className="glass-card rounded-xl py-2 px-3 text-[10px] font-mono text-center text-slate-400 tracking-wider uppercase border border-cyan-500/10">
          LOCAL SOVEREIGN AI ARCHITECTURE
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
