import { AnimatedBackground } from '../background/AnimatedBackground'
import { Header } from './Header'
import { Workspace } from './Workspace'
import { FloatingDock } from './FloatingDock'
import { useSystemInit } from '../../hooks/use-system-init'

export function AppShell() {
  useSystemInit()

  return (
    <div
      className="relative flex h-screen w-screen flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <AnimatedBackground />
      <Header />
      <Workspace />
      <FloatingDock />
    </div>
  )
}