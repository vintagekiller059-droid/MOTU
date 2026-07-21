import React from 'react';
import { Cpu, HardDrive } from 'lucide-react';

interface BottomCardsProps {
  cpuUsage?: number;
  ramUsage?: number;
  ramTotal?: number;
}

export const BottomCards: React.FC<BottomCardsProps> = ({
  cpuUsage = 18,
  ramUsage = 8.4,
  ramTotal = 16.0,
}) => {
  return (
    <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 px-4">
      {/* CPU Card */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800/60 text-slate-300">
            <Cpu size={16} />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              CPU Utilization
            </div>
            <div className="text-lg font-mono font-semibold text-slate-100 mt-0.5">
              {cpuUsage}%
            </div>
          </div>
        </div>
        {/* Subtle Progress Bar */}
        <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-slate-400 h-full rounded-full transition-all duration-500" 
            style={{ width: `${cpuUsage}%` }}
          />
        </div>
      </div>

      {/* RAM Card */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800/60 text-slate-300">
            <HardDrive size={16} />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Memory Allocation
            </div>
            <div className="text-lg font-mono font-semibold text-slate-100 mt-0.5">
              {ramUsage} <span className="text-xs text-slate-500 font-normal">/ {ramTotal} GB</span>
            </div>
          </div>
        </div>
        {/* Subtle Progress Bar */}
        <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-slate-400 h-full rounded-full transition-all duration-500" 
            style={{ width: `${(ramUsage / ramTotal) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};