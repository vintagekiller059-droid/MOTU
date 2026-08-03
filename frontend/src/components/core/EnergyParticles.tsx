import React, { useEffect, useRef } from 'react';

interface EnergyParticlesProps {
  currentState: string;
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    
    const center = size / 2;

    const particles = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 36 + Math.random() * 28,
      speed: (0.006 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1),
      size: 0.6 + Math.random() * 1.2,
      alpha: 0.25 + Math.random() * 0.5,
    }));

    let activeArcs: { startAngle: number; length: number; life: number; maxLife: number }[] = [];
    let time = 0;
    let lastTime = 0;
    const fpsInterval = 1000 / 60; // 60 FPS

    const draw = (now: number) => {
      animId = requestAnimationFrame(draw);
      const elapsed = now - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = now - (elapsed % fpsInterval);

      time += 0.02;
      ctx.clearRect(0, 0, size, size);

      let stateMult = 1.0;
      let glowIntensity = 0.35;
      
      if (currentState === 'listening') {
        stateMult = 1.2;
        glowIntensity = 0.45;
      }
      if (currentState === 'thinking') {
        stateMult = 1.6;
        glowIntensity = 0.6;
      }
      if (currentState === 'speaking') {
        stateMult = 1.15 + Math.sin(time * 6) * 0.08;
        glowIntensity = 0.4;
      }

      const pulse = Math.sin(time * 1.5) * 0.04 + 1.0;

      // 1. Soft Cyan Glow with subtle purple fringe
      const glowRadius = 120 * pulse * stateMult;
      const glow = ctx.createRadialGradient(center, center, 8, center, center, glowRadius);
      glow.addColorStop(0,'rgba(255,255,255,0.95)');
glow.addColorStop(0.18,'rgba(170,240,255,0.85)');
glow.addColorStop(0.45,'rgba(0,229,255,0.35)');
glow.addColorStop(0.75,'rgba(0,229,255,0.12)');
glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center, center, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Plasma Core
      const plasmaR = 42 * pulse * stateMult;
      const p1X = center + Math.cos(time * 1.0) * 4;
      const p1Y = center + Math.sin(time * 1.0) * 4;
      const plasmaGrad = ctx.createRadialGradient(p1X, p1Y, 1, p1X, p1Y, plasmaR);
      plasmaGrad.addColorStop(0, 'rgba(0, 229, 255, 0.85)');
      plasmaGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.25)');
      plasmaGrad.addColorStop(0.85, 'rgba(168, 85, 247, 0.06)');
      plasmaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = plasmaGrad;
      ctx.beginPath();
      ctx.arc(p1X, p1Y, plasmaR, 0, Math.PI * 2);
      ctx.fill();

      // 3. Electric Arcs (thinking only, max 2)
      if (currentState === 'thinking' && Math.random() < 0.12 && activeArcs.length < 2) {
        activeArcs.push({
          startAngle: Math.random() * Math.PI * 2,
          length: (Math.PI / 4) + Math.random() * (Math.PI / 3),
          life: 0,
          maxLife: 6,
        });
      }

      activeArcs.forEach((arc, index) => {
        arc.life++;
        const alpha = 1 - arc.life / arc.maxLife;
        ctx.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.7})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        const arcRadius = 34 + Math.random() * 2;
        for (let s = 0; s <= 5; s++) {
          const a = arc.startAngle + (arc.length / 5) * s;
          const jitter = (Math.random() - 0.5) * 4;
          const ax = center + Math.cos(a) * (arcRadius + jitter);
          const ay = center + Math.sin(a) * (arcRadius + jitter);
          if (s === 0) ctx.moveTo(ax, ay);
          else ctx.lineTo(ax, ay);
        }
        ctx.stroke();
        if (arc.life >= arc.maxLife) activeArcs.splice(index, 1);
      });

      // 4. White Core Nucleus
      const nucRadius = 14 * pulse;
      const nucleus = ctx.createRadialGradient(center, center, 0, center, center, nucRadius);
      nucleus.addColorStop(0,"#ffffff");
      nucleus.addColorStop(0.25,"#f8ffff");
      nucleus.addColorStop(0.55,"#8be8ff");
      nucleus.addColorStop(0.82,"rgba(0,229,255,0.22)");
      nucleus.addColorStop(1,"rgba(0,0,0,0)");
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

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-screen" 
    />
  );
};