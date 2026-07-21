import React, { useMemo } from "react";

interface OrbitalRingProps {
  radius: number;
  tiltX: number;
  tiltY: number;
  duration: number;
  direction: "cw" | "ccw";
  strokeWidth?: number;
  opacity?: number;
  showParticle?: boolean;
}

const OrbitalRing = React.memo(function OrbitalRing({
  radius,
  tiltX,
  tiltY,
  duration,
  direction,
  strokeWidth = 1,
  opacity = 0.35,
  showParticle = true,
}: OrbitalRingProps) {
  const size = radius * 2 + 8;
  const center = size / 2;

  const animClass = useMemo(() => {
    if (direction === "cw") {
      if (tiltX > 70) return "animate-orbit-cw-2";
      return "animate-orbit-cw";
    }
    if (tiltX > 70) return "animate-orbit-ccw-2";
    return "animate-orbit-ccw";
  }, [direction, tiltX]);

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={animClass}
        style={{
          position: "absolute",
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          willChange: "transform",
        }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(0, 242, 254, 0.4)"
          strokeWidth={strokeWidth}
          opacity={opacity}
        />
      </svg>
      {showParticle && (
        <div
          className="absolute rounded-full bg-cyan-300 pointer-events-none"
          style={{
            width: 4,
            height: 4,
            animation: `ringParticleTravel ${duration}s linear infinite`,
            ["--orbit-radius" as string]: `${radius}px`,
            opacity: 0.7,
            willChange: "transform",
          }}
        />
      )}
    </div>
  );
});

export default OrbitalRing;