import React, { useEffect, useRef, memo } from 'react';
import { useUIStore } from '../../stores/ui-store';
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
  { id: 'memory',    icon: '🧠', label: 'MEMORY',    x: 100, y: 100, cx: 180, cy: 140 },
  { id: 'knowledge', icon: '📚', label: 'KNOWLEDGE', x: 420, y: 100, cx: 340, cy: 140 },
  { id: 'reasoning', icon: '⚙️', label: 'REASONING', x: 420, y: 420, cx: 340, cy: 380 },
  { id: 'context',   icon: '🌐', label: 'UNDERSTANDING',   x: 100, y: 420, cx: 180, cy: 380 },
];

interface Pulse {
  moduleId: CognitiveModule;
  t: number;
  speed: number;
}

export const AICore: React.FC = memo(() => {
  const { currentMode } = useUIStore();
  const { activeModules, signalPhase, triggerModules, setPhase, reset } = useCoreStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulsesRef = useRef<Pulse[]>([]);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevModeRef = useRef(currentMode);

     // === BACKEND-DRIVEN STATE MACHINE ===
  useEffect(() => {
    const mode = currentMode;
    const prev = prevModeRef.current;

       // User just sent a message → enter thinking
    if (prev !== 'thinking' && mode === 'thinking') {
      setPhase('activating');
    }
    // Backend started streaming → enter speaking
    if (prev !== 'speaking' && mode === 'speaking') {
      setPhase('answering');
    }

    // Backend finished → return to idle
    if (mode === 'idle' && prev !== 'idle') {
      reset();
    }

    prevModeRef.current = mode;
  }, [currentMode, setPhase, reset]);

  // === CONTINUOUS PULSE SPAWNING DURING THINKING ===
  // Pulses keep spawning for the ENTIRE backend processing time.
  // Stops only when mode switches away from thinking.
  useEffect(() => {
    if (currentMode === 'thinking' && activeModules.length > 0) {
      // Immediate activation → transmitting
      setPhase('transmitting');

      // Spawn pulses continuously while thinking
      spawnTimerRef.current = setInterval(() => {
        activeModules.forEach((modId) => {
          pulsesRef.current.push({
            moduleId: modId,
            t: 0,
            speed: 0.012 + Math.random() * 0.006,
          });
        });
      }, 380);
    }

    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
    };
  }, [currentMode, activeModules, setPhase]);

  // === PHASE TRANSITION: transmitting → core-processing ===
  // When any pulse gets close to center, switch phase
  useEffect(() => {
    if (signalPhase !== 'transmitting') return;

    const check = setInterval(() => {
      const hasNearCore = pulsesRef.current.some((p) => p.t > 0.75 && p.t < 1.0);
      if (hasNearCore) {
        setPhase('core-processing');
        clearInterval(check);
      }
    }, 80);

    return () => clearInterval(check);
  }, [signalPhase, setPhase]);

  // === MAIN CANVAS DRAW LOOP — YOUR EXISTING CODE, PRESERVED ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    const canvasSize = 520;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const center = canvasSize / 2;
    const sphereR = 58;

    // Interior filaments (Exact original configuration)
    const filaments = Array.from({ length: 16 }, () => ({
      angle: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.45,
      width: 0.8 + Math.random() * 1.2,
      reach: 0.55 + Math.random() * 0.38,
      wobbleFreq: 1.5 + Math.random() * 2.2,
      wobbleAmp: 0.15 + Math.random() * 0.25,
    }));

    // Interior floating particles
    const particles = Array.from({ length: 22 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 4 + Math.random() * 48,
      speed: 0.18 + Math.random() * 0.3,
      size: 0.8 + Math.random() * 1.5,
      alpha: 0.35 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    // 3 Fixed Atomic Orbital Paths with Alternating Clockwise / Counter-Clockwise Directions
    const rings = [
      { rx: 220, ry: 75, tilt: 0, rotSpeed: 0.35, color: 'rgba(180, 240, 255, 0.45)' },             // Horizontal - Clockwise
      { rx: 220, ry: 75, tilt: Math.PI / 3, rotSpeed: -0.4, color: 'rgba(180, 240, 255, 0.45)' },     // +60° Tilt - Counter-Clockwise
      { rx: 220, ry: 75, tilt: -Math.PI / 3, rotSpeed: 0.3, color: 'rgba(180, 240, 255, 0.45)' },     // -60° Tilt - Clockwise
    ];

    let time = 0;

    const draw = () => {
      animId = requestAnimationFrame(draw);
      time += 0.016;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      let stateMult = 1.0;
      let glowInt = 1.0;
      let nucBright = 1.4;
      let pulseSpd = 1.5;

      if (currentMode === 'speaking') {
        stateMult = 1.5;
        glowInt = 1.3;
        nucBright = 2.0;
        pulseSpd = 4.0;
      } else if (currentMode === 'thinking') {
        stateMult = 1.1;
        glowInt = 0.9;
        nucBright = 1.5;
        pulseSpd = 2.0;
      } else if (currentMode === 'listening') {
        stateMult = 1.25;
        glowInt = 1.1;
        nucBright = 1.7;
        pulseSpd = 2.4;
      }

      // === SIGNAL PHASE BOOST (BACKEND-DRIVEN) ===
      const phaseBoost =
        signalPhase === 'core-processing' ? 0.45
        : signalPhase === 'transmitting' ? 0.1
        : signalPhase === 'answering' ? 0.35
        : 0;
      glowInt = Math.min(2.2, glowInt + phaseBoost);
      nucBright = Math.min(2.5, nucBright + phaseBoost);

      const pulse = Math.sin(time * pulseSpd) * 0.1 + 1.0;

      // ================= 1. ATOMIC ORBITAL RINGS =================
      rings.forEach((ring) => {
        ctx.save();
        ctx.translate(center, center);

        // 1. Lock the orbital plane's tilt in screen space
        ctx.rotate(ring.tilt);

        // Draw static orbital trajectory line
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = 'rgba(0, 210, 255, 0.6)';
        ctx.shadowBlur = 8;
        ctx.stroke();

        // 2. Rotate nodes independently around the ellipse perimeter (Clockwise / Counter-Clockwise)
        const orbitAngle1 = time * ring.rotSpeed;
        const orbitAngle2 = orbitAngle1 + Math.PI;

        [orbitAngle1, orbitAngle2].forEach((ang) => {
          const nx = ring.rx * Math.cos(ang);
          const ny = ring.ry * Math.sin(ang);

          ctx.beginPath();
          ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 12;
          ctx.fill();
        });

        ctx.restore();
      });

      // ================= 2. FIBER-OPTIC PULSES =================
      // Draw fiber paths
      MODULES.forEach((mod) => {
        const isActive = activeModules.includes(mod.id);

        // Base path
        ctx.beginPath();
        ctx.moveTo(mod.x, mod.y);
        ctx.quadraticCurveTo(mod.cx, mod.cy, center, center);
        ctx.strokeStyle = isActive
          ? 'rgba(127,232,255,0.10)'
          : 'rgba(127,232,255,0.03)';
        ctx.lineWidth = isActive ? 1 : 0.5;
        ctx.stroke();

        // Active glow halo
        if (isActive) {
          ctx.beginPath();
          ctx.moveTo(mod.x, mod.y);
          ctx.quadraticCurveTo(mod.cx, mod.cy, center, center);
          ctx.strokeStyle = 'rgba(127,232,255,0.04)';
          ctx.lineWidth = 5;
          ctx.stroke();
        }
      });

      // Update and draw traveling pulses
      pulsesRef.current = pulsesRef.current.filter((p) => {
        p.t += p.speed;
        return p.t < 1.05;
      });

      pulsesRef.current.forEach((p) => {
        const mod = MODULES.find((m) => m.id === p.moduleId);
        if (!mod) return;

        const t = Math.min(p.t, 1);
        const inv = 1 - t;
        const px = inv * inv * mod.x + 2 * inv * t * mod.cx + t * t * center;
        const py = inv * inv * mod.y + 2 * inv * t * mod.cy + t * t * center;

        // Outer glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 12);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.15, 'rgba(200,245,255,0.7)');
        grad.addColorStop(0.4, 'rgba(127,232,255,0.25)');
        grad.addColorStop(1, 'rgba(127,232,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();

        // Cyan core
        const grad2 = ctx.createRadialGradient(px, py, 0, px, py, 5);
        grad2.addColorStop(0, 'rgba(255,255,255,1)');
        grad2.addColorStop(0.5, 'rgba(180,240,255,0.9)');
        grad2.addColorStop(1, 'rgba(127,232,255,0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        // Bright pinpoint
        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // ================= 3. CENTRAL PLASMA SPHERE =================
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, sphereR - 1, 0, Math.PI * 2);
      ctx.clip();

      // Deep Core Atmosphere
      const atmo = ctx.createRadialGradient(center, center, 0, center, center, sphereR);
      atmo.addColorStop(0, `rgba(200, 245, 255, ${0.4 * glowInt})`);
      atmo.addColorStop(0.45, `rgba(100, 215, 255, ${0.22 * glowInt})`);
      atmo.addColorStop(0.85, `rgba(10, 130, 240, ${0.08 * glowInt})`);
      atmo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = atmo;
      ctx.fill();

      // Plasma Filaments
      filaments.forEach((f) => {
        f.phase += f.speed * 0.016 * stateMult;
        const flicker = Math.sin(f.phase * 2.8 + time * 2.0) * 0.35 + 0.65;
        const reach = f.reach * (0.9 + Math.sin(time * 0.4 + f.phase) * 0.1);

        const startR = 4 * pulse;
        const endR = sphereR * reach;

        const wobble = f.angle + Math.sin(f.phase * f.wobbleFreq) * f.wobbleAmp;
        const startX = center + Math.cos(f.angle) * startR;
        const startY = center + Math.sin(f.angle) * startR;
        const endX = center + Math.cos(wobble) * endR;
        const endY = center + Math.sin(wobble) * endR;

        const midR = (startR + endR) * 0.5;
        const midAngle = f.angle + Math.sin(f.phase * 0.9) * 0.15;
        const midX = center + Math.cos(midAngle) * midR;
        const midY = center + Math.sin(midAngle) * midR;

        ctx.save();
        ctx.shadowColor = `rgba(180, 240, 255, ${0.7 * flicker * glowInt})`;
        ctx.shadowBlur = 8 * stateMult;

        const grad = ctx.createLinearGradient(startX, startY, endX, endY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${1.0 * flicker * nucBright})`);
        grad.addColorStop(0.25, `rgba(210, 248, 255, ${0.85 * flicker})`);
        grad.addColorStop(0.65, `rgba(100, 220, 255, ${0.45 * flicker})`);
        grad.addColorStop(1, 'rgba(0, 150, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = f.width * (0.85 + Math.sin(f.phase * 1.7) * 0.25) * pulse;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX, startY, midX, midY);
        ctx.quadraticCurveTo(
          center + Math.cos(wobble + 0.1) * (endR * 0.75),
          center + Math.sin(wobble + 0.1) * (endR * 0.75),
          endX, endY
        );
        ctx.stroke();
        ctx.restore();
      });

      // Floating Core Particles
      particles.forEach((p) => {
        p.phase += 0.018 * stateMult;
        const prog = (Math.sin(p.phase) + 1) / 2;
        const curR = 3 + (sphereR * 0.85 - 3) * prog;
        const curA = p.angle + p.phase * 0.12;
        const flicker = Math.sin(p.phase * 3.5 + time * 2) * 0.35 + 0.65;

        const px = center + Math.cos(curA) * curR;
        const py = center + Math.sin(curA) * curR;

        const pg = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2.5);
        pg.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * flicker})`);
        pg.addColorStop(0.4, `rgba(180, 240, 255, ${p.alpha * 0.7 * flicker})`);
        pg.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bright Central Nucleus
      const nucPulse = Math.sin(time * pulseSpd * 0.8) * 0.15 + 1.0;
      const nucR = 8 * nucPulse * (nucBright * 0.8);

      const nucleus = ctx.createRadialGradient(center, center, 0, center, center, nucR * 3.8);
      nucleus.addColorStop(0, `rgba(255, 255, 255, 1.0)`);
      nucleus.addColorStop(0.15, `rgba(235, 252, 255, ${0.95 * nucBright})`);
      nucleus.addColorStop(0.4, `rgba(130, 225, 255, ${0.75 * nucBright})`);
      nucleus.addColorStop(0.7, `rgba(30, 170, 255, ${0.3 * nucBright})`);
      nucleus.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = nucleus;
      ctx.beginPath();
      ctx.arc(center, center, nucR * 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ================= 4. GLASS ORB SHELL =================
      ctx.save();
      // Outer border rim
      ctx.beginPath();
      ctx.arc(center, center, sphereR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = 'rgba(0, 200, 255, 0.4)';
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Top Glass Specular Reflection Highlight
      ctx.beginPath();
      ctx.ellipse(center - 16, center - 22, 18, 7, -Math.PI / 4, 0, Math.PI * 2);
      const specGrad = ctx.createLinearGradient(center - 24, center - 28, center - 8, center - 16);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specGrad;
      ctx.fill();

      ctx.restore();
      ctx.restore();
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [currentMode, activeModules, signalPhase]);

  const isSpeaking = currentMode === 'speaking';
  const isModuleActive = (id: CognitiveModule) => activeModules.includes(id);

  return (
    <div className="relative flex items-center justify-center w-[520px] h-[520px] select-none mx-auto">
      {/* Module Labels */}
      {MODULES.map((mod) => {
        const active = isModuleActive(mod.id);
        return (
          <div
            key={mod.id}
            className="absolute flex flex-col items-center gap-0.5 pointer-events-none"
            style={{
              left: `${(mod.x / 520) * 100}%`,
              top: `${(mod.y / 520) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="absolute inset-[-20px] rounded-full transition-opacity duration-700"
              style={{
                background:
                  'radial-gradient(circle, rgba(127,232,255,0.06) 0%, transparent 70%)',
                opacity: active ? 1 : 0,
              }}
            />
            <span
              className="text-sm leading-none transition-all duration-500 ease-out select-none"
              style={{
                opacity: active ? 0.9 : 0.15,
                transform: active ? 'scale(1)' : 'scale(0.9)',
                filter: active
                  ? 'drop-shadow(0 0 4px rgba(127,232,255,0.5))'
                  : 'none',
              }}
            >
              {mod.icon}
            </span>
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

      <canvas
        ref={canvasRef}
        className={`pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isSpeaking ? 'scale-[1.08]' : 'scale-100'
        }`}
      />
    </div>
  );
});

AICore.displayName = 'AICore';