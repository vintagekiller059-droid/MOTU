import React from 'react';
import { useUIStore } from '../../stores/ui-store';
import { OrbitalRing } from './OrbitalRing';
import { EnergyParticles } from './EnergyParticles';
import { FloatingParticles } from './FloatingParticles';

interface CustomCSSProperties extends React.CSSProperties {
  '--spin-duration'?: string;
}

export const AICore: React.FC = () => {
  const { currentState } = useUIStore();

  const orbStyle: CustomCSSProperties = {
    '--spin-duration': '120s',
  };

  return (
    <div className="relative flex items-center justify-center w-[600px] h-[600px] select-none">
      <FloatingParticles />

      {/* Holographic Scanner Sweep */}
      <div className="absolute w-[560px] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-scanner pointer-events-none z-30" />

      {/* Outer Labeled HUD Rings (Kept identical) */}
      <OrbitalRing radius={550} speed={50} title="PLANNING & CONTEXT" subtitle="Planning Layer" currentState={currentState} />
      <OrbitalRing radius={450} speed={40} title="LEARNING" subtitle="Vision Processing" currentState={currentState} reverse={true} />
      <OrbitalRing radius={370} speed={32} title="MEMORY" subtitle="Context Buffer" currentState={currentState} />
      <OrbitalRing radius={290} speed={25} title="KNOWLEDGE" subtitle="Knowledge Base" currentState={currentState} reverse={true} />
      <OrbitalRing radius={210} speed={18} title="COGNITIVE LAYERS" subtitle="Reasoning" currentState={currentState} />

      {/* ========================================================= */}
      {/*              THE AI HEART (SLIGHTLY COMPACT)              */}
      {/* ========================================================= */}
      <div className="relative w-[140px] h-[140px] flex items-center justify-center z-10">
        
        {/* Core Canvas (Layers 1, 2, 3, 6, 7) */}
        <EnergyParticles currentState={currentState} />

        {/* LAYER 5: Thin Counter-Rotating Outer Energy Shell */}
        <div className="absolute w-[134px] h-[134px] rounded-full border border-cyan-400/20 border-dashed animate-[spin_25s_linear_infinite_reverse] pointer-events-none z-10" />
        <div className="absolute w-[128px] h-[128px] rounded-full border-t border-b border-sky-300/30 animate-[spin_15s_linear_infinite] pointer-events-none z-10" />

        {/* LAYER 4: Engineered Glass Spherical Orb Shell */}
        <div 
          className="absolute inset-0 rounded-full transition-transform duration-1000 spin-cw pointer-events-none z-20 overflow-hidden"
          style={orbStyle}
        >
          {/* Beveled Spherical Rim */}
          <div className="absolute inset-0 rounded-full border-[1.5px] border-cyan-200/50 shadow-[0_0_20px_rgba(56,189,248,0.4),inset_0_0_15px_rgba(6,182,212,0.45)]" />

          {/* Spherical Glass Lens Refraction Gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/10 via-transparent to-white/25 backdrop-blur-[1px]" />

          {/* Spherical Curved Glare Highlights */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[90px] h-[30px] rounded-[100%] bg-gradient-to-b from-white/60 to-transparent blur-[1px]" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[70px] h-[20px] rounded-[100%] bg-gradient-to-t from-cyan-300/40 to-transparent blur-[1px]" />
        </div>

      </div>
    </div>
  );
};