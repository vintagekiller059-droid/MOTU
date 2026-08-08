import React from 'react';
import { Sidebar } from './components/Sidebar';
// ✅ CORRECT (Default import)
import RightPanel from './components/RightPanel';
import { BottomCards } from './components/BottomCards';
import { AICore } from './components/core/AICore';
import { NeuralSphere } from './components/core/NeuralSphere';
import './styles/tokens.css';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
      {/* Matte black with subtle radial gradient - GPU friendly */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,25,35,0.3)_0%,_rgba(5,5,5,1)_70%)] pointer-events-none" />
      
      <NeuralSphere />

      <div className="relative z-10 flex h-full w-full">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Core — scales when sidebar expands */}
        <main className="flex-1 flex items-center justify-center relative pointer-events-none transition-all duration-300 ease-out will-change-transform"
          style={{ transform: 'scale(1)', marginLeft: '80px' }}
          id="main-content"
        >
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