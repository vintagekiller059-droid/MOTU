export function MemoryPanel() {
  return (
    <main className="relative z-10 flex flex-1 flex-col items-center justify-center">
      <div className="glass-card px-8 py-6 text-center">
        <p className="font-mono text-xs tracking-[0.2em]" style={{ color: 'var(--text-accent-dim)' }}>
          V2 — NOT YET ACTIVE
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Memory Engine is planned for v2.
        </p>
      </div>
    </main>
  )
}