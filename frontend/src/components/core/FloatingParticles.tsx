import React, { useEffect, useRef } from 'react';

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
}

export const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    const size = 480;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    
    const center = size / 2;

    const particles: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      angle: Math.random() * Math.PI * 2,
      radius: 70 + Math.random() * 150,
      speed: (Math.random() * 0.0015 + 0.0004) * (Math.random() > 0.5 ? 1 : -1),
      size: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.5 + 0.15,
      color: i % 7 === 0 ? '168, 85, 247' : '0, 229, 255', // occasional purple
    }));

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      particles.forEach((p) => {
        p.angle += p.speed;
        const x = center + Math.cos(p.angle) * p.radius;
        const y = center + Math.sin(p.angle) * p.radius;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0" 
    />
  );
};