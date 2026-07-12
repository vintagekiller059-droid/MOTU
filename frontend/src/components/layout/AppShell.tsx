import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="w-screen h-screen relative flex flex-col bg-[#0a0a0f] text-slate-200 antialiased overflow-hidden select-none">
      {/* Dynamic Layered CSS-only Background Strategy to avoid WebGL resource usage overhead */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,172,254,0.04)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="relative w-full h-full flex flex-col z-10">
        {children}
      </div>
    </div>
  );
};