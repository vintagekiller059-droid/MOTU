/**
 * AnimatedBackground
 *
 * Premium animated background using only CSS transforms and opacity.
 * No Canvas, no WebGL, no requestAnimationFrame.
 *
 * Layers:
 * 1. Base dark color
 * 2. Large radial gradient (slow ambient shift)
 * 3. Secondary radial gradient (counter-shift)
 * 4. Noise texture overlay
 */

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Layer 1: Base */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'var(--bg-base)' }}
      />

      {/* Layer 2: Primary ambient glow */}
      <div
        className="animate-bg-shift-1 absolute"
        style={{
          inset: '-20%',
          background:
            'radial-gradient(ellipse at 40% 50%, rgba(0, 255, 170, 0.035) 0%, transparent 55%)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Layer 3: Secondary ambient glow */}
      <div
        className="animate-bg-shift-2 absolute"
        style={{
          inset: '-20%',
          background:
            'radial-gradient(ellipse at 70% 30%, rgba(0, 150, 255, 0.02) 0%, transparent 50%)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Layer 4: Subtle bottom glow */}
      <div
        className="animate-ambient absolute"
        style={{
          bottom: '-30%',
          left: '-10%',
          right: '-10%',
          height: '80%',
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(0, 255, 170, 0.02) 0%, transparent 60%)',
        }}
      />

      {/* Layer 5: Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  )
}
