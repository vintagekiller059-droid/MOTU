import React, { useEffect, useRef, useMemo } from "react";
import OrbitalRing from "./OrbitalRing";
import FloatingParticles from "./FloatingParticles";

interface RingConfig {
  radius: number;
  tiltX: number;
  tiltY: number;
  duration: number;
  direction: "cw" | "ccw";
  strokeWidth: number;
  opacity: number;
}

const RINGS: RingConfig[] = [
  { radius: 140, tiltX: 72, tiltY: 12, duration: 18, direction: "cw", strokeWidth: 1.5, opacity: 0.5 },
  { radius: 170, tiltX: 64, tiltY: -8, duration: 24, direction: "ccw", strokeWidth: 1.2, opacity: 0.4 },
  { radius: 200, tiltX: 78, tiltY: 20, duration: 32, direction: "cw", strokeWidth: 1, opacity: 0.3 },
  { radius: 230, tiltX: 55, tiltY: -16, duration: 40, direction: "ccw", strokeWidth: 0.8, opacity: 0.25 },
];

const CoreCenter = React.memo(function CoreCenter() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 180,
          height: 180,
          background: "radial-gradient(circle, rgba(0,242,254,0.12) 0%, transparent 70%)",
          animation: "outerGlowBreathe 5s ease-in-out infinite",
        }}
      />
      {/* Inner glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          background: "radial-gradient(circle, rgba(0,242,254,0.2) 0%, transparent 70%)",
        }}
      />
      {/* Core body */}
      <div
        className="relative rounded-full"
        style={{
          width: 80,
          height: 80,
          background: "radial-gradient(circle at 30% 30%, #00f2fe, #0077ff 60%, #001a33 100%)",
          boxShadow: "0 0 40px rgba(0,242,254,0.4), inset 0 0 16px rgba(255,255,255,0.15)",
          animation: "coreBreathe 4s ease-in-out infinite",
        }}
      />
      {/* Inner pulse */}
      <div
        className="absolute rounded-full"
        style={{
          width: 60,
          height: 60,
          background: "radial-gradient(circle, rgba(0,242,254,0.25) 0%, transparent 70%)",
          animation: "coreBreatheInner 3.5s ease-in-out infinite",
          animationDelay: "0.7s",
        }}
      />
      {/* Center dot */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          width: 12,
          height: 12,
          opacity: 0.9,
          boxShadow: "0 0 12px rgba(0,242,254,0.8)",
        }}
      />
    </div>
  );
});

const OrbitalRings = React.memo(function OrbitalRings() {
  return (
    <>
      {RINGS.map((ring, i) => (
        <OrbitalRing
          key={i}
          radius={ring.radius}
          tiltX={ring.tiltX}
          tiltY={ring.tiltY}
          duration={ring.duration}
          direction={ring.direction}
          strokeWidth={ring.strokeWidth}
          opacity={ring.opacity}
          showParticle={i < 2}
        />
      ))}
    </>
  );
});

export default function AICore() {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  // Restored canvas background for visibility
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = 650);
    let height = (canvas.height = 650);

    const nodes = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.04)";
      ctx.fillStyle = "rgba(56, 255, 209, 0.15)";
      ctx.lineWidth = 0.6;

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

  const containerStyle = useMemo(
    () => ({
      perspective: 800,
      transformStyle: "preserve-3d" as const,
    }),
    []
  );

  return (
    <div className="flex-1 w-full flex items-center justify-center relative select-none overflow-hidden bg-[#050816]">
      {/* Canvas Background Layer */}
      <canvas
        ref={bgCanvasRef}
        className="absolute w-[650px] h-[650px] pointer-events-none mix-blend-screen opacity-70"
      />

      {/* Core Container */}
      <div
        className="relative flex items-center justify-center"
        style={containerStyle}
      >
        <div className="relative" style={{ width: 500, height: 500 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <OrbitalRings />
          </div>
          <FloatingParticles />
          <div className="absolute inset-0 flex items-center justify-center">
            <CoreCenter />
          </div>
        </div>
      </div>
    </div>
  );
}