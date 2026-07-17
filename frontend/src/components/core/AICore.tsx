import React, { useEffect, useRef } from 'react';
import OrbitRing from './OrbitRing';
import NeuralSphere from './NeuralSphere';
import EnergyParticles from './EnergyParticles';

export const AICore: React.FC = () => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  // High-performance background neural network node animation
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = 650);
    let height = (canvas.height = 650);

    const nodes = Array.from({ length: 45 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
      ctx.fillStyle = 'rgba(56, 255, 209, 0.15)';
      ctx.lineWidth = 0.6;

      // Draw vector paths
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy;

        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        ctx.beginPath();
        ctx.arc(n1.x, n1.y, 1.2, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < 95) {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="flex-1 w-full flex items-center justify-center relative select-none overflow-hidden bg-[#050816]">
      {/* Target Base Canvas Background Layer */}
      <canvas 
        ref={bgCanvasRef} 
        className="absolute w-[650px] h-[650px] pointer-events-none mix-blend-screen opacity-70"
      />
      
      {/* Central Blueprint Matrix Core Frame Wrapper */}
      <div className="w-[620px] h-[620px] relative flex items-center justify-center scale-95">
        <OrbitRing />
        <EnergyParticles />
        <NeuralSphere />
      </div>
    </div>
  );
};

export default AICore;