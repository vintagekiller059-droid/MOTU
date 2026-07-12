import React from 'react';
import { useSystemStore } from '../../stores/system-store';
import { useUIStore } from '../../stores/ui-store';
import { Settings, Cpu } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { connected, modelName } = useSystemStore();
  const { setSettingsOpen, settingsOpen } = useUIStore();

  return (
    <header className="h-12 w-full px-4 border-b border-white/[0.05] bg-[#0d0d17]/40 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-brand-cyan shadow-[0_0_8px_rgba(0,242,254,0.6)]' : 'bg-rose-500'}`} />
          <span className="text-xs font-bold tracking-wider text-white">MOTU</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded border border-white/[0.03] bg-white/[0.01]">
          {modelName.toUpperCase()}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-slate-400 font-mono tracking-widest uppercase">
          {connected ? 'CORE ONLINE' : 'DISCONNECTED'}
        </span>
        <button 
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.03] transition-colors"
          title="System Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};