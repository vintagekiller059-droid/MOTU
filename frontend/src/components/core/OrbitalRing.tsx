/**
 * OrbitalRing
 *
 * A single orbital ring rendered as SVG ellipse.
 * CSS 3D transform creates the tilted orbit effect.
 * GPU-composited via transform only.
 */

interface OrbitalRingProps {
  size: number
  tilt: number
  rotation: number
  duration: number
  opacity: number
  strokeWidth?: number
}

export function OrbitalRing({
  size,
  tilt,
  rotation,
  duration,
  opacity,
  strokeWidth = 1,
}: OrbitalRingProps) {
  const rx = size * 0.42
  const ry = size * 0.12
  const cx = size / 2
  const cy = size / 2

  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        width: size,
        height: size,
        transform: `rotateX(${tilt}deg) rotateZ(${rotation}deg)`,
        animation: `orbitSpin${duration > 25 ? '3' : duration > 22 ? '2' : '1'} ${duration}s linear infinite`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ overflow: 'visible' }}
      >
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          stroke="var(--text-accent)"
          strokeWidth={strokeWidth}
          opacity={opacity}
          style={{
            filter: 'drop-shadow(0 0 3px var(--text-accent))',
          }}
        />
      </svg>
    </div>
  )
}
