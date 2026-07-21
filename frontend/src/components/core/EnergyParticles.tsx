import React, { useEffect, useRef } from 'react';

type EnergyParticlesState = string;

interface EnergyParticlesProps {
  currentState: EnergyParticlesState;
}

export const EnergyParticles: React.FC<EnergyParticlesProps> = ({ currentState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    const size = 320;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;

    // Reduced particle count from 28 to 14 (Saves massive GPU memory)
    const particles = Array.from({ length: 14 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 40 + Math.random() * 32,
      speed: (0.008 + Math.random() * 0.012) * (Math.random() > 0.5 ? 1 : -1),
      size: 0.8 + Math.random() * 1.5,
      alpha: 0.3 + Math.random() * 0.6,
    }));

    let activeArcs: { startAngle: number; length: number; life: number; maxLife: number }[] = [];
    let time = 0;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // Cap at 30 FPS for low CPU footprint

    const draw = (now: number) => {
      animId = requestAnimationFrame(draw);

      // Frame Rate Throttling
      const elapsed = now - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = now - (elapsed % fpsInterval);

      time += 0.03;
      ctx.clearRect(0, 0, size, size);

      let stateMult = 1.0;
      if (currentState === 'listening') stateMult = 1.25;
      if (currentState === 'thinking') stateMult = 1.8;
      if (currentState === 'speaking') stateMult = 1.4 + Math.sin(time * 8) * 0.2;

      const pulse = Math.sin(time * 1.8) * 0.06 + 1.0;

      // 1. Soft Cyan Glow
      const softGlowRadius = 140 * pulse * stateMult;
      const layer7 = ctx.createRadialGradient(center, center, 10, center, center, softGlowRadius);
      layer7.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      layer7.addColorStop(0.5, 'rgba(14, 165, 233, 0.1)');
      layer7.addColorStop(1, 'rgba(5, 8, 22, 0)');
      ctx.fillStyle = layer7;
      ctx.beginPath();
      ctx.arc(center, center, softGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Plasma Core
      const plasmaR = 48 * pulse * stateMult;
      const p1X = center + Math.cos(time * 1.2) * 5;
      const p1Y = center + Math.sin(time * 1.2) * 5;
      const plasmaGrad = ctx.createRadialGradient(p1X, p1Y, 2, p1X, p1Y, plasmaR);
      plasmaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
      plasmaGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.3)');
      plasmaGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');
      ctx.fillStyle = plasmaGrad;
      ctx.beginPath();
      ctx.arc(p1X, p1Y, plasmaR, 0, Math.PI * 2);
      ctx.fill();

      // 3. Electric Arcs (Max 2 active at a time instead of 5)
      if (Math.random() < 0.15 * stateMult && activeArcs.length < 2) {
        activeArcs.push({
          startAngle: Math.random() * Math.PI * 2,
          length: (Math.PI / 3) + Math.random() * (Math.PI / 2),
          life: 0,
          maxLife: 5,
        });
      }

      activeArcs.forEach((arc, index) => {
        arc.life++;
        const alpha = 1 - arc.life / arc.maxLife;
        ctx.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const arcRadius = 38 + Math.random() * 3;
        for (let s = 0; s <= 4; s++) {
          const a = arc.startAngle + (arc.length / 4) * s;
          const jitter = (Math.random() - 0.5) * 5;
          const ax = center + Math.cos(a) * (arcRadius + jitter);
          const ay = center + Math.sin(a) * (arcRadius + jitter);
          if (s === 0) ctx.moveTo(ax, ay);
          else ctx.lineTo(ax, ay);
        }
        ctx.stroke();
        if (arc.life >= arc.maxLife) activeArcs.splice(index, 1);
      });

      // 4. White Core Nucleus
      const nucRadius = 16 * pulse;
      const nucleus = ctx.createRadialGradient(center, center, 0, center, center, nucRadius);
      nucleus.addColorStop(0, '#ffffff');
      nucleus.addColorStop(0.4, '#38bdf8');
      nucleus.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = nucleus;
      ctx.beginPath();
      ctx.arc(center, center, nucRadius, 0, Math.PI * 2);
      ctx.fill();

      // 5. Orbiting Particles
      particles.forEach((p) => {
        p.angle += p.speed * stateMult;
        const px = center + Math.cos(p.angle) * p.radius;
        const py = center + Math.sin(p.angle) * p.radius;
        ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [currentState]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-screen" />;
};