/**
 * Workspace
 *
 * The main content area. Never empty — the AI Core breathes here
 * as the ambient visual anchor of the interface.
 */

import { AICore } from '../core/AICore'

export function Workspace() {
  return (
    <main
      className="relative z-10 flex flex-1 flex-col items-center justify-center"
    >
      <AICore />

      {/* Subtle tagline below core */}
      <div className="mt-10 text-center">
        <p
          className="font-mono text-xs tracking-[0.25em]"
          style={{ color: 'var(--text-dim)' }}
        >
          COGNITIVE CORE ACTIVE
        </p>
      </div>
    </main>
  )
}
