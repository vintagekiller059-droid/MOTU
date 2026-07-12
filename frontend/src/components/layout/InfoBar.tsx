import React from 'react';
import { useSystemStore } from '../../stores/system-store';

export const InfoBar: React.FC = () => {
  const { cpuUsage, ramUsage, version } = useSystemStore();

  return (
    <footer className="h-8 w-full px-4 border-t border-white/[0.05] bg-[#0d0d17]/40 backdrop-blur-md flex items-center justify-between shrink-0 font-mono text-[11px] text-slate-400 select-none">
      <div className="flex items-center gap-4">
        <div>
          CPU: <span className="text-white font-medium">{cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="w-[1px] h-3 bg-white/[0.08]" />
        <div>
          RAM: <span className="text-white font-medium">{ramUsage.toFixed(2)} GB</span>
        </div>
      </div>
      <div className="text-slate-500 text-[10px]">
        {version}
      </div>
    </footer>
  );
};