import React from 'react';
import { useUIStore } from '../store/uiStore';
import { Cpu, Database, Zap, Shield, Flame, Activity } from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { metrics, aiMode, setAIMode } = useUIStore();

  const activeModes: Array<{ id: typeof aiMode; label: string; icon: any; color: string }> = [
    { id: 'Eco', label: 'Eco', icon: Shield, color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
    { id: 'Balanced', label: 'Balanced', icon: Activity, color: 'border-brand-blue/30 text-brand-blue bg-brand-blue/5' },
    { id: 'Performance', label: 'Performance', icon: Zap, color: 'border-brand-purple/30 text-brand-purple bg-brand-purple/5' },
    { id: 'Turbo', label: 'Turbo', icon: Flame, color: 'border-amber-500/30 text-amber-400 bg-amber-500/5' },
  ];

  return (
    <aside className="w-80 h-full p-4 border-l border-white/[0.04] bg-[#090d22]/40 backdrop-blur-xl flex flex-col gap-4 overflow-y-auto">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-brand-cyan" /> System Monitor
        </h3>
        <div className="space-y-2.5">
          <div className="glass-card p-3 bg-white/[0.01]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">CPU Usage</span>
              <span className="font-mono text-white">{metrics.cpu.value}%</span>
            </div>
            <div className="h-6 flex items-end gap-[2px] pt-1">
              {metrics.cpu.history.map((val, idx) => (
                <div 
                  key={idx} 
                  className="flex-1 bg-gradient-to-t from-brand-blue to-brand-cyan rounded-t-[1px]" 
                  style={{ height: `${val}%` }} 
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="glass-card p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">RAM Usage</span>
              <span className="font-mono font-bold text-white block mt-0.5">14.8 GB</span>
            </div>
            <div className="glass-card p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">GPU Target</span>
              <span className="font-mono font-bold text-brand-purple block mt-0.5">{metrics.gpu.value}%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-2 border-t border-white/[0.04]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">AI Engine Modes</h3>
        <div className="grid grid-cols-2 gap-2">
          {activeModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = aiMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setAIMode(mode.id)}
                className={`p-3 rounded-lg border flex flex-col items-start gap-1.5 transition-all text-left ${
                  isSelected 
                    ? `${mode.color} ring-1 ring-white/10 shadow-md` 
                    : 'border-white/[0.04] bg-white/[0.01] text-slate-400 hover:bg-white/[0.03]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-semibold">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pt-2 border-t border-white/[0.04] flex-1 flex flex-col justify-end">
        <div className="glass-panel p-3 bg-brand-purple/[0.01]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
            <Database className="w-3.5 h-3.5 text-brand-purple" /> Storage Allocation
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-gradient-to-r from-brand-purple to-brand-magenta w-[42%]" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Allocated: {metrics.memoryStorage} MB</span>
            <span>Max: 1024 MB</span>
          </div>
        </div>
      </div>
    </aside>
  );
};