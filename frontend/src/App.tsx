import React, { useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import { useUIStore } from './stores/ui-store';

const AICore = lazy(() => import('./components/core/AICore'));
const ChatPanel = lazy(() => import('./components/panel/ChatPanel'));
const BottomCards = lazy(() => import('./components/BottomCards'));

const SectionFallback = () => (
  <div className="flex-1 w-full h-full bg-[#050814]/40 border border-white/[0.02] rounded-2xl animate-pulse" />
);

export function App() {
  const { updateMetrics } = useUIStore();

  useEffect(() => {
    const metricsTimer = setInterval(() => {
      updateMetrics();
    }, 2500);
    return () => clearInterval(metricsTimer);
  }, [updateMetrics]);

  return (
    <div className="w-screen h-screen flex bg-[#050814] text-white antialiased overflow-hidden select-none m-0 p-0 relative">
      
      {/* Immersive Space Cosmic Ambient Mesh Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d1330]/30 via-[#050814] to-[#020306] pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none z-0" />
      
      <Sidebar />

      {/* Extended Breathing Room Container Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 px-8 gap-4">
        <Suspense fallback={<SectionFallback />}>
          <AICore />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <BottomCards />
        </Suspense>
      </main>

      {/* Primary Interaction Interface Panel (Chat Replace) */}
      <Suspense fallback={<SectionFallback />}>
        <ChatPanel />
      </Suspense>
    </div>
  );
}

export default App;