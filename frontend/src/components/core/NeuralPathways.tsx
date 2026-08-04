import React, { useEffect, useRef, memo } from 'react';
import { useCoreStore, type CognitiveModule } from '../../stores/core-store';

interface ModuleDef {
  id: CognitiveModule;
  icon: string;
  label: string;
  x: number;
  y: number;
  cx: number;
  cy: number;
}

const MODULES: ModuleDef[] = [
  { id: 'memory', icon: '🧠', label: 'MEMORY', x: 155, y: 155, cx: 200, cy: 120 },
  { id: 'knowledge', icon: '📚', label: 'KNOWLEDGE', x: 445, y: 155, cx: 400, cy: 120 },
  { id: 'reasoning', icon: '⚙️', label: 'REASONING', x: 445, y: 445, cx: 400, cy: 480 },
  { id: 'context', icon: '🌐', label: 'UNDERSTANDING', x: 155, y: 445, cx: 200, cy: 480 },
];

interface Pulse {
  moduleId: CognitiveModule;
  t: number;
  speed: number;
}

export const NeuralPathways = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulsesRef = useRef<Pulse[]>([]);
  const spawnedRef = useRef(false);
  const { activeModules, signalPhase } = useCoreStore();

  // Spawn pulses when entering transmitting phase
  useEffect(() => {
    if (signalPhase === 'transmitting' && !spawnedRef.current) {
      spawnedRef.current = true;
      activeModules.forEach((modId, i) => {
        setTimeout(() => {
          pulsesRef.current.push({ moduleId: modId, t: 0, speed: 0.016 + Math.random() * 0.004 });
        }, i * 160);
        setTimeout(() => {
          pulsesRef.current.push({ moduleId: modId, t: 0, speed: 0.016 + Math.random() * 0.004 });
        }, i * 160 + 320);
      });
    }
    if (signalPhase !== 'transmitting') {
      spawnedRef.current = false;
    }
    if (signalPhase === 'idle') {
      pulsesRef.current = [];
    }
  }, [signalPhase, activeModules]);

  // Canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 600 * dpr;
    canvas.height = 600 * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, 600, 600);

      // Update and filter pulses
      pulsesRef.current = pulsesRef.current.filter((p) => {
        p.t += p.speed;
        return p.t < 1.05;
      });

      // Draw fiber paths
      MODULES.forEach((mod) => {
        const isActive = activeModules.includes(mod.id);

        // Base path
        ctx.beginPath();
        ctx.moveTo(mod.x, mod.y);
        ctx.quadraticCurveTo(mod.cx, mod.cy, 300, 300);
        ctx.strokeStyle = isActive
          ? 'rgba(127,232,255,0.10)'
          : 'rgba(127,232,255,0.03)';
        ctx.lineWidth = isActive ? 1 : 0.5;
        ctx.stroke();

        // Active glow halo
        if (isActive) {
          ctx.beginPath();
          ctx.moveTo(mod.x, mod.y);
          ctx.quadraticCurveTo(mod.cx, mod.cy, 300, 300);
          ctx.strokeStyle = 'rgba(127,232,255,0.04)';
          ctx.lineWidth = 5;
          ctx.stroke();
        }
      });

      // Draw traveling pulses
      pulsesRef.current.forEach((p) => {
        const mod = MODULES.find((m) => m.id === p.moduleId);
        if (!mod) return;

        const t = Math.min(p.t, 1);
        const inv = 1 - t;
        const x = inv * inv * mod.x + 2 * inv * t * mod.cx + t * t * 300;
        const y = inv * inv * mod.y + 2 * inv * t * mod.cy + t * t * 300;

        // Outer glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 12);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.15, 'rgba(200,245,255,0.7)');
        grad.addColorStop(0.4, 'rgba(127,232,255,0.25)');
        grad.addColorStop(1, 'rgba(127,232,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Cyan core
        const grad2 = ctx.createRadialGradient(x, y, 0, x, y, 5);
        grad2.addColorStop(0, 'rgba(255,255,255,1)');
        grad2.addColorStop(0.5, 'rgba(180,240,255,0.9)');
        grad2.addColorStop(1, 'rgba(127,232,255,0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Bright pinpoint
        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [activeModules]);

  const isModuleActive = (id: CognitiveModule) => activeModules.includes(id);

  return (
    <div className="absolute inset-0 pointer-events-none z-[5]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: '600px', height: '600px' }}
      />
      {MODULES.map((mod) => {
        const active = isModuleActive(mod.id);
        return (
          <div
            key={mod.id}
            className="absolute flex flex-col items-center gap-1"
            style={{
              left: mod.x,
              top: mod.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Ambient glow when active */}
            <div
              className="absolute inset-[-20px] rounded-full transition-opacity duration-700"
              style={{
                background:
                  'radial-gradient(circle, rgba(127,232,255,0.06) 0%, transparent 70%)',
                opacity: active ? 1 : 0,
              }}
            />

            {/* Icon */}
            <span
              className="text-sm leading-none transition-all duration-500 ease-out select-none"
              style={{
                opacity: active ? 0.9 : 0.15,
                transform: active ? 'scale(1)' : 'scale(0.9)',
                filter: active ? 'drop-shadow(0 0 4px rgba(127,232,255,0.5))' : 'none',
              }}
            >
              {mod.icon}
            </span>

            {/* Label */}
            <span
              className="text-[9px] tracking-[0.22em] font-medium font-mono transition-all duration-500 ease-out whitespace-nowrap"
              style={{
                color: active
                  ? 'rgba(200,245,255,0.85)'
                  : 'rgba(148,163,184,0.25)',
                textShadow: active
                  ? '0 0 8px rgba(127,232,255,0.4)'
                  : 'none',
              }}
            >
              {mod.label}
            </span>

            {/* Status dot */}
            <div
              className="w-1 h-1 rounded-full transition-all duration-500 ease-out mt-0.5"
              style={{
                background: active
                  ? 'rgba(180,240,255,0.9)'
                  : 'rgba(100,116,139,0.2)',
                boxShadow: active
                  ? '0 0 6px 1px rgba(127,232,255,0.6)'
                  : 'none',
                transform: active ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
});

NeuralPathways.displayName = 'NeuralPathways';