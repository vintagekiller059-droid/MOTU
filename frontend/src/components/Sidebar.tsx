import React from 'react';
import { MessageSquare, HardDrive, Cpu, Users, Folder, Wrench, FileCode, Settings } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

const navItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'memory', label: 'Memory', icon: HardDrive },
  { id: 'aicore', label: 'AI Core', icon: Cpu, active: true },
  { id: 'agents', label: 'Agents', icon: Users, badge: 'Coming Soon' },
  { id: 'files', label: 'Files', icon: Folder },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'prompts', label: 'Prompts', icon: FileCode },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { aiMode, currentModel, ollamaStatus } = useUIStore();

  return (
    <aside className="w-64 h-full flex flex-col justify-between p-4 border-r border-white/[0.04] bg-[#090d22]/40 backdrop-blur-xl">
      <div>
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-magenta flex items-center justify-center font-bold tracking-tighter text-white shadow-glow-cyan">
            M
          </div>
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">MOTU</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                  item.active 
                    ? 'bg-gradient-to-r from-brand-blue/10 to-brand-purple/5 border border-brand-blue/20 text-white shadow-neon-border' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${item.active ? 'text-brand-cyan' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] text-slate-400 font-mono scale-90">
                    {item.badge}
                  </span>
                )}
                {item.active && (
                  <div className="absolute left-0 top-1/4 w-[2px] h-1/2 bg-brand-cyan rounded-full shadow-glow-cyan" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="space-y-3 pt-4 border-t border-white/[0.04]">
        <div className="glass-card p-3 bg-brand-blue/[0.02]">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">AI Mode</span>
            <span className="text-brand-cyan font-mono font-bold">{aiMode}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System nominal
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-slate-800">
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-80" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Amna</p>
            <p className="text-[11px] text-slate-500 truncate font-mono">{currentModel}</p>
          </div>
          <div className="text-right font-mono text-[10px]">
            <span className={ollamaStatus === 'Online' ? 'text-emerald-400' : 'text-rose-400'}>
              ● {ollamaStatus}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};