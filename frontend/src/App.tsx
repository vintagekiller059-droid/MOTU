import React from 'react';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { BottomCards } from './components/BottomCards';
import { AICore } from './components/core/AICore';
import { NeuralSphere } from './components/core/NeuralSphere';
import './styles/tokens.css';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans selection:bg-cyan-500/30">
      {/* Deep space background — isolated, never rerenders */}
      <NeuralSphere />

      {/* Main layout */}
      <div className="relative z-10 flex h-full w-full">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Core — isolated from chat state, no pointer events */}
        <main className="flex-1 flex items-center justify-center relative pointer-events-none">
          <AICore />
        </main>

        {/* Right Panel */}
        <RightPanel />
      </div>

      {/* Bottom Telemetry */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 pb-5">
          <BottomCards />
        </div>
      </div>
    </div>
  );
}

export default App;
