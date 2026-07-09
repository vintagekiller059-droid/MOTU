import { useState, useEffect, useCallback } from 'react'

const BOOT_STEPS = [
  'Initializing MOTU...',
  'Loading Cognitive Core...',
  'Starting Neural Engine...',
  'Checking Local Models...',
  'Preparing Workspace...',
  'Ready.',
] as const

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const [fadingOut, setFadingOut] = useState(false)

  const advance = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= BOOT_STEPS.length - 1) {
        setFadingOut(true)
        setTimeout(() => {
          setVisible(false)
          setTimeout(onComplete, 300)
        }, 500)
        return prev
      }
      return prev + 1
    })
  }, [onComplete])

  useEffect(() => {
    const delay = currentStep === BOOT_STEPS.length - 1 ? 800 : 550
    const timer = setTimeout(advance, delay)
    return () => clearTimeout(timer)
  }, [currentStep, advance])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        backgroundColor: 'var(--bg-base)',
        transition: 'opacity 500ms ease-out',
        opacity: fadingOut ? 0 : 1,
      }}
    >
      {/* Subtle ambient glow behind boot */}
      <div
        className="pointer-events-none absolute inset-0 animate-ambient"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(0, 255, 170, 0.04) 0%, transparent 60%)',
        }}
      />

      {/* MOTU Brand */}
      <div className="mb-12 text-center">
        <h1
          className="mb-2 font-mono text-3xl font-light tracking-[0.3em]"
          style={{ color: 'var(--text-primary)' }}
        >
          MOTU
        </h1>
        <p
          className="font-mono text-xs tracking-[0.2em]"
          style={{ color: 'var(--text-muted)' }}
        >
          MY OWN THINKING UNIT
        </p>
      </div>

      {/* Boot Steps */}
      <div className="flex w-72 flex-col gap-3">
        {BOOT_STEPS.map((step, index) => {
          const isActive = index === currentStep
          const isPast = index < currentStep
          const isFuture = index > currentStep

          return (
            <div
              key={step}
              className="flex items-center gap-3"
              style={{
                opacity: isFuture ? 0 : isPast ? 0.4 : 1,
                transform: isFuture ? 'translateY(4px)' : 'translateY(0)',
                transition: 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              {/* Status indicator */}
              <div
                className="flex h-4 w-4 items-center justify-center"
                style={{ flexShrink: 0 }}
              >
                {isPast ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="var(--text-accent)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : isActive ? (
                  <div
                    className="h-1.5 w-1.5 rounded-full animate-boot-pulse"
                    style={{ backgroundColor: 'var(--text-accent)' }}
                  />
                ) : (
                  <div
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: 'var(--text-dim)' }}
                  />
                )}
              </div>

              {/* Step text */}
              <span
                className="font-mono text-sm"
                style={{
                  color: isActive
                    ? 'var(--text-primary)'
                    : isPast
                      ? 'var(--text-muted)'
                      : 'var(--text-dim)',
                  transition: 'color 300ms ease-out',
                }}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div
        className="mt-10 h-px w-48 overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--bg-glass-active)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${((currentStep + 1) / BOOT_STEPS.length) * 100}%`,
            backgroundColor: 'var(--text-accent)',
            opacity: 0.6,
            transition: 'width 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />
      </div>

      {/* Version */}
      <p
        className="mt-8 font-mono text-xs"
        style={{ color: 'var(--text-dim)' }}
      >
        v1.0.0
      </p>
    </div>
  )
}
