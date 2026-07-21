import React, { Suspense, lazy } from "react";

const AICore = lazy(() => import("../core/AICore").then(mod => ({ default: mod.AICore })));

const CoreFallback = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="w-16 h-16 rounded-full bg-cyan-500/10 animate-pulse" />
  </div>
);

export default function IdleCore() {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="relative flex items-center justify-center w-full h-full">
        <Suspense fallback={<CoreFallback />}>
          <AICore />
        </Suspense>
      </div>
    </div>
  );
}