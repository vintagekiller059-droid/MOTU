import React from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '../../stores/ui-store';

export const OrbitRing: React.FC = () => {
  const currentMode = useUIStore((state) => state.currentMode);

  const getSpeed = (base: number) => {
    if (currentMode === 'thinking') return base * 0.3;
    if (currentMode === 'listening') return base * 0.5;
    return base;
  };

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10">
      
      {/* Ring Layer 1 (PLANNING & CONTEXT Layer) - Outer Shell */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: getSpeed(90), ease: "linear" }}
        className="absolute w-[560px] h-[560px] rounded-full border border-[#00E5FF]/15 flex items-center justify-center"
      >
        <svg className="absolute inset-0 w-full h-full overflow-visible uppercase font-mono text-[7.5px] tracking-[0.45em] fill-[#8EA7C2]/70">
          <path id="outerPath" d="M 280 15 A 265 265 0 1 1 279.9 15" fill="none" />
          <text className="text-center"><textPath href="#outerPath" startOffset="25%">PLANNING & CONTEXT</textPath></text>
          <text><textPath href="#outerPath" startOffset="75%">PLANNING LAYER</textPath></text>
        </svg>
      </motion.div>

      {/* Ring Layer 2 (LEARNING Layer) - Bright Cyan Horizon */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: getSpeed(60), ease: "linear" }}
        className="absolute w-[490px] h-[490px] rounded-full border-2 border-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center justify-center"
      >
        <svg className="absolute inset-0 w-full h-full overflow-visible uppercase font-mono text-[7px] tracking-[0.4em] fill-[#38FFD1]/80">
          <path id="midPath" d="M 245 15 A 230 230 0 1 1 244.9 15" fill="none" />
          <text><textPath href="#midPath" startOffset="15%">LEARNING</textPath></text>
          <text><textPath href="#midPath" startOffset="65%">VISION PROCESSING</textPath></text>
        </svg>
      </motion.div>

      {/* Ring Layer 3 (MEMORY / KNOWLEDGE Scale Markings) */}
      <motion.div
        animate={{ rotate: 180 }}
        transition={{ repeat: Infinity, duration: getSpeed(45), ease: "linear" }}
        className="absolute w-[420px] h-[420px] rounded-full border border-dashed border-[#00E5FF]/20 flex items-center justify-center"
      >
        <div className="absolute top-2 font-mono text-[6.5px] tracking-[0.35em] text-[#8EA7C2]/60 uppercase">MEMORY</div>
        <div className="absolute bottom-2 font-mono text-[6.5px] tracking-[0.35em] text-[#38FFD1]/60 uppercase">KNOWLEDGE BASE</div>
      </motion.div>

      {/* Ring Layer 4 (COGNITIVE LAYERS / REASONING Inner Ring HUD Details) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: getSpeed(30), ease: "linear" }}
        className="absolute w-[330px] h-[330px] rounded-full border border-[#38FFD1]/20 flex items-center justify-center"
      >
        <svg className="absolute inset-0 w-full h-full overflow-visible fill-[#00E5FF]/80 font-mono text-[6.5px] tracking-[0.3em] uppercase">
          <path id="innerPath" d="M 165 10 A 155 155 0 1 1 164.9 10" fill="none" />
          <text><textPath href="#innerPath" startOffset="0%">COGNITIVE LAYERS</textPath></text>
          <text><textPath href="#innerPath" startOffset="50%">REASONING</textPath></text>
        </svg>
        
        {/* Fine ticks / metrics mapping ticks matching layout imagery */}
        <div className="absolute inset-2 rounded-full border border-dashed border-[#00E5FF]/10 mix-blend-screen" />
      </motion.div>

      {/* Holographic Crosshairs Emitter Axis Line segments */}
      <div className="absolute w-[580px] h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/10 to-transparent" />
      <div className="absolute h-[580px] w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF]/10 to-transparent" />
    </div>
  );
};

export default OrbitRing;