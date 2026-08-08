import React from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'motu';
  text: string;
  timestamp?: string;
}

interface ChatUIProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: (e?: React.FormEvent) => void;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  chatEndRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  backendOnline?: boolean;
  ollamaOnline?: boolean;
}

// Arc Gauge for CPU & RAM
const CpuRamGauge: React.FC<{
  label: string;
  value: string;
  percent: number;
}> = ({ label, value, percent }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-sky-500/20"
          strokeWidth="4"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          strokeDasharray="75, 100"
        />
        <path
          strokeWidth="4"
          stroke="#00e5ff"
          fill="none"
          strokeLinecap="round"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          strokeDasharray={`${(percent / 100) * 75}, 100`}
        />
      </svg>
    </div>
    <div className="flex flex-col leading-none font-mono">
      <span className="text-slate-400 text-[8px] font-semibold">{label}</span>
      <span className="font-bold text-slate-200 text-[9px] mt-0.5">{value}</span>
    </div>
  </div>
);

// Status Dot indicator
const StatusDot: React.FC<{
  label: string;
  isOnline: boolean;
}> = ({ label, isOnline }) => (
  <div className="flex items-center gap-1 shrink-0">
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${
        isOnline
          ? 'bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.8)]'
          : 'bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
      }`}
    />
    <div className="flex flex-col leading-none font-mono">
      <span className="text-slate-400 text-[8px] font-semibold">{label}</span>
      <span
        className={`text-[8.5px] font-bold mt-0.5 ${
          isOnline ? 'text-[#00e5ff]' : 'text-red-400/90'
        }`}
      >
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  </div>
);

export const ChatUI: React.FC<ChatUIProps> = ({
  messages,
  isStreaming,
  input,
  onInputChange,
  onSend,
  chatContainerRef,
  chatEndRef,
  onScroll,
  backendOnline = false,
  ollamaOnline = false,
}) => {
  return (
    /* ── OUTER FRAME ── */
    <div className="w-full h-full flex flex-col justify-between relative font-sans select-none overflow-hidden text-slate-100 p-3 bg-[#050d14]/75 backdrop-blur-xl border-t border-l border-sky-400/25 border-b border-r border-sky-950/60 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(0,229,255,0.06),inset_0_1px_1px_rgba(255,255,255,0.08)]">
      
      {/* ── 1. HEADER SECTION ── */}
      <div className="w-full mb-2.5 flex flex-col gap-2 shrink-0">
        
        {/* Main Title Box */}
        <div 
          className="relative w-full p-3.5 border-t border-l border-sky-400/30 border-b border-r border-sky-900/40 bg-[#081520]/80 backdrop-blur-md rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 93% 100%, 0 100%)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-mono tracking-widest text-[#00e5ff] font-bold uppercase flex items-center gap-2">
              MOTU OPERATING SYSTEM
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
            </div>

            {/* Toggle Switch */}
            <div className="w-9 h-4.5 rounded-full border border-sky-500/30 bg-[#02070b] p-0.5 flex items-center cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
              <div className="w-3.5 h-3.5 rounded-full bg-[#00e5ff] ml-auto shadow-[0_0_8px_#00e5ff]" />
            </div>
          </div>

          <h1 className="text-base font-bold text-slate-100 tracking-wide font-sans mt-1">
            Intelligent Mind
          </h1>
        </div>

        {/* System Status Pill (Loading Bar Removed) */}
        <div className="w-full py-2 px-3.5 border-t border-l border-sky-400/20 border-b border-r border-sky-900/30 rounded-2xl bg-[#081520]/70 backdrop-blur-md flex items-center justify-between gap-1 overflow-x-auto shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-mono text-slate-300 font-bold tracking-wider">
              SYSTEM STATUS
            </span>
          </div>

          <div className="flex items-center gap-3.5 shrink-0">
            <CpuRamGauge label="CPU" value="12%" percent={12} />
            <CpuRamGauge label="RAM" value="21%" percent={21} />
            <StatusDot label="Backend" isOnline={backendOnline} />
            <StatusDot label="Ollama" isOnline={ollamaOnline} />
          </div>
        </div>
      </div>

      {/* ── 2. CHAT MESSAGES AREA ── */}
      <div
        ref={chatContainerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto my-1 px-1 space-y-3.5 scrollbar-thin scrollbar-thumb-sky-500/20"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-2">
            <div className="w-11 h-11 rounded-2xl border-t border-l border-sky-400/30 border-b border-r border-sky-900/40 bg-[#081520]/80 backdrop-blur-md flex items-center justify-center text-[#00e5ff] mb-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_15px_rgba(0,229,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <svg className="w-5 h-5 fill-current filter drop-shadow-[0_0_4px_#00e5ff]" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="text-xs font-mono text-[#00e5ff] font-bold tracking-wide">
              How can I help today?
            </h3>
            <p className="text-[9.5px] text-slate-400 mt-1 font-sans">
              Running locally • Your data never leaves this machine
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 text-xs font-sans border-t border-l border-sky-400/25 border-b border-r border-sky-900/40 bg-[#081520]/85 backdrop-blur-md text-slate-200 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] ${
                  msg.sender === 'user' ? 'rounded-tr-xs' : 'rounded-tl-xs'
                }`}
              >
                <div className="text-[9.5px] font-mono text-[#00e5ff] tracking-wider mb-1 flex items-center gap-1 border-b border-sky-500/20 pb-1">
                  <span>{msg.timestamp || '07:11 PM'}</span>
                  {msg.sender === 'motu' && (
                    <span className="text-[#00e5ff] font-bold uppercase">• MOTU</span>
                  )}
                </div>

                <div className="text-[12px] leading-relaxed text-slate-200 font-sans pt-0.5">
                  {msg.text}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── 3. BOTTOM INPUT BAR ── */}
      <div className="pt-2 flex flex-col items-center shrink-0">
        <form onSubmit={onSend} className="w-full relative flex items-center">
          <div className="relative flex-1 flex items-center bg-[#081520]/90 backdrop-blur-md border-t border-l border-sky-400/30 border-b border-r border-sky-900/40 rounded-2xl p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_12px_rgba(0,229,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]">
            
            <span className="pl-2 pr-1 text-[#00e5ff] text-xs pointer-events-none">✦</span>

            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              disabled={isStreaming}
              placeholder="Ask MOTU anything or type /command..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-[11px] font-sans py-1 outline-none relative z-10"
              autoFocus
            />

            <div className="flex items-center gap-1.5 pr-0.5 shrink-0 relative z-10">
              {/* Mic Button */}
              <button
                type="button"
                className="w-7 h-7 rounded-xl bg-[#02070b] border-t border-l border-sky-400/30 border-b border-r border-sky-900/50 text-[#00e5ff] flex items-center justify-center cursor-pointer hover:bg-sky-500/10 hover:border-sky-400/60 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="w-7 h-7 rounded-xl bg-[#02070b] border-t border-l border-sky-400/30 border-b border-r border-sky-900/50 text-[#00e5ff] flex items-center justify-center cursor-pointer hover:bg-sky-500/10 hover:border-sky-400/60 transition-all disabled:opacity-30 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M13.13 22.19L11.5 18.36L8.84 21.03C8.55 21.32 8 21.11 8 20.7V15.5L16.03 7.47L6.2 13.9L1.81 12.5C1.3 12.34 1.32 11.62 1.84 11.48L21.19 4.07C21.64 3.9 22.09 4.35 21.92 4.8L14.51 24.15C14.37 24.67 13.65 24.69 13.49 24.18L13.13 22.19Z" />
                </svg>
              </button>
            </div>

          </div>
        </form>
      </div>

    </div>
  );
};

export default ChatUI;