import React from 'react';

interface TelemetryItem {
  label: string;
  value: string;
  status?: 'active' | 'idle' | 'standby';
}

export const StatusTelemetry: React.FC = () => {
  const telemetry: TelemetryItem[] = [
    { label: 'Model', value: 'Qwen 2.5 (Local)' },
    { label: 'Memory Engine', value: '127 Vectors', status: 'active' },
    { label: 'Latency', value: '42 ms' },
    { label: 'Temperature', value: '0.7' },
    { label: 'Vision Engine', value: 'Standby', status: 'standby' },
    { label: 'Voice STT/TTS', value: 'Ready', status: 'idle' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 px-4 py-3 bg-slate-900/40 border border-slate-800/80 rounded-xl backdrop-blur-md">
      {telemetry.map((item, idx) => (
        <div key={idx} className="flex flex-col p-2 rounded-lg bg-slate-950/30 border border-slate-800/30">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            {item.label}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {item.status && (
              <span className={`w-1.5 h-1.5 rounded-full ${
                item.status === 'active' 
                  ? 'bg-emerald-400' 
                  : item.status === 'standby' 
                  ? 'bg-amber-400' 
                  : 'bg-slate-500'
              }`} />
            )}
            <span className="text-xs font-semibold text-slate-200 font-mono truncate">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};