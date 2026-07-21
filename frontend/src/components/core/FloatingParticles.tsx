import React, { useMemo } from "react";

interface Particle {
  id: number;
  size: number;
  left: number;
  top: number;
  opacity: number;
  duration: number;
  delay: number;
  variant: "float" | "drift" | "slow";
  drift: number;
  dist: number;
}

const PARTICLE_COUNT = 12;

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const seed = ((i * 9301 + 49297) % 233280) / 233280;
    const seed2 = ((i * 49297 + 9301) % 233280) / 233280;
    const seed3 = ((i * 16807 + 0) % 2147483647) / 2147483647;

    particles.push({
      id: i,
      size: 1 + Math.floor(seed * 2),
      left: Math.floor(seed2 * 100),
      top: Math.floor(seed3 * 100),
      opacity: 0.08 + seed * 0.16,
      duration: 18 + Math.floor(seed * 10),
      delay: Math.floor(seed2 * 4.8),
      variant: (["float", "drift", "slow"] as const)[i % 3],
      drift: (seed - 0.5) * 60,
      dist: -80 - Math.floor(seed3 * 60),
    });
  }
  return particles;
}

const ParticleDot = React.memo(function ParticleDot({ p }: { p: Particle }) {
  const animClass =
    p.variant === "drift"
      ? "animate-float-drift"
      : p.variant === "slow"
      ? "animate-float-slow"
      : "animate-float";

  return (
    <div
      className={`absolute rounded-full bg-cyan-300 pointer-events-none ${animClass}`}
      style={{
        width: p.size,
        height: p.size,
        left: `${p.left}%`,
        top: `${p.top}%`,
        opacity: p.opacity,
        ["--float-duration" as string]: `${p.duration}s`,
        ["--float-delay" as string]: `${p.delay}s`,
        ["--particle-opacity" as string]: p.opacity,
        ["--float-drift" as string]: `${p.drift}px`,
        ["--float-dist" as string]: `${p.dist}px`,
      }}
    />
  );
});

export default function FloatingParticles() {
  const particles = useMemo(() => generateParticles(PARTICLE_COUNT), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <ParticleDot key={p.id} p={p} />
      ))}
    </div>
  );
}
