/**
 * AICore
 *
 * The visual identity of MOTU — an energy reactor, not a robot or human.
 * Built entirely with SVG + CSS. No WebGL, no Canvas, no Three.js.
 *
 * Features:
 * - Glowing center with breathing animation
 * - Three orbital rings at different tilts and speeds
 * - Tiny floating particles
 * - All animations use transform / opacity only (GPU-composited)
 */

import { OrbitalRing } from './OrbitalRing'
import { FloatingParticles } from './FloatingParticles'

export function AICore() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      {/* Ambient glow behind core */}
      <div
        className="absolute inset-0 animate-ambient"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(0, 255, 170, 0.06) 0%, transparent 60%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 600 }}>
        <OrbitalRing
          size={220}
          tilt={70}
          rotation={0}
          duration={20}
          opacity={0.35}
          strokeWidth={1}
        />
        <OrbitalRing
          size={200}
          tilt={60}
          rotation={120}
          duration={30}
          opacity={0.25}
          strokeWidth={0.8}
        />
        <OrbitalRing
          size={240}
          tilt={80}
          rotation={240}
          duration={40}
          opacity={0.2}
          strokeWidth={0.6}
        />
      </div>

      {/* Floating particles */}
      <FloatingParticles count={10} radius={130} />

      {/* Center core */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div
          className="absolute h-24 w-24 rounded-full animate-core-breathe"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 255, 170, 0.08) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />

        {/* Inner core */}
        <svg width="48" height="48" viewBox="0 0 48 48" className="animate-core-breathe animate-core-glow">
          <defs>
            <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 255, 170, 0.9)" />
              <stop offset="60%" stopColor="rgba(0, 255, 170, 0.4)" />
              <stop offset="100%" stopColor="rgba(0, 255, 170, 0)" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="12" fill="url(#coreGradient)" />
          <circle cx="24" cy="24" r="6" fill="rgba(0, 255, 170, 0.8)" />
        </svg>
      </div>
    </div>
  )
}
