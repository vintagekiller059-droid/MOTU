import React, { memo } from 'react';
import { useUIStore } from '../stores/ui-store';
import { useAppUIStore } from '../stores/app-store';

// React.memo prevents rerenders unless cpuUsage, ramUsage, or status changes
export const BottomCards: React.FC = memo(() => {
  const { cpuUsage, ramUsage } = useUIStore();
  const { backendOnline, ollamaOnline } = useAppUIStore();

  return (
    <div className="flex gap-3 pointer-events-auto">
      {/* CPU Card */}
      <div className="glass-card rounded-xl p-3 min-w-[140px] border border-cyan-500/5 hover:border-cyan-500/15 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <path d="M15 2v2M15 20v2M9 2v2M9 20v2M20 15h2M2 15h2M20 9h2M2 9h2" />
          </svg>
          <span className="text-[10px] tracking-wider text-slate-400 font-mono uppercase">CPU Utilization</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-mono text-cyan-100 tabular-nums">{cpuUsage.toFixed(1)}</span>
          <span className="text-xs text-slate-500">%</span>
        </div>
        <div className="mt-1.5 h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(cpuUsage, 100)}%` }}
          />
        </div>
      </div>

      {/* Memory Card */}
      <div className="glass-card rounded-xl p-3 min-w-[140px] border border-cyan-500/5 hover:border-cyan-500/15 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span className="text-[10px] tracking-wider text-slate-400 font-mono uppercase">Memory</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-mono text-cyan-100 tabular-nums">{ramUsage.toFixed(1)}</span>
          <span className="text-xs text-slate-500">GB</span>
        </div>
        <div className="mt-1.5 h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((ramUsage / 16) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Backend Status — REAL, not fake */}
      <div className={`glass-card rounded-xl p-3 min-w-[120px] border transition-all duration-300 ${
        backendOnline ? 'border-emerald-500/10 hover:border-emerald-500/20' : 'border-red-500/10 hover:border-red-500/20'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-red-400'}`} />
          <span className="text-[10px] tracking-wider text-slate-400 font-mono uppercase">Backend</span>
        </div>
        <div className="text-sm font-mono text-slate-200">
          {backendOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Ollama Status — REAL, not fake */}
      <div className={`glass-card rounded-xl p-3 min-w-[120px] border transition-all duration-300 ${
        ollamaOnline ? 'border-cyan-500/10 hover:border-cyan-500/20' : 'border-slate-500/10 hover:border-slate-500/20'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-cyan-400 shadow-[0_0_6px_#00E5FF]' : 'bg-slate-600'}`} />
          <span className="text-[10px] tracking-wider text-slate-400 font-mono uppercase">Ollama</span>
        </div>
        <div className="text-sm font-mono text-slate-200">
          {ollamaOnline ? 'Online' : 'Offline'}
        </div>
      </div>
    </div>
  );
});

BottomCards.displayName = 'BottomCards';
