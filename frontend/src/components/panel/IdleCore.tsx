import { AICore } from '../core/AICore'

export function IdleCore() {
  return (
    <main className="relative z-10 flex flex-1 flex-col items-center justify-center">
      <AICore />
      <div className="mt-10 text-center">
        <p className="font-mono text-xs tracking-[0.25em]" style={{ color: 'var(--text-dim)' }}>
          COGNITIVE CORE ACTIVE
        </p>
      </div>
    </main>
  )
}