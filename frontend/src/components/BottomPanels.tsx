import React from 'react';
import { Send, Search, Filter, FolderKanban, Sliders } from 'lucide-react';

export const BottomPanels: React.FC = () => {
  return (
    <div className="h-44 border-t border-white/[0.04] grid grid-cols-4 gap-4 p-4 bg-[#080b1e]/60 backdrop-blur-md z-10">
      <div className="glass-panel p-3 flex flex-col justify-between">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">Chat Preview</div>
        <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
          <div className="text-xs text-brand-cyan font-mono">User: <span className="text-slate-300">Run localized system diagnostic trace.</span></div>
          <div className="text-xs text-brand-purple font-mono">Motu: <span className="text-slate-400">Core parameters operational. Neural fabric online.</span></div>
        </div>
        <div className="mt-2 relative">
          <input 
            type="text" 
            placeholder="Interrogate core..." 
            className="w-full bg-white/[0.02] border border-white/5 rounded-md py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-brand-blue/30"
          />
          <Send className="w-3 h-3 absolute right-2 top-2 text-slate-500" />
        </div>
      </div>
      <div className="glass-panel p-3 flex flex-col">
        <div className="flex justify-between items-center mb-1.5">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Memory Fabric</div>
          <div className="flex gap-1">
            <Search className="w-3 h-3 text-slate-400" />
            <Filter className="w-3 h-3 text-slate-400" />
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto text-[11px]">
          <div className="p-1 rounded bg-white/[0.02] border border-white/[0.02] flex justify-between">
            <span className="text-slate-300 truncate font-mono">@identity_context</span>
            <span className="text-brand-cyan scale-90 font-bold">Active</span>
          </div>
          <div className="p-1 rounded bg-white/[0.01] border border-white/[0.01] flex justify-between">
            <span className="text-slate-400 truncate font-mono">@hardware_mapping</span>
            <span className="text-slate-500 scale-90">Cached</span>
          </div>
        </div>
      </div>
      <div className="glass-panel p-3 flex flex-col">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1">
          <Sliders className="w-3 h-3 text-brand-blue" /> Dynamic Hyperparameters
        </div>
        <div className="space-y-2 flex-1 justify-center flex flex-col">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-0.5"><span>Temperature</span><span>0.7</span></div>
            <div className="h-1 bg-white/5 rounded-full"><div className="h-full bg-brand-blue w-[70%]" /></div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-0.5"><span>Top P</span><span>0.9</span></div>
            <div className="h-1 bg-white/5 rounded-full"><div className="h-full bg-brand-purple w-[90%]" /></div>
          </div>
        </div>
      </div>
      <div className="glass-panel p-3 flex flex-col">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center gap-1">
          <FolderKanban className="w-3 h-3 text-brand-magenta" /> Vector Assets
        </div>
        <div className="grid grid-cols-2 gap-1.5 flex-1 overflow-y-auto text-[11px]">
          <div className="p-1.5 rounded border border-white/5 bg-white/[0.01] flex flex-col justify-between">
            <span className="text-slate-300 font-mono truncate">corpus.json</span>
            <span className="text-[9px] text-slate-500 font-mono">2.4 MB</span>
          </div>
          <div className="p-1.5 rounded border border-white/5 bg-white/[0.01] flex flex-col justify-between">
            <span className="text-slate-300 font-mono truncate">config.yaml</span>
            <span className="text-[9px] text-slate-500 font-mono">12 KB</span>
          </div>
        </div>
      </div>
    </div>
  );
};