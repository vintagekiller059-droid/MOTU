/**
 * FloatingParticles
 *
 * Tiny floating dots around the AI Core.
 * Predefined positions ensure deterministic rendering (no hydration mismatch).
 * Each particle uses a different CSS animation variant for organic motion.
 */

import { useMemo } from 'react'

interface ParticleData {
  id: number
  angle: number
  distance: number
  size: number
  variant: 1 | 2 | 3
  delay: number
  duration: number
}

interface FloatingParticlesProps {
  count?: number
  radius?: number
}

const PARTICLE_SEED: ParticleData[] = [
  { id: 0, angle: 15, distance: 0.7, size: 2, variant: 1, delay: 0, duration: 18 },
  { id: 1, angle: 45, distance: 0.9, size: 1.5, variant: 2, delay: 2, duration: 22 },
  { id: 2, angle: 80, distance: 0.6, size: 2.5, variant: 3, delay: 4, duration: 16 },
  { id: 3, angle: 110, distance: 0.85, size: 1.5, variant: 1, delay: 1, duration: 20 },
  { id: 4, angle: 145, distance: 0.75, size: 2, variant: 2, delay: 3, duration: 24 },
  { id: 5, angle: 175, distance: 0.95, size: 1, variant: 3, delay: 5, duration: 17 },
  { id: 6, angle: 205, distance: 0.65, size: 2.5, variant: 1, delay: 0.5, duration: 19 },
  { id: 7, angle: 240, distance: 0.8, size: 1.5, variant: 2, delay: 2.5, duration: 21 },
  { id: 8, angle: 280, distance: 0.7, size: 2, variant: 3, delay: 1.5, duration: 23 },
  { id: 9, angle: 320, distance: 0.9, size: 1, variant: 1, delay: 3.5, duration: 18 },
  { id: 10, angle: 350, distance: 0.6, size: 2, variant: 2, delay: 4.5, duration: 25 },
  { id: 11, angle: 55, distance: 0.85, size: 1.5, variant: 3, delay: 0.8, duration: 16 },
]

export function FloatingParticles({ count = 10, radius = 130 }: FloatingParticlesProps) {
  const particles = useMemo(() => PARTICLE_SEED.slice(0, count), [count])

  return (
    <div className="pointer-events-none absolute inset-0">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180
        const x = Math.cos(rad) * radius * p.distance
        const y = Math.sin(rad) * radius * p.distance

        return (
          <div
            key={p.id}
            className={`absolute rounded-full animate-particle-${p.variant}`}
            style={{
              left: '50%',
              top: '50%',
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              transform: `translate(${x}px, ${y}px)`,
              backgroundColor: 'var(--text-accent)',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              willChange: 'transform, opacity',
            }}
          />
        )
      })}
    </div>
  )
}
