import React from 'react';
import { useUIStore } from '../store/uiStore';

const LeftModules = [
  { title: 'Memory Engine', desc: 'Focus on the contextual memory engine processing.' },
  { title: 'Context Assembler', desc: 'Context the model to utilize context assembler.' },
  { title: 'Memory Search', desc: 'Search quantitative solutions to your memory AI cores.' },
  { title: 'Local LLM (Ollama)', desc: 'Active LLAI energy alternative runtime and context states.' },
];

const RightModules = [
  { title: 'Response Generator', desc: 'Coordinate continuous updates of response generation.' },
  { title: 'Planning', desc: 'Reasoning and rational planning architecture nodes.' },
  { title: 'Reasoning', desc: 'Reasoning engines and concurrency processing context.' },
  { title: 'Future Agents', desc: 'Future agents, modular system mapping frameworks.' },
];

export const AICore: React.FC = () => {
  const { currentModel, ollamaStatus } = useUIStore();

  return (
    <div className="flex-1 grid grid-rows-[1fr_auto] p-4 gap-4 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-radial-brain opacity-70 pointer-events-none" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-center relative px-6">
        <div className="space-y-4 max-w-xs justify-self-end w-full z-10">
          {LeftModules.map((m, i) => (
            <div key={i} className="glass-panel p-3 bg-gradient-to-r from-brand-blue/[0.03] to-transparent hover:border-brand-cyan/30 group">
              <h4 className="text-xs font-bold text-slate-200 tracking-wide mb-0.5 group-hover:text-brand-cyan transition-colors">{m.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">{m.desc}</p>
            </div>
          ))}
        </div>
        <div className="relative w-80 h-80 flex items-center justify-center mx-4">
          <svg className="absolute inset-0 w-full h-full rotate-45" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#cyanGlow)" strokeWidth="0.5" className="animate-glow-pulse" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#purpleGlow)" strokeWidth="0.5" strokeDasharray="10 15" className="animate-spin" style={{ animationDuration: '30s' }} />
            <defs>
              <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#4facfe" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="purpleGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7f00ff" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#e100ff" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="w-56 h-56 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center relative animate-brain shadow-glow-cyan z-10">
            <div className="w-48 h-48 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/20 via-brand-purple/5 to-transparent absolute mix-blend-screen" />
            <svg className="w-32 h-32 text-brand-cyan opacity-90 drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeDasharray="2 2" />
              <path d="M12 6a4 4 0 00-4 4c0 1.5.5 2.5 1.5 3.5S11 15 11 17h2c0-2.5 1.5-3 2.5-4s1.5-2 1.5-3.5a4 4 0 00-4-4z" />
              <path d="M12 17v2" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="space-y-4 max-w-xs justify-self-start w-full z-10">
          {RightModules.map((m, i) => (
            <div key={i} className="glass-panel p-3 bg-gradient-to-l from-brand-purple/[0.03] to-transparent hover:border-brand-magenta/30 group">
              <h4 className="text-xs font-bold text-slate-200 tracking-wide mb-0.5 group-hover:text-brand-magenta transition-colors">{m.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-panel p-3 grid grid-cols-7 gap-2 bg-[#0c1026]/60 text-center font-mono text-[11px]">
        <div>
          <div className="text-slate-500 uppercase text-[9px] mb-0.5">Current Model</div>
          <div className="text-white font-bold">{currentModel}</div>
        </div>
        <div>
          <div className="text-slate-500 uppercase text-[9px] mb-0.5">Ollama Status</div>
          <div className="text-emerald-400 font-bold flex items-center justify-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" /> {ollamaStatus}
          </div>
        </div>
        <div>
          <div className="text-slate-500 uppercase text-[9px] mb-0.5">Memory Used</div>
          <div className="text-white font-bold">211 MB</div>
        </div>
        <div>
          <div className="text-slate-500 uppercase text-[9px] mb-0.5">Context Window</div>
          <div className="text-white font-bold">200</div>
        </div>
        <div>
          <div className="text-slate-500 uppercase text-[9px] mb-0.5">Max Tokens</div>
          <div className="text-slate-400">3000n</div>
        </div>
        <div>
          <div className="text-slate-500 uppercase text-[9px] mb-0.5">Current Session</div>
          <div className="text-brand-blue font-bold">Session</div>
        </div>
        <div>
          <div className="text-slate-500 uppercase text-[9px] mb-0.5">Inference Speed</div>
          <div className="text-brand-cyan font-bold">120 m/s</div>
        </div>
      </div>
    </div>
  );
};