import React from 'react';
import { useUIStore } from '../stores/ui-store';

interface MindNodeProps {
  label: string;
  status: string;
  highlighted?: boolean;
  activePulse?: boolean;
}

const MindNode: React.FC<MindNodeProps> = ({ label, status, highlighted = false, activePulse = false }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/[0.02]">
    <span className="text-[10px] font-mono text-[#8EA7C2] tracking-[0.15em] uppercase">{label}</span>
    <div className="flex items-center gap-2">
      {activePulse && <span className="w-1 h-1 rounded-full bg-[#38FFD1] animate-ping" />}
      <span className={`text-xs font-light tracking-wide ${highlighted ? 'text-[#00E5FF] font-medium' : 'text-white/90'}`}>
        {status}
      </span>
    </div>
  </div>
);

export const RightPanel: React.FC = () => {
  const { coreState } = useUIStore();

  return (
    <div className="w-80 h-[calc(100vh-48px)] my-6 mr-6 flex flex-col justify-between p-8 shrink-0 z-20 border-l border-white/[0.03] hardware-layer">
      {/* Title Segment */}
      <div className="space-y-8 mt-4">
        <div>
          <h2 className="text-[10px] font-mono tracking-[0.3em] text-[#00E5FF] uppercase font-semibold">
            MOTU OPERATING SYSTEM
          </h2>
          <p className="text-xl font-light text-white/90 mt-2 tracking-wide">
            Intelligent Mind
          </p>
        </div>

        {/* Simplified Consciousness Telemetry */}
        <div className="space-y-1">
          <div className="text-[9px] font-mono text-[#8EA7C2]/60 tracking-[0.2em] mb-3">CORE STATE</div>
          <MindNode 
            label="Current State" 
            status={coreState === 'idle' ? 'Conscious / Idle' : coreState === 'thinking' ? 'Processing Vector' : 'Streaming Tokens'} 
            highlighted 
            activePulse
          />
          <MindNode label="Memory Engine" status="Ready" />
          <MindNode label="Reasoning" status="Active" highlighted />
          <MindNode label="Model Lattice" status="Loaded" />
          <MindNode label="SQLite Memory" status="Connected" />
          <MindNode label="Ollama Node" status="Online" />
        </div>
      </div>

      {/* Bottom Infrastructure Baseline */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-[#050814]/50 border border-white/[0.03] text-center">
          <p className="text-[9px] font-mono text-[#8EA7C2] tracking-widest uppercase">Local Sovereign AI Architecture</p>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;