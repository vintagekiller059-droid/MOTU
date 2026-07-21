import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../stores/ui-store';

interface Message {
  id: string;
  sender: 'user' | 'motu';
  text: string;
  timestamp: string;
}

export const RightPanel: React.FC = () => {
  const { currentState, setState } = useUIStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'motu',
      text: 'MOTU System Initialized. Local neural engine online.',
      timestamp: '20:23',
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    if (setState) setState('thinking');

    // Simulated Response Stream
    setTimeout(() => {
      if (setState) setState('speaking');
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'motu',
        text: 'Processing query through Local Sovereign Architecture. Context vector analyzed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);

      setTimeout(() => {
        if (setState) setState('idle');
      }, 2000);
    }, 1000);
  };

  const activeState = currentState ? String(currentState).toUpperCase() : 'IDLE';

  return (
    <aside className="w-[360px] h-full glass-panel border-l border-cyan-500/10 flex flex-col justify-between p-5 z-20 box-border overflow-hidden">
      
      {/* HEADER & SYSTEM STATUS */}
      <div className="flex-shrink-0">
        <div className="text-[10px] tracking-[0.2em] text-cyan-400 font-mono uppercase">
          MOTU Operating System
        </div>
        <h2 className="text-xl font-medium text-slate-100 tracking-tight mt-0.5 mb-3">
          Intelligent Mind
        </h2>

        {/* Core State Stats */}
        <div className="space-y-2 text-xs font-mono border-b border-cyan-500/10 pb-3">
          <div className="text-[10px] uppercase text-slate-500 tracking-widest font-semibold">
            Core State
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">CURRENT STATE</span>
            <span className="text-cyan-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {activeState}
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

      {/* CHAT MESSAGES STREAM */}
      <div className="flex-1 my-3 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-500/15 text-cyan-100 border border-cyan-500/30 rounded-br-none'
                  : 'bg-slate-900/60 text-slate-200 border border-slate-700/40 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[9px] text-slate-400 font-mono">
                {msg.sender === 'motu' ? (
                  <svg className="w-2.5 h-2.5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                  </svg>
                ) : (
                  <svg className="w-2.5 h-2.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                )}
                {msg.sender.toUpperCase()} • {msg.timestamp}
              </div>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT FIELD & FOOTER */}
      <div className="flex-shrink-0 pt-2 border-t border-cyan-500/10">
        <form onSubmit={handleSend} className="relative flex items-center mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Command MOTU..."
            className="w-full bg-slate-950/80 border border-cyan-500/20 focus:border-cyan-400/60 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all duration-300"
          />
          <button
            type="submit"
            className="absolute right-2.5 p-1 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
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