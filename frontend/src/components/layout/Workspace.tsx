/**
 * Workspace
 *
 * The main content area. Renders exactly one panel based on activePanel
 * from ui-store. Never empty — falls back to IdleCore (AI Core ambient
 * anchor) when no panel is selected.
 */

import { useUIStore } from '../../stores/ui-store'
import { ChatPanel } from '../panel/ChatPanel'
import { MemoryPanel } from '../panel/MemoryPanel'
import { VoicePanel } from '../panel/VoicePanel'
import { AutomationPanel } from '../panel/AutomationPanel'
import { SettingsPanel } from '../settings/SettingsPanel'
import { IdleCore } from '../panel/IdleCore'

export function Workspace() {
  const activePanel = useUIStore((s) => s.activePanel)

  switch (activePanel) {
    case 'chat':
      return <ChatPanel />
    case 'memory':
      return <MemoryPanel />
    case 'voice':
      return <VoicePanel />
    case 'automation':
      return <AutomationPanel />
    case 'settings':
      return (
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
          <SettingsPanel />
        </main>
      )
    default:
      return <IdleCore />
  }
}