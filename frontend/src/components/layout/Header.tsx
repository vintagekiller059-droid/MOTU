/**
 * Header
 *
 * Premium glass status bar with glass cards for metrics.
 * No plain text — everything is contained in glass surfaces.
 */

export function Header() {
  return (
    <header
      className="glass relative z-50 flex items-center justify-between px-5"
      style={{
        height: 'var(--status-bar-height)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Left: Brand + Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className="h-2 w-2 rounded-full animate-connection-pulse"
            style={{ backgroundColor: 'var(--ai-dot)' }}
          />
          <span
            className="font-mono text-sm font-medium tracking-[0.15em]"
            style={{ color: 'var(--text-primary)' }}
          >
            MOTU
          </span>
        </div>

        <div
          className="glass-card flex items-center gap-2 px-2.5 py-1"
          style={{ borderRadius: 4 }}
        >
          <span
            className="font-mono text-[10px] tracking-wider uppercase"
            style={{ color: 'var(--text-accent-dim)' }}
          >
            Online
          </span>
        </div>
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-3">
        <StatusBadge label="CPU" value="—%" />
        <StatusBadge label="RAM" value="—GB" />
        <StatusBadge label="Model" value="—" />
        <span
          className="font-mono text-xs"
          style={{ color: 'var(--text-dim)' }}
        >
          v1.0
        </span>
      </div>
    </header>
  )
}

function StatusBadge({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="glass-card flex items-center gap-2 px-2.5 py-1"
      style={{ borderRadius: 4 }}
    >
      <span
        className="font-mono text-[10px] tracking-wider uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      <span
        className="font-mono text-[10px]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {value}
      </span>
    </div>
  )
}
