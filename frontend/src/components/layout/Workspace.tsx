 /**
 * Workspace
 *
 * The main content area. Never empty — the AI Core breathes here
 * as the ambient visual anchor of the interface.
 */

import { AICore } from '../core/AICore'
import { MessageStream } from '../chat/MessageStream'
import { InputOrbit } from '../chat/InputOrbit'
import { useUIStore } from '../../stores/ui-store'

export function Workspace() {
  const activePanel = useUIStore((s) => s.activePanel)

  if (activePanel === 'chat') {
    return (
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <MessageStream />
        <div className="px-6 pb-4">
          <InputOrbit />
        </div>
      </main>
    )
  }

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