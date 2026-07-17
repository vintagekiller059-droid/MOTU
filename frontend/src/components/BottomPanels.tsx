import React from 'react';
import { useUIStore } from '../stores/ui-store';
import { Cpu, HardDrive, CpuIcon, Activity } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, colorClass }) => {
  return (
    <div className="flex-1 h-24 glass-panel bg-os-card border-white/[0.04] p-4 flex flex-col justify-between glass-card-glow relative overflow-hidden group">
      <div className="flex items-center justify-between w-full">
        <span className="text-[11px] font-mono text-slate-500 tracking-wider uppercase">{label}</span>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <div className="flex items-end justify-between w-full mt-1">
        <span className="text-xl font-light text-slate-100 tracking-tight">{value}</span>
        
        {/* Micro Canvas Sparkline instead of heavy layout components */}
        <svg className="w-16 h-6 opacity-30 group-hover:opacity-60 transition-opacity duration-300" viewBox="0 0 40 10">
          <path 
            d="M0,5 Q5,2 10,7 T20,3 T30,8 T40,4" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1"
            className={colorClass}
          />
        </svg>
      </div>
    </div>
  );
};

export const BottomPanels: React.FC = () => {
  const { cpuUsage, ramUsage } = useUIStore();

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-6 flex gap-4 shrink-0 z-20">
      <MetricCard 
        label="CPU Usage" 
        value={`${cpuUsage.toFixed(1)}%`} 
        icon={Cpu} 
        colorClass="text-brand-cyan" 
      />
      <MetricCard 
        label="RAM Allocation" 
        value={`${ramUsage.toFixed(2)} GB`} 
        icon={HardDrive} 
        colorClass="text-brand-purple" 
      />
      <MetricCard 
        label="Active Core Model" 
        value="Llama 3.1 8B" 
        icon={CpuIcon} 
        colorClass="text-brand-cyan" 
      />
      <MetricCard 
        label="Core Telemetry" 
        value="Optimal" 
        icon={Activity} 
        colorClass="text-brand-success" 
      />
    </div>
  );
};