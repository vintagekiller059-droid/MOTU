/**
 * FloatingDock
 *
 * Glass dock with icon-only buttons.
 * Rounded, blurred, minimal, elegant.
 * Hover scale animation. Active state glow.
 * No text labels.
 */

import {
  MessageSquare,
  Brain,
  Mic,
  Settings,
  Zap,
} from 'lucide-react'
import { useUIStore } from '../../stores/ui-store'

const DOCK_ITEMS = [
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'memory', icon: Brain, label: 'Memory' },
  { id: 'voice', icon: Mic, label: 'Voice' },
  { id: 'automation', icon: Zap, label: 'Automation' },
  { id: 'settings', icon: Settings, label: 'Settings' },
] as const

export function FloatingDock() {
  const activeId = useUIStore((s) => s.activePanel)
  const togglePanel = useUIStore((s) => s.togglePanel)

  return (
    <div className="relative z-50 flex items-center justify-center pb-4">
      <div
        className="glass flex items-center gap-1 px-2 py-2"
        style={{
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {DOCK_ITEMS.map((item) => {
          const isActive = activeId === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => togglePanel(item.id)}
              className="relative flex items-center justify-center transition-all duration-200"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: isActive
                  ? 'var(--bg-glass-active)'
                  : 'transparent',
                border: isActive
                  ? '1px solid var(--border-accent)'
                  : '1px solid transparent',
                boxShadow: isActive ? 'var(--glow-accent)' : 'none',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1.15)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-glass-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                style={{
                  color: isActive
                    ? 'var(--text-accent)'
                    : 'var(--text-secondary)',
                  transition: 'color 200ms ease-out',
                }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}