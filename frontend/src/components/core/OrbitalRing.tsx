import React from 'react';

type MOTUState = string;

interface OrbitalRingProps {
  radius: number;
  speed: number;
  title: string;
  subtitle?: string;
  currentState: MOTUState;
  reverse?: boolean;
}

// Extend CSSProperties to accept custom properties
interface CustomCSSProperties extends React.CSSProperties {
  '--spin-duration'?: string;
}

export const OrbitalRing: React.FC<OrbitalRingProps> = ({
  radius,
  speed,
  title,
  subtitle,
  currentState,
  reverse = false,
}) => {
  const getSpeedMultiplier = () => {
    switch (currentState) {
      case 'listening': return 1.8;
      case 'thinking': return 3.5;
      case 'speaking': return 1.2;
      default: return 1.0;
    }
  };

  const duration = speed / getSpeedMultiplier();
  const animationClass = reverse ? 'spin-ccw' : 'spin-cw';

  const style: CustomCSSProperties = {
    width: `${radius}px`,
    height: `${radius}px`,
    '--spin-duration': `${duration}s`,
  };

  return (
    <div
      className={`absolute rounded-full pointer-events-none ${animationClass}`}
      style={style}
    >
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="0.4" />
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="rgba(6, 182, 212, 0.35)"
          strokeWidth="0.8"
          strokeDasharray="0.5 2.5"
        />
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="rgba(56, 189, 248, 0.6)"
          strokeWidth="1.2"
          strokeDasharray="12 40 4 40 8 60"
        />
        <circle cx="50" cy="2" r="0.8" fill="#38bdf8" className="drop-shadow-[0_0_3px_#06b6d4]" />
        <circle cx="98" cy="50" r="0.8" fill="#38bdf8" className="drop-shadow-[0_0_3px_#06b6d4]" />
      </svg>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
        <span className="font-mono text-[7px] font-semibold tracking-[0.2em] text-cyan-300 uppercase bg-[#050816]/80 px-1 rounded border border-cyan-500/20 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">
          {title}
        </span>
        {subtitle && (
          <span className="font-mono text-[5.5px] tracking-[0.15em] text-slate-400 uppercase mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};