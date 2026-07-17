import React from 'react';
import { useUIStore } from '../stores/ui-store';
import { Cpu, HardDrive } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const MetricsWidget: React.FC<MetricCardProps> = ({ label, value, percentage, icon: Icon, color }) => {
  return (
    <div className="flex-1 h-[105px] bg(rgba(5,8,20,0.25)) backdrop-blur-[12px] border border-white/[0.04] p-5 rounded-[20px] flex items-center justify-between transition-all duration-500 hover:border-[#00E5FF]/20 hover:bg-black/25">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#00E5FF]" />
        </div>
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-[#8EA7C2] tracking-[0.2em] uppercase block">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-light tracking-tight text-white">{value}</span>
            <span className="text-xs font-mono text-[#38FFD1] opacity-60">({percentage.toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Graph Coordinates Vector rendering */}
      <div className="w-28 h-6 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 80 20">
          <path
            d={`M0,10 Q20,${20 - percentage * 0.15} 40,10 T80,${15 - Math.random() * 5}`}
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
};

export const BottomCards: React.FC = () => {
  const { cpuUsage, ramUsage } = useUIStore();
  const totalRam = 16.0;
  const computedRamPercent = (ramUsage / totalRam) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-6 flex gap-6 shrink-0 z-20">
      <MetricsWidget 
        label="THINKING ALLOCATION (CPU)" 
        value={`${cpuUsage.toFixed(1)} %`} 
        percentage={Math.min(cpuUsage * 7, 100)} 
        icon={Cpu} 
        color="#00E5FF" 
      />
      <MetricsWidget 
        label="SYNAPTIC CAPACITY (RAM)" 
        value={`${ramUsage.toFixed(2)} / ${totalRam} GB`} 
        percentage={computedRamPercent} 
        icon={HardDrive} 
        color="#7A5CFF" 
      />
    </div>
  );
};

export default BottomCards;