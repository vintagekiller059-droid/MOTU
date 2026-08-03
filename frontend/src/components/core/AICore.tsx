import React, { memo } from 'react';
import { useUIStore } from '../../stores/ui-store';
import { OrbitalRing } from './OrbitalRing';
import { EnergyParticles } from './EnergyParticles';
import { FloatingParticles } from './FloatingParticles';

// AICore — Premium Glass Sphere with Orbital Arms
// Apple + Nothing + Teenage Engineering aesthetic
// Reference: premium glass sphere with orbital rings (inspiration only)

export const AICore: React.FC = memo(() => {
  const { currentMode } = useUIStore();

  const isIdle = currentMode === 'idle';
  const isThinking = currentMode === 'thinking';
  const isSpeaking = currentMode === 'speaking';

  const sphereScale = isSpeaking ? 1.12 : isThinking ? 1.08 : 1.0;
  const glowIntensity = isSpeaking ? 0.8 : isThinking ? 0.6 : 0.3;
  const lightOpacity = isSpeaking ? 1 : isThinking ? 0.95 : 0.9;
  const currentSpeed = isSpeaking ? '1.2s' : isThinking ? '2s' : '4s';

  return (
    <div className="relative flex items-center justify-center w-[600px] h-[600px] select-none will-change-transform">
      <style>{`
        @keyframes sphere-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes inner-light-pulse {
          0%, 100% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes current-flow {
          0% { stroke-dashoffset: 200; opacity: 0.1; }
          50% { opacity: 0.85; }
          100% { stroke-dashoffset: 0; opacity: 0.1; }
        }
        @keyframes orbit-arm-1 {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes orbit-arm-2 {
          from { transform: rotateX(70deg) rotateZ(45deg); }
          to { transform: rotateX(70deg) rotateZ(405deg); }
        }
        @keyframes orbit-arm-3 {
          from { transform: rotateX(70deg) rotateZ(90deg); }
          to { transform: rotateX(70deg) rotateZ(450deg); }
        }
        @keyframes orbit-arm-4 {
          from { transform: rotateX(70deg) rotateZ(135deg); }
          to { transform: rotateX(70deg) rotateZ(495deg); }
        }
        @keyframes glossy-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          25% { transform: translate(6px, -10px) scale(1.2); opacity: 1; }
          50% { transform: translate(-3px, -5px) scale(0.9); opacity: 0.75; }
          75% { transform: translate(5px, 3px) scale(1.1); opacity: 0.85; }
        }
        @keyframes glossy-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          33% { transform: translate(-8px, 6px) scale(1.25); opacity: 1; }
          66% { transform: translate(5px, -3px) scale(0.85); opacity: 0.7; }
        }
        @keyframes glossy-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.45; }
          20% { transform: translate(3px, 8px) scale(1.15); opacity: 0.9; }
          60% { transform: translate(-6px, -6px) scale(1.3); opacity: 1; }
          80% { transform: translate(2px, -2px) scale(0.95); opacity: 0.65; }
        }
        @keyframes glossy-float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.55; }
          40% { transform: translate(-5px, -8px) scale(1.2); opacity: 1; }
          80% { transform: translate(8px, 5px) scale(0.9); opacity: 0.75; }
        }
        @keyframes glossy-float-5 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          30% { transform: translate(10px, 3px) scale(1.25); opacity: 1; }
          70% { transform: translate(-3px, -10px) scale(1.05); opacity: 0.8; }
        }
        @keyframes glossy-float-6 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50% { transform: translate(-7px, 7px) scale(1.15); opacity: 0.95; }
        }
        @keyframes glossy-float-7 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          35% { transform: translate(4px, -6px) scale(1.3); opacity: 1; }
          75% { transform: translate(-4px, 4px) scale(0.9); opacity: 0.7; }
        }
      `}</style>

      <FloatingParticles />

      {/* Ceramic Base Disc */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '260px',
          height: '90px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) translateY(48px) perspective(1400px) rotateX(60deg)',
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(245,245,240,0.16) 0%, rgba(210,210,205,0.08) 45%, rgba(0,0,0,0) 75%)',
          boxShadow:
            'inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -6px 12px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />

      {/* === FOUR ELEGANT ORBITAL ARMS === */}
      {/* Arm 1 — slow, wide */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '420px',
          height: '420px',
          top: '50%',
          left: '50%',
          marginLeft: '-210px',
          marginTop: '-210px',
          borderRadius: "50%",
          border: "1px solid rgba(127,232,255,0.12)",
          boxShadow: "0 0 0 0.5px rgba(127,232,255,0.08), inset 0 0 12px rgba(127,232,255,0.04)",
          animation: "orbit-arm-1 28s linear infinite",
          transformOrigin: "50% 50%",
        }}
      />
      {/* Arm 2 — medium */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '380px',
          height: '380px',
          top: '50%',
          left: '50%',
          marginLeft: '-190px',
          marginTop: '-190px',
          borderRadius: "50%",
          border: "1px solid rgba(54,207,255,0.1)",
          boxShadow: "0 0 0 0.5px rgba(54,207,255,0.06), inset 0 0 10px rgba(54,207,255,0.03)",
          animation: "orbit-arm-2 20s linear infinite",
          transformOrigin: "50% 50%",
        }}
      />
      {/* Arm 3 — faster */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '340px',
          height: '340px',
          top: '50%',
          left: '50%',
          marginLeft: '-170px',
          marginTop: '-170px',
          borderRadius: "50%",
          border: "1px solid rgba(127,232,255,0.08)",
          boxShadow: "0 0 0 0.5px rgba(127,232,255,0.05), inset 0 0 8px rgba(127,232,255,0.02)",
          animation: "orbit-arm-3 14s linear infinite",
          transformOrigin: "50% 50%",
        }}
      />
      {/* Arm 4 — fastest, inner */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '300px',
          height: '300px',
          top: '50%',
          left: '50%',
          marginLeft: '-150px',
          marginTop: '-150px',
          borderRadius: "50%",
          border: "1px solid rgba(54,207,255,0.06)",
          boxShadow: "0 0 0 0.5px rgba(54,207,255,0.04), inset 0 0 6px rgba(54,207,255,0.02)",
          animation: "orbit-arm-4 10s linear infinite",
          transformOrigin: "50% 50%",
        }}
      />

      {/* AI Heart */}
      <div className="relative w-[140px] h-[140px] flex items-center justify-center z-10">

        {/* EnergyParticles — CLIPPED to sphere boundary */}
        <div className="absolute inset-0 rounded-full overflow-hidden z-10">
          <EnergyParticles currentState={currentMode} />
        </div>

        {/* === TRANSPARENT GLASS SPHERE === */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden transition-all duration-700 ease-out z-20"
          style={{
            transform: `scale(${sphereScale})`,
            animation: isIdle ? 'sphere-breathe 5s ease-in-out infinite' : 'none',
          }}
        >
          {/* === CENTERED WHITE VOLUMETRIC CORE === */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '48px',
              height: '48px',
              top: '50%',
              left: '50%',
              background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,${lightOpacity}) 0%, rgba(240,250,255,${lightOpacity * 0.98}) 15%, rgba(200,245,255,${lightOpacity * 0.85}) 35%, rgba(127,232,255,${lightOpacity * 0.55}) 60%, transparent 90%)`,
              filter: 'blur(2px)',
              animation: isIdle ? 'inner-light-pulse 4s ease-in-out infinite' : 'inner-light-pulse 1.4s ease-in-out infinite',
              transition: 'background 0.5s ease',
            }}
          />

          {/* Soft cyan energy fill from core */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${glowIntensity * 0.6}) 0%, rgba(220,248,255,${glowIntensity * 0.75}) 10%, rgba(127,232,255,${glowIntensity * 0.55}) 25%, rgba(54,207,255,${glowIntensity * 0.3}) 45%, transparent 65%)`,
              mixBlendMode: 'screen',
              transition: 'background 0.6s ease',
            }}
          />

          {/* Blue energy near edges */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, transparent 50%, rgba(54,207,255,${glowIntensity * 0.35}) 72%, rgba(36,160,255,${glowIntensity * 0.2}) 88%, transparent 100%)`,
              mixBlendMode: 'screen',
            }}
          />

          {/* Animated plasma currents inside */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 140 140"
            style={{ opacity: isIdle ? 0.4 : 0.85, transition: "opacity 0.6s ease" }}
          >
            <defs>
              <linearGradient id="v1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(200,245,255,0.8)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <linearGradient id="v2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(100,220,255,0.7)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <path
              d="M 30 50 Q 50 30 70 55 Q 90 80 110 60"
              fill="none"
              stroke="url(#v1)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray="200"
              style={{ animation: `current-flow ${currentSpeed} ease-in-out infinite` }}
            />
            <path
              d="M 25 80 Q 45 100 70 75 Q 95 50 115 70"
              fill="none"
              stroke="url(#v2)"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeDasharray="200"
              style={{ animation: `current-flow ${currentSpeed} ease-in-out infinite 0.5s` }}
            />
            <path
              d="M 50 25 Q 60 50 50 75 Q 40 100 55 115"
              fill="none"
              stroke="url(#v1)"
              strokeWidth="0.7"
              strokeLinecap="round"
              strokeDasharray="200"
              style={{ animation: `current-flow ${currentSpeed} ease-in-out infinite 1s` }}
            />
          </svg>

          {/* === 7 GLOSSY FLOATING PARTICLES === */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '5px',
              height: '5px',
              top: '32%',
              left: '38%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,1) 0%, rgba(210,245,255,0.85) 40%, rgba(127,232,255,0.45) 100%)',
              boxShadow: '0 0 6px rgba(200,245,255,0.7), 0 0 14px rgba(127,232,255,0.4), 0 0 22px rgba(54,207,255,0.2)',
              animation: 'glossy-float-1 6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '3.5px',
              height: '3.5px',
              top: '58%',
              left: '60%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(190,240,255,0.75) 45%, rgba(54,207,255,0.4) 100%)',
              boxShadow: '0 0 5px rgba(200,245,255,0.6), 0 0 11px rgba(127,232,255,0.35), 0 0 18px rgba(54,207,255,0.15)',
              animation: 'glossy-float-2 7s ease-in-out infinite 0.8s',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '4.5px',
              height: '4.5px',
              top: '42%',
              left: '30%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.98) 0%, rgba(210,245,255,0.8) 40%, rgba(127,232,255,0.45) 100%)',
              boxShadow: '0 0 6px rgba(200,245,255,0.65), 0 0 13px rgba(127,232,255,0.38), 0 0 20px rgba(54,207,255,0.18)',
              animation: 'glossy-float-3 8s ease-in-out infinite 1.5s',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '3px',
              height: '3px',
              top: '65%',
              left: '46%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(180,240,255,0.7) 45%, rgba(54,207,255,0.35) 100%)',
              boxShadow: '0 0 4px rgba(200,245,255,0.55), 0 0 9px rgba(127,232,255,0.3), 0 0 15px rgba(54,207,255,0.12)',
              animation: 'glossy-float-4 5.5s ease-in-out infinite 2.2s',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '4px',
              height: '4px',
              top: '36%',
              left: '64%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(210,245,255,0.75) 40%, rgba(127,232,255,0.4) 100%)',
              boxShadow: '0 0 5px rgba(200,245,255,0.6), 0 0 12px rgba(127,232,255,0.35), 0 0 19px rgba(54,207,255,0.15)',
              animation: 'glossy-float-5 6.5s ease-in-out infinite 3s',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '3.5px',
              height: '3.5px',
              top: '52%',
              left: '52%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.92) 0%, rgba(200,245,255,0.72) 45%, rgba(127,232,255,0.38) 100%)',
              boxShadow: '0 0 5px rgba(200,245,255,0.58), 0 0 10px rgba(127,232,255,0.32), 0 0 16px rgba(54,207,255,0.14)',
              animation: 'glossy-float-6 7.5s ease-in-out infinite 1.2s',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '4px',
              height: '4px',
              top: '48%',
              left: '22%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.94) 0%, rgba(210,245,255,0.78) 40%, rgba(54,207,255,0.42) 100%)',
              boxShadow: '0 0 5px rgba(200,245,255,0.62), 0 0 11px rgba(127,232,255,0.36), 0 0 17px rgba(54,207,255,0.16)',
              animation: 'glossy-float-7 5s ease-in-out infinite 2.8s',
            }}
          />

          {/* Glass thickness — edge darkening for depth */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, transparent 42%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.12) 82%, rgba(0,0,0,0.18) 100%)`,
            }}
          />

          {/* Fresnel rim lighting — glass catches light at edges */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, transparent 55%, rgba(255,255,255,0.07) 78%, rgba(180,240,255,0.12) 90%, rgba(54,207,255,0.1) 100%)`,
            }}
          />

          {/* GLASS SHELL — transparent, only surface properties */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'transparent',
              boxShadow: `
                inset 0 1px 3px rgba(255,255,255,0.3),
                inset 0 -2px 6px rgba(0,0,0,0.12),
                0 0 0 0.5px rgba(255,255,255,0.1),
                0 0 45px rgba(54,207,255,${glowIntensity * 0.45})
              `,
              transition: 'box-shadow 0.6s ease',
            }}
          />

          {/* Top reflection — sharp surface highlight */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '50px',
              height: '22px',
              top: '10px',
              left: '26px',
              background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.8) 0%, transparent 70%)',
              filter: 'blur(2px)',
              transform: 'rotate(-12deg)',
            }}
          />

          {/* Side reflection */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '14px',
              height: '38px',
              top: '30px',
              right: '14px',
              background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.45) 0%, transparent 70%)',
              filter: 'blur(3px)',
              transform: 'rotate(18deg)',
            }}
          />

          {/* Bottom bounce light */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '70px',
              height: '24px',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse at 50% 50%, rgba(54,207,255,0.3) 0%, transparent 70%)',
              filter: 'blur(4px)',
            }}
          />

          {/* Inner rim refraction */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22), inset 0 0 14px rgba(180,240,255,0.1)',
            }}
          />
        </div>
      </div>
    </div>
  );
});

AICore.displayName = 'AICore';