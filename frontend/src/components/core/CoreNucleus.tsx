import React, { memo } from 'react';
import { useUIStore } from '../../stores/ui-store';
import { useCoreStore } from '../../stores/core-store';
import { EnergyParticles } from './EnergyParticles';

export const CoreNucleus = memo(() => {
  const { currentMode } = useUIStore();
  const { signalPhase } = useCoreStore();

  const isIdle = currentMode === 'idle';
  const isThinking = currentMode === 'thinking';
  const isSpeaking = currentMode === 'speaking';

  const baseGlow = isSpeaking ? 0.8 : isThinking ? 0.6 : 0.3;
  const baseLight = isSpeaking ? 1 : isThinking ? 0.95 : 0.9;
  const phaseBoost =
    signalPhase === 'core-processing'
      ? 0.4
      : signalPhase === 'transmitting'
      ? 0.1
      : signalPhase === 'answering'
      ? 0.35
      : 0;
  const glowIntensity = Math.min(1, baseGlow + phaseBoost);
  const lightOpacity = Math.min(1, baseLight + phaseBoost);
  const currentSpeed = isSpeaking ? '1.2s' : isThinking ? '2s' : '4s';
  const sphereScale =
    isSpeaking ? 1.12 : isThinking ? 1.08 : signalPhase === 'core-processing' ? 1.06 : 1.0;

  return (
    <div className="relative w-[140px] h-[140px] flex items-center justify-center z-20">
      {/* EnergyParticles — clipped to sphere boundary */}
      <div className="absolute inset-0 rounded-full overflow-hidden z-10">
        <EnergyParticles currentState={currentMode} />
      </div>

      {/* Glass Sphere */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden transition-all duration-700 ease-out z-20"
        style={{
          transform: `scale(${sphereScale})`,
          animation: isIdle ? 'sphere-breathe 5s ease-in-out infinite' : 'none',
        }}
      >
        {/* Centered white volumetric core */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '48px',
            height: '48px',
            top: '50%',
            left: '50%',
            background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,${lightOpacity}) 0%, rgba(240,250,255,${lightOpacity * 0.98}) 15%, rgba(200,245,255,${lightOpacity * 0.85}) 35%, rgba(127,232,255,${lightOpacity * 0.55}) 60%, transparent 90%)`,
            filter: 'blur(2px)',
            animation: isIdle
              ? 'inner-light-pulse 4s ease-in-out infinite'
              : 'inner-light-pulse 1.4s ease-in-out infinite',
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
          style={{ opacity: isIdle ? 0.4 : 0.85, transition: 'opacity 0.6s ease' }}
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

        {/* 7 glossy floating particles */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '5px',
            height: '5px',
            top: '32%',
            left: '38%',
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,1) 0%, rgba(210,245,255,0.85) 40%, rgba(127,232,255,0.45) 100%)',
            boxShadow:
              '0 0 6px rgba(200,245,255,0.7), 0 0 14px rgba(127,232,255,0.4), 0 0 22px rgba(54,207,255,0.2)',
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
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(190,240,255,0.75) 45%, rgba(54,207,255,0.4) 100%)',
            boxShadow:
              '0 0 5px rgba(200,245,255,0.6), 0 0 11px rgba(127,232,255,0.35), 0 0 18px rgba(54,207,255,0.15)',
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
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.98) 0%, rgba(210,245,255,0.8) 40%, rgba(127,232,255,0.45) 100%)',
            boxShadow:
              '0 0 6px rgba(200,245,255,0.65), 0 0 13px rgba(127,232,255,0.38), 0 0 20px rgba(54,207,255,0.18)',
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
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(180,240,255,0.7) 45%, rgba(54,207,255,0.35) 100%)',
            boxShadow:
              '0 0 4px rgba(200,245,255,0.55), 0 0 9px rgba(127,232,255,0.3), 0 0 15px rgba(54,207,255,0.12)',
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
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(210,245,255,0.75) 40%, rgba(127,232,255,0.4) 100%)',
            boxShadow:
              '0 0 5px rgba(200,245,255,0.6), 0 0 12px rgba(127,232,255,0.35), 0 0 19px rgba(54,207,255,0.15)',
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
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.92) 0%, rgba(200,245,255,0.72) 45%, rgba(127,232,255,0.38) 100%)',
            boxShadow:
              '0 0 5px rgba(200,245,255,0.58), 0 0 10px rgba(127,232,255,0.32), 0 0 16px rgba(54,207,255,0.14)',
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
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.94) 0%, rgba(210,245,255,0.78) 40%, rgba(54,207,255,0.42) 100%)',
            boxShadow:
              '0 0 5px rgba(200,245,255,0.62), 0 0 11px rgba(127,232,255,0.36), 0 0 17px rgba(54,207,255,0.16)',
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

        {/* Fresnel rim lighting */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 55%, rgba(255,255,255,0.07) 78%, rgba(180,240,255,0.12) 90%, rgba(54,207,255,0.1) 100%)`,
          }}
        />

        {/* Glass shell */}
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

        {/* Top reflection */}
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
  );
});

CoreNucleus.displayName = 'CoreNucleus';