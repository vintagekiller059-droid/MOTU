import React, { useEffect, useRef } from 'react';
import { useUIStore } from '../../stores/ui-store';

export const NeuralSphere: React.FC = () => {
  const currentMode = useUIStore((state) => state.currentMode);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-frequency live canvas plasma loop for electrical arc simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    const size = 240;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;

    const drawArcs = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.shadowBlur = 0;

      const arcCount = currentMode === 'thinking' ? 5 : currentMode === 'listening' ? 4 : 2;
      ctx.lineWidth = currentMode === 'thinking' ? 1.0 : 0.6;

      for (let k = 0; k < arcCount; k++) {
        ctx.beginPath();
        ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(56, 255, 209, 0.7)' : 'rgba(0, 229, 255, 0.6)';
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8;

        let currentX = center;
        let currentY = center;

        const targetRadius = 75;
        const angle = Math.random() * Math.PI * 2;
        const targetX = center + Math.cos(angle) * targetRadius;
        const targetY = center + Math.sin(angle) * targetRadius;

        const segments = 6;
        ctx.moveTo(currentX, currentY);

        for (let i = 1; i <= segments; i++) {
          const progress = i / segments;
          const posX = currentX + (targetX - currentX) * progress;
          const posY = currentY + (targetY - currentY) * progress;

          const noiseX = (Math.random() - 0.5) * 12;
          const noiseY = (Math.random() - 0.5) * 12;

          if (i === segments) {
            ctx.lineTo(targetX, targetY);
          } else {
            ctx.lineTo(posX + noiseX, posY + noiseY);
          }
        }
        ctx.stroke();
      }

      const throttle = currentMode === 'thinking' ? 6 : currentMode === 'listening' ? 10 : 18;
      setTimeout(() => {
        frameId = requestAnimationFrame(drawArcs);
      }, throttle);
    };

    drawArcs();
    return () => cancelAnimationFrame(frameId);
  }, [currentMode]);

  const getSpeed = () => {
    if (currentMode === 'thinking') return 8;
    if (currentMode === 'listening') return 16;
    return 40;
  };

  const getLuminance = () => {
    if (currentMode === 'listening') return 'brightness(1.2)';
    if (currentMode === 'thinking') return 'brightness(1.35)';
    return 'brightness(1.0)';
  };

  const getNucleusAnimation = () => {
    if (currentMode === 'speaking') {
      return 'animate-nucleus-speaking';
    }
    return 'animate-nucleus-idle';
  };

  return (
    <div className="relative flex items-center justify-center w-64 h-64 z-30 pointer-events-none">

      {/* Complex 3D Projected Faceted Isometric Hexagonal Outer Shell */}
      <div
        className={`absolute w-52 h-52 flex items-center justify-center transition-all duration-500 overflow-visible animate-hex-spin`}
        style={{ 
          filter: getLuminance(),
          animationDuration: `${getSpeed()}s`
        }}
      >
        {/* Core SVG wireframe rendering exact facets mapping approved blueprint geometry */}
        <svg className="absolute w-full h-full overflow-visible drop-shadow-[0_0_25px_rgba(0,229,255,0.35)]" viewBox="0 0 100 100">
          {/* Flat projection outer frame */}
          <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="rgba(5, 8, 22, 0.75)" stroke="rgba(0, 229, 255, 0.5)" strokeWidth="0.8"/>

          {/* Interior facet convergence tracking line mapping */}
          <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(56, 255, 209, 0.25)" strokeWidth="0.5" />
          <line x1="10" y1="27.5" x2="90" y2="72.5" stroke="rgba(56, 255, 209, 0.25)" strokeWidth="0.5" />
          <line x1="10" y1="72.5" x2="90" y2="27.5" stroke="rgba(56, 255, 209, 0.25)" strokeWidth="0.5" />

          {/* Inner concentric core perimeter limit vector ring */}
          <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="0.6" strokeDasharray="2 3"/>
        </svg>

        {/* Electrical Plasma Render Window Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute w-60 h-60 mix-blend-screen pointer-events-none z-10"
        />

        {/* Central High-Intensity Nucleus Flare */}
        <div
          className={`w-16 h-16 rounded-full bg-white shadow-[0_0_45px_18px_#00E5FF] mix-blend-screen filter blur-[0.6px] z-20 ${getNucleusAnimation()}`}
        />
      </div>

      {/* Micro Sweeper Line Overlay */}
      {currentMode === 'thinking' && (
        <div className="absolute inset-0 border border-[#38FFD1]/10 rounded-full overflow-hidden pointer-events-none z-40">
          <div 
            className="w-full h-1 bg-gradient-to-r from-transparent via-[#38FFD1]/50 to-transparent shadow-[0_0_10px_#38FFD1] animate-sweeper"
          />
        </div>
      )}
    </div>
  );
};

export default NeuralSphere;
