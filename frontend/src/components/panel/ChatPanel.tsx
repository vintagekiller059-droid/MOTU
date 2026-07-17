import React, { useState, useRef, useEffect } from 'react';
// FIXED IMPORT PATH: Stepping up two levels to reach the stores directory
import { useUIStore, type OperatingMode } from '../../stores/ui-store';
import { Send, Mic, Clipboard, Check } from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { messages, addMessage, currentMode, setMode } = useUIStore();
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || currentMode !== 'idle') return;

    addMessage('user', input.trim());
    setInput('');
    setMode('thinking');

    // Emulate organic response workflow pipelines
    setTimeout(() => {
      setMode('speaking');
      addMessage('motu', `\`\`\`typescript\n// Local Vector Processing\nconst identity = "MOTU Offline Matrix";\nconsole.log(\`Execution structural loop stabilized.\`);\n\`\`\`\nReasoning node analysis confirmed. All database blocks have been successfully updated locally via SQLite storage.`);
      
      setTimeout(() => {
        setMode('idle');
      }, 2500);
    }, 2000);
  };

  const toggleVoiceMode = () => {
    if (currentMode === 'idle') {
      setMode('listening');
    } else if (currentMode === 'listening') {
      setMode('thinking');
      setTimeout(() => {
        setMode('speaking');
        addMessage('motu', 'Voice localized capture deciphered. Environmental context parsed accurately into private local memory.');
        setTimeout(() => setMode('idle'), 2000);
      }, 1500);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-[450px] h-[calc(100vh-48px)] my-6 mr-6 bg-[rgba(5,8,20,0.25)] backdrop-blur-[16px] border border-[#00E5FF]/10 rounded-[24px] flex flex-col justify-between overflow-hidden shadow-2xl z-20">
      
      {/* Upper Status Bar header */}
      <div className="px-6 py-4 border-b border-white/[0.03] flex items-center justify-between bg-black/10">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${currentMode === 'idle' ? 'bg-[#00E5FF]' : currentMode === 'listening' ? 'bg-red-500' : 'bg-[#7A5CFF]'} animate-pulse`} />
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#8EA7C2] uppercase">CONVERSATION STREAM</span>
        </div>
        <span className="text-[10px] font-mono text-[#00E5FF]/70 bg-[#00E5FF]/5 px-2 py-0.5 rounded-md border border-[#00E5FF]/10">LOCAL HOST</span>
      </div>

      {/* Conversations Stream Deck */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-light leading-relaxed tracking-wide ${
              msg.sender === 'user' 
                ? 'bg-[#7A5CFF]/10 border border-[#7A5CFF]/20 text-white rounded-br-none' 
                : 'bg-white/[0.02] border border-white/[0.05] text-white/90 rounded-bl-none'
            }`}>
              {msg.text.includes('```') ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8EA7C2] border-b border-white/5 pb-1">
                    <span>CODE GENERATION BLOCK</span>
                    <button onClick={() => copyToClipboard(msg.text, msg.id)}>
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-green-400"/> : <Clipboard className="w-3 h-3"/>}
                    </button>
                  </div>
                  <pre className="p-3 bg-black/40 rounded-lg text-xs font-mono text-[#00E5FF] overflow-x-auto">
                    <code>{msg.text.replace(/```[a-z]*/g, '')}</code>
                  </pre>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
            <span className="text-[9px] font-mono text-[#8EA7C2]/40 mt-1.5 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {/* Typing / Processing Cursor Indicator */}
        {currentMode === 'thinking' && (
          <div className="flex items-center gap-1.5 p-3 bg-white/[0.01] border border-white/5 rounded-xl w-32">
            <span className="w-1 h-1 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Consolidated Input Deck Panel */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.03] bg-black/5 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleVoiceMode}
          className={`p-3 rounded-xl transition-all duration-300 border ${
            currentMode === 'listening' 
              ? 'bg-red-500/10 border-red-500 text-red-400 animate-pulse' 
              : 'bg-white/[0.02] border-white/5 text-[#8EA7C2] hover:text-[#00E5FF]'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentMode === 'listening' ? "Listening to your voice..." : "Transmit request to local intelligence core..."}
          disabled={currentMode !== 'idle'}
          className="flex-1 bg-black/20 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs font-light text-white placeholder-[#8EA7C2]/40 focus:outline-none focus:border-[#00E5FF]/30 transition-all"
        />

        <button
          type="submit"
          disabled={!input.trim() || currentMode !== 'idle'}
          className="p-3 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-xl text-[#00E5FF] hover:bg-[#00E5FF]/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;