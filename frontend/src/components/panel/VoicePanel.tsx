import React, { Suspense, lazy } from "react";

const AICore = lazy(() => import("../core/AICore"));

const CoreFallback = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="w-16 h-16 rounded-full bg-cyan-500/10 animate-pulse" />
  </div>
);

export default function VoicePanel() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-4">
      <div
        className="relative flex items-center justify-center w-full"
        style={{ maxHeight: "25vh", minHeight: 180 }}
      >
        <Suspense fallback={<CoreFallback />}>
          <AICore />
        </Suspense>
      </div>
      <div className="text-center select-none">
        <p className="text-xs tracking-[0.25em] uppercase text-cyan-300/30 font-medium">
          Voice Interface — Standby
        </p>
      </div>
    </div>
  );
}