import React from 'react';

type MOTUState = string;

interface OrbitalRingProps {
  radius: number;
  speed: number;
  title: string;
  subtitle?: string;
  currentState: MOTUState;
  reverse?: boolean;
  /** Stack position: 0 = outermost/largest ring (bottom of the physical
   *  disc stack), 4 = innermost/smallest ring (top of the stack). Drives
   *  how far this ring rises during "speaking" — bottom rises least,
   *  top rises highest, per spec. */
  ringIndex: number;
}

interface CustomCSSProperties extends React.CSSProperties {
  '--spin-duration'?: string;
}

/**
 * Vertical lift (px) for this ring's stack position, per state.
 *
 * idle     — 0. Rings rest flush on the ceramic base.
 * listening— small graduated lift ("appears close to base" — inferred,
 *            see chat note; not an explicit bullet in this patch's spec).
 * thinking — 0. Explicitly "stays low" — independence is communicated
 *            through rotation only, not height.
 * speaking — full graduated lift. Bottom ring (index 0) rises least,
 *            top ring (index 4) rises highest.
 */
function getRingLift(state: string, ringIndex: number): number {
  switch (state) {
    case 'listening': {
      const steps = [2, 4, 6, 8, 10];
      return steps[ringIndex] ?? 10;
    }
    case 'speaking': {
      const steps = [6, 12, 18, 24, 30];
      return steps[ringIndex] ?? 30;
    }
    case 'thinking':
    case 'idle':
    default:
      return 0;
  }
}

export const OrbitalRing: React.FC<OrbitalRingProps> = ({
  radius,
  speed,
  title,
  subtitle,
  currentState,
  reverse = false,
  ringIndex,
}) => {
  const getSpeedMultiplier = () => {
    // Small deterministic per-ring offset (derived from ringIndex, never
    // Math.random — must stay stable across re-renders) so rings read as
    // rotating independently during "thinking" instead of in lockstep.
    const jitter = ringIndex % 2 === 0 ? 1.2 : 0.85;

    switch (currentState) {
      case 'listening':
        return 1.8;
      case 'thinking':
        return 3.5 * jitter;
      case 'speaking':
        return 1.2;
      default:
        return 0.4; // idle — "very slow movement"
    }
  };

  const lift = getRingLift(currentState, ringIndex);
  const duration = speed / getSpeedMultiplier();
  const animationClass = reverse ? 'spin-ccw' : 'spin-cw';

  // Outer wrapper: the permanent disc tilt (rotateX) plus the per-state
  // lift. This is a plain inline style + CSS `transition` — NOT a
  // keyframe animation — so animations.css doesn't need to change, and
  // it never conflicts with the rotation animation living on the child
  // element below (a CSS animation's transform keyframe would otherwise
  // silently overwrite a static transform on the same element).
  const liftStyle: React.CSSProperties = {
    width: `${radius}px`,
    height: `${radius}px`,
    transform: `perspective(1400px) rotateX(60deg) translateY(-${lift}px) translateZ(${lift * 0.8}px)`,
    transition: 'transform 650ms cubic-bezier(0.34, 1.56, 0.64, 1)', // spring-like ease, pure CSS
  };

  const spinStyle: CustomCSSProperties = {
    '--spin-duration': `${duration}s`,
  };

  return (
    <div className="absolute rounded-full pointer-events-none" style={liftStyle}>
      <div className={`absolute inset-0 rounded-full ${animationClass}`} style={spinStyle}>
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
    </div>
  );
};