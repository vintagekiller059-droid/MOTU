import React, { useState, useRef } from 'react';
import { useUIStore } from '../../stores/ui-store';
import { useSessionStore } from '../../stores/session-store';
import { CornerDownLeft } from 'lucide-react';
import { clsx } from 'clsx';

export const InputOrbit: React.FC = () => {
  const [input, setInput] = useState('');
  const { inputFocused, setInputFocused } = useUIStore();
  const { addMessage, isStreaming } = useSessionStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    });
    setInput('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 shrink-0 z-20">
      <form 
        onSubmit={handleSubmit}
        className={clsx(
          "w-full rounded-xl transition-all duration-300 flex items-center gap-3 px-4 py-2.5",
          "border backdrop-blur-xl bg-[#0d0d17]/50",
          inputFocused 
            ? "border-brand-cyan/30 shadow-[0_0_20px_rgba(0,242,254,0.06)] bg-[#0d0d17]/80" 
            : "border-white/[0.04]"
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Interface with MOTU Core..."
          className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-[13px] font-sans py-1"
        />
        
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className={clsx(
            "p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center shrink-0",
            input.trim() && !isStreaming
              ? "bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan"
              : "text-slate-600 border border-transparent"
          )}
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};