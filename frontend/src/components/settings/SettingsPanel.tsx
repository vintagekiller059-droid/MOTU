// SettingsPanel component
// Theme + default model selection — uses existing design tokens only

import { useUIStore, type Theme } from '../../stores/ui-store'
import { useSystemStore } from '../../stores/system-store'

const THEMES: Theme[] = ['dark', 'light', 'cyberpunk']

export function SettingsPanel() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  const modelName = useSystemStore((s) => s.modelName)
  const availableModels = useSystemStore((s) => s.availableModels)
  const setModelName = useSystemStore((s) => s.setModelName)
  const ollamaConnected = useSystemStore((s) => s.ollamaConnected)

  return (
    <div className="glass-card w-full max-w-md px-6 py-6">
      <p
        className="font-mono text-xs tracking-[0.2em]"
        style={{ color: 'var(--text-accent-dim)' }}
      >
        SETTINGS
      </p>

      <div className="mt-5">
        <p
          className="mb-2 text-xs uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Theme
        </p>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className="flex-1 rounded-lg px-3 py-2 text-sm capitalize transition-gpu"
              style={{
                background:
                  theme === t ? 'var(--bg-glass-active)' : 'var(--bg-glass)',
                border:
                  theme === t
                    ? '1px solid var(--border-accent)'
                    : '1px solid var(--border-subtle)',
                color:
                  theme === t ? 'var(--text-accent)' : 'var(--text-secondary)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p
          className="mb-2 text-xs uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Default Model
        </p>

        {!ollamaConnected ? (
          <p className="text-sm" style={{ color: 'var(--color-status-error)' }}>
            Ollama is not reachable. Start Ollama to select a model.
          </p>
        ) : availableModels.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No models found. Pull one with `ollama pull llama3.1`.
          </p>
        ) : (
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            {availableModels.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} {m.parameterCount ? `(${m.parameterCount})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}