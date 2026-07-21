import React from 'react';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { BottomCards } from './components/BottomCards';
import { AICore } from './components/core/AICore';
import { NeuralSphere } from './components/core/NeuralSphere';
import './styles/tokens.css';

const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen bg-[#050816] flex overflow-hidden select-none">
      {/* Background Neural Lattice */}
      <NeuralSphere />

      {/* Left Navigation Rail */}
      <Sidebar />

      {/* Center Main Viewport (AI Core & Responsive Bottom Cards) */}
      <main className="flex-1 h-full min-w-0 flex flex-col items-center justify-between py-4 px-2 sm:px-4 z-10 overflow-hidden box-border">
        <div className="flex-1 w-full flex items-center justify-center min-h-0">
          <AICore />
        </div>
        
        {/* Responsive Telemetry Container */}
        <BottomCards />
      </main>

      {/* Right Conversation Stream Panel */}
      <RightPanel />
    </div>
  );
};

export default App;