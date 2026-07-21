import React from 'react';

interface CenterCoreProps {
  state?: 'idle' | 'thinking' | 'speaking' | 'listening';
}

export const CenterCore: React.FC<CenterCoreProps> = ({ state = 'idle' }) => {
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-12">
      {/* Primary State Container */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
        
        {/* Subtle Outer Boundary Ring */}
        <div 
          className={`absolute inset-0 rounded-full border border-slate-800/80 transition-all duration-700 ${
            isThinking ? 'border-cyan-500/40 animate-spin-slow' : ''
          }`} 
        />

        {/* Status Activity Accent */}
        {(isThinking || isSpeaking || isListening) && (
          <div className="absolute inset-2 rounded-full border border-cyan-500/20 animate-ping opacity-20" />
        )}

        {/* Center Orb / Mind State */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-slate-900 via-cyan-950/30 to-slate-950 border border-slate-700/50 shadow-2xl flex items-center justify-center backdrop-blur-xl">
          {/* Internal Glow Dot */}
          <div 
            className={`w-4 h-4 rounded-full transition-all duration-500 ${
              isThinking 
                ? 'bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.8)] scale-125' 
                : isSpeaking 
                ? 'bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]' 
                : isListening
                ? 'bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.8)]'
                : 'bg-slate-600'
            }`} 
          />
        </div>
      </div>

      {/* Meaningful Core Telemetry */}
      <div className="mt-6 flex flex-col items-center gap-1">
        <span className="text-xs tracking-widest text-slate-400 uppercase font-mono">
          System Core
        </span>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${
            isThinking ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-500'
          }`} />
          <span className="text-sm font-medium text-slate-200 capitalize font-mono">
            {state}
          </span>
        </div>
      </div>
    </div>
  );
};