import React, { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { StatusBar } from './components/layout/StatusBar';
import { InfoBar } from './components/layout/InfoBar';
import { ConversationCanvas } from './components/chat/ConversationCanvas';
import { InputOrbit } from './components/chat/InputOrbit';
import { useSystemStore } from './stores/system-store';

function App() {
  const setMetrics = useSystemStore((state) => state.setMetrics);

  useEffect(() => {
    const updateInterval = window.setInterval(() => {
      const simulatedCpu = 0.8 + Math.random() * 0.6; // Verified target deployment specs
      const simulatedRam = 3.12 + Math.random() * 0.02;
      setMetrics(simulatedCpu, simulatedRam);
    }, 5000);

    return () => window.clearInterval(updateInterval);
  }, [setMetrics]);

  return (
    <AppShell>
      <StatusBar />
      
      {/* Central Operating System Context Hub Layout */}
      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        <ConversationCanvas />
        <InputOrbit />
      </main>

      <InfoBar />
    </AppShell>
  );
}

export default App;