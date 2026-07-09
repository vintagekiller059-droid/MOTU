import { useState, useCallback } from 'react'
import { BootSequence } from './components/boot/BootSequence'
import { AppShell } from './components/layout/AppShell'

function App() {
  const [bootComplete, setBootComplete] = useState(false)

  const handleBootComplete = useCallback(() => {
    setBootComplete(true)
  }, [])

  if (!bootComplete) {
    return <BootSequence onComplete={handleBootComplete} />
  }

  return <AppShell />
}

export default App
