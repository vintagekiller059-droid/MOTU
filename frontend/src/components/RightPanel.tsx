import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useChatStore } from '../stores/app-store';
import { useUIStore } from '../stores/ui-store';
import { useSystemStore } from '../stores/system-store';
import { apiClient } from '../lib/api-client';
import { useCoreStore } from '../stores/core-store';

// ── Memoized Message Bubble ──
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

// ── Suggestion Card ──
const SuggestionCard = memo(({ icon, text, onClick }: { icon: string; text: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 text-left w-full"
  >
    <span className="text-xs">{icon}</span>
    <span className="text-[10px] text-slate-400">{text}</span>
  </button>
));
SuggestionCard.displayName = 'SuggestionCard';

// ── Status Row ──
const StatusRow = memo(({ label, value, online }: { label: string; value: string; online?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-400 text-[10px]">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={`text-[10px] font-medium ${online === undefined ? 'text-cyan-400' : online ? 'text-emerald-400' : 'text-red-400'}`}>
        {value}
      </span>
      {online !== undefined && (
        <div className={`w-1 h-1 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      )}
    </div>
  </div>
));
StatusRow.displayName = 'StatusRow';

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

  const { setMode, backendOnline, ollamaOnline } = useUIStore();
  const { setActiveModules, setPhase, reset: resetCore } = useCoreStore();
  const { cpuUsage, ramUsage } = useSystemStore();

  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSendingRef = useRef(false);

  // Auto-focus when not streaming
  useEffect(() => {
    if (!isStreaming && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  // Auto-scroll
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

    const handleSend = useCallback(async () => {
    // Prevent double submission
    if (isSendingRef.current) return;
    if (!input.trim() || isStreaming) return;

    isSendingRef.current = true;
    const userText = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Clear input and reset height
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    // Add user message
    addMessage({
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: now,
    });

    setIsStreaming(true);
    setMode('thinking');
    setShouldAutoScroll(true);

    // Create abort controller for this stream
    abortControllerRef.current = new AbortController();

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
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

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

            // ── BACKEND-DRIVEN PHASE EVENTS ──
            if (event.phase) {
              setPhase(event.phase);
              if (event.phase === 'activating' && event.modules) {
                setActiveModules(event.modules);
                console.log('[MOTU] Backend modules:', event.modules, 'reasoning:', event.reasoning);
              }
              if (event.phase === 'transmitting' || event.phase === 'core-processing') {
                setMode('thinking');
              }
              if (event.phase === 'answering') {
                setMode('speaking');
              }
              if (event.phase === 'idle') {
                setMode('idle');
                resetCore();
              }
              continue;
            }

            // ── ERROR ──
            if (event.error) {
              addMessage({
                id: `error-${Date.now()}`,
                sender: 'motu',
                text: `Error: ${event.error}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
              break;
            }

            // ── TOKEN ──
            if (event.token !== undefined && event.token !== null) {
              if (!hasReceivedToken) {
                hasReceivedToken = true;
                setMode('speaking');
                setPhase('answering');
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

            // ── DONE ──
            if (event.done) {
              if (event.session_id) {
                setCurrentSessionId(event.session_id);
              }
              if (event.timings) {
                console.log('[MOTU] Backend timings:', event.timings);
              }
              break;
            }
          } catch {
            // Ignore malformed lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      addMessage({
        id: `error-${Date.now()}`,
        sender: 'motu',
        text: err instanceof Error ? err.message : 'Connection failed. Is the backend running?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      isSendingRef.current = false;
      abortControllerRef.current = null;
      setIsStreaming(false);
      setStreamingMessageId(null);
      setMode('idle');
      resetCore();
    }
  }, [input, isStreaming, currentSessionId, setMode, setIsStreaming, setCurrentSessionId, setStreamingMessageId, addMessage, appendToMessage, setShouldAutoScroll, setActiveModules, setPhase, resetCore]);
  // Handle suggestion click
  const handleSuggestion = useCallback((text: string) => {
    setInput(text);
    inputRef.current?.focus();
  }, []);

  // Handle textarea input with auto-resize
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Determine if we should show thinking indicator
  const showThinking = isStreaming && messages.length > 0 && messages[messages.length - 1].sender === 'user';

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

        {/* SYSTEM STATUS */}
        <div className="space-y-1.5 text-[10px] font-mono border-b border-cyan-500/10 pb-3 mb-3">
          <div className="text-[10px] uppercase text-slate-500 tracking-widest font-semibold mb-2">
            System Status
          </div>
          <StatusRow label="CPU" value={`${cpuUsage.toFixed(1)}%`} online={cpuUsage > 0} />
          <StatusRow label="RAM" value={`${ramUsage.toFixed(1)}%`} online={ramUsage > 0} />
          <StatusRow label="Backend" value={backendOnline ? 'Online' : 'Offline'} online={backendOnline} />
          <StatusRow label="Ollama" value={ollamaOnline ? 'Online' : 'Offline'} online={ollamaOnline} />
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 my-3 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center px-4 animate-in fade-in duration-500">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="text-lg text-white mb-1 font-medium">How can I help today?</div>
            <div className="text-[10px] text-slate-600 mb-6">Running locally • Your data never leaves this machine</div>
            
            <div className="grid grid-cols-2 gap-2 max-w-xs w-full">
              <SuggestionCard icon="✨" text="Explain AI" onClick={() => handleSuggestion('Explain AI concepts')} />
              <SuggestionCard icon="💻" text="Help with Python" onClick={() => handleSuggestion('Help me with Python code')} />
              <SuggestionCard icon="📄" text="Summarize document" onClick={() => handleSuggestion('Summarize this document')} />
              <SuggestionCard icon="📅" text="Plan my day" onClick={() => handleSuggestion('Plan my day')} />
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {showThinking && <ThinkingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="flex-shrink-0 pt-2 border-t border-cyan-500/10">
        <div className="relative flex items-end mb-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'MOTU is thinking...' : 'Command MOTU...'}
            disabled={isStreaming}
            rows={1}
            className="w-full bg-slate-950/80 border border-cyan-500/20 focus:border-cyan-400/60 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all duration-300 disabled:opacity-50 resize-none overflow-hidden"
            style={{ minHeight: '36px', maxHeight: '120px', caretColor: '#00E5FF' }}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="absolute right-2.5 bottom-2 p-1 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="text-center mb-2">
          <span className="text-[10px] text-slate-600 font-mono">
            {isStreaming ? 'Generating...' : 'Enter to send · Shift+Enter for new line'}
          </span>
        </div>
        <div className="glass-card rounded-xl py-2 px-3 text-[10px] font-mono text-center text-slate-400 tracking-wider uppercase border border-cyan-500/10">
          Local Sovereign AI Architecture
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;