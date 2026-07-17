import React, { useState } from 'react';
import { Compass, Brain, Terminal, Layers, Settings2 } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('brain');
  
  const nodes = [
    { id: 'compass', icon: Compass },
    { id: 'brain', icon: Brain },
    { id: 'terminal', icon: Terminal },
    { id: 'layers', icon: Layers },
    { id: 'settings', icon: Settings2 }
  ];

  return (
    <div className="w-20 h-[calc(100vh-48px)] my-6 ml-6 bg(rgba(5,8,20,0.25)) backdrop-blur-[16px] border border-white/[0.04] flex flex-col items-center py-8 justify-between shrink-0 z-30 rounded-[24px]">
      
      {/* OS Identity Brand Core Emblem */}
      <div className="w-10 h-10 rounded-full border border-[#00E5FF]/30 flex items-center justify-center font-mono text-xs text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.15)] bg-black/40">
        M
      </div>

      {/* Minimal Icon Stack List */}
      <div className="flex flex-col gap-6">
        {nodes.map((node) => {
          const Icon = node.icon;
          const isSelected = activeTab === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setActiveTab(node.id)}
              className={`p-3 rounded-xl transition-all duration-300 relative group`}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-xl shadow-[0_0_12px_rgba(0,229,255,0.1)]" />
              )}
              <Icon className={`w-4 h-4 transition-all duration-300 relative z-10 ${
                isSelected ? 'text-[#00E5FF] drop-shadow-[0_0_6px_#00E5FF]' : 'text-[#8EA7C2] hover:text-white'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Online Status Dot Indicator */}
      <div className="w-1.5 h-1.5 rounded-full bg-[#38FFD1] shadow-[0_0_8px_#38FFD1]" />
    </div>
  );
};

export default Sidebar;