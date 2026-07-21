import React from 'react';
import { useUIStore } from '../../stores/ui-store';

export const EnergyParticles: React.FC = () => {
  const currentMode = useUIStore((state) => state.currentMode);

  const particleDensity = currentMode === 'thinking' ? 32 : currentMode === 'listening' ? 22 : 14;
  const standardSpeed = currentMode === 'thinking' ? 5 : currentMode === 'listening' ? 9 : 25;

  // Stably map points onto geometric concentric lanes matching reference matrix design
  const configurations = Array.from({ length: particleDensity }).map((_, i) => ({
    id: i,
    laneRadius: 165 + ((i * 23) % 95),
    offsetAngle: i * (360 / particleDensity),
    duration: standardSpeed + (i % 4),
  }));

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
      {configurations.map((pt) => (
        <div
          key={pt.id}
          className="absolute inset-0 flex items-center justify-center animate-particle-orbit"
          style={{ 
            transform: `rotate(${pt.offsetAngle}deg)`,
            animationDuration: `${pt.duration}s`
          }}
        >
          {/* Micro glowing data payload marker node elements */}
          <div 
            style={{ transform: `translateY(${pt.laneRadius}px)` }}
            className="w-1 h-1 rounded-full bg-[#38FFD1] shadow-[0_0_8px_2px_rgba(56,255,209,0.4)] opacity-75" 
          />
        </div>
      ))}
    </div>
  );
};

export default EnergyParticles;
