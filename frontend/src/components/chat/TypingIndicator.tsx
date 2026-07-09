import React from 'react';

export const TypingIndicator: React.FC = React.memo(() => {
  return (
    <div className="flex items-center justify-center w-full py-12 select-none pointer-events-none motu-animate-startup">
      <style>{`
        /* Three independent internal visual layers with distinct prime-number configurations */
        @keyframes motu-core-layer-1 {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.95; }
          50% { transform: scale(1.06) rotate(180deg); opacity: 0.85; }
        }
        @keyframes motu-core-layer-2 {
          0%, 100% { transform: scale(1.03) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(0.96) rotate(-180deg); opacity: 0.9; }
        }
        @keyframes motu-core-layer-3 {
          0%, 100% { transform: scale(0.98) scaleX(1); opacity: 0.8; }
          50% { transform: scale(1.04) scaleX(1.08); opacity: 0.6; }
        }

        /* Unsynchronized, non-overlapping Orbit Loops */
        @keyframes motu-spin-clockwise-prime {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes motu-spin-counter-prime {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        /* Random soft energy ripple emitted every 4-7 seconds (using a 5.3s prime sequence) */
        @keyframes motu-energy-ripple {
          0% { transform: scale(0.8); opacity: 0.4; stroke-width: 2px; }
          40% { opacity: 0.15; }
          100% { transform: scale(2.2); opacity: 0; stroke-width: 0.5px; }
        }

        /* Ambient Halo Pulse */
        @keyframes motu-halo-organic {
          0%, 100% { opacity: 0.14; transform: scale(1); }
          50% { opacity: 0.26; transform: scale(1.03); }
        }

        /* Micro particle floating drift loops */
        @keyframes motu-drift-particle {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-3px) translateX(2px) scale(1.2); opacity: 0.95; }
        }

        .motu-core-c1 { animation: motu-core-layer-1 4.3s cubic-bezier(0.37, 0, 0.63, 1) infinite; transform-origin: 100px 100px; }
        .motu-core-c2 { animation: motu-core-layer-2 6.1s cubic-bezier(0.45, 0, 0.55, 1) infinite; transform-origin: 100px 100px; filter: blur(1px); }
        .motu-core-c3 { animation: motu-core-layer-3 7.9s ease-in-out infinite; transform-origin: 100px 100px; filter: blur(3px); }
        
        .motu-ripple-line { animation: motu-energy-ripple 5.3s cubic-bezier(0.16, 1, 0.3, 1) infinite; transform-origin: 100px 100px; }
        .motu-halo-bg { animation: motu-halo-organic 11s cubic-bezier(0.37, 0, 0.63, 1) infinite; transform-origin: 100px 100px; }

        .motu-orbit-1 { animation: motu-spin-clockwise-prime 13.7s linear infinite; transform-origin: 100px 100px; }
        .motu-orbit-2 { animation: motu-spin-counter-prime 19.3s linear infinite; transform-origin: 100px 100px; }
        .motu-orbit-3 { animation: motu-spin-clockwise-prime 31.1s linear infinite; transform-origin: 100px 100px; }
        
        .motu-pt-drift { animation: motu-drift-particle 4s ease-in-out infinite; transform-origin: center; }
      `}</style>

      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-52 h-52 will-change-transform"
      >
        {/* Objective 4: Soft Halo Base */}
        <circle cx="100" cy="100" r="88" fill="rgba(94, 220, 255, 0.12)" className="motu-halo-bg" />

        {/* Objective 1: Intermittent Energy Ripple */}
        <circle cx="100" cy="100" r="30" stroke="#83EAFF" opacity="0" className="motu-ripple-line" />

        {/* Objective 2: Orbit Rings Group (With explicit physical tilts applied natively via transform matrices) */}
        <g className="motu-rings-group">
          {/* Outer Ring - Tilted Variation 1 */}
          <g transform="rotate(7, 100, 100)">
            <circle cx="100" cy="100" r="74" stroke="#5EDCFF" strokeWidth="1" strokeDasharray="3 22 55 18" opacity="0.18" className="motu-orbit-3" />
          </g>
          {/* Middle Ring - Tilted Variation 2 */}
          <g transform="rotate(-5, 100, 100)">
            <circle cx="100" cy="100" r="56" stroke="#83EAFF" strokeWidth="1.2" strokeDasharray="15 40 8 16 30 25" opacity="0.28" className="motu-orbit-2" />
          </g>
          {/* Inner Ring - Pure Align */}
          <circle cx="100" cy="100" r="38" stroke="#5EDCFF" strokeWidth="1.5" strokeDasharray="25 14 45 12" opacity="0.45" className="motu-orbit-1" />
        </g>

        {/* Objective 3: Asynchronous Ambient Particles Group */}
        <g className="motu-particles-group">
          <g className="motu-orbit-3">
            <circle cx="100" cy="26" r="1.2" fill="#83EAFF" className="motu-pt-drift" style={{ animationDelay: '-0.5s', animationDuration: '3.2s' }} />
            <circle cx="100" cy="174" r="2.2" fill="#5EDCFF" className="motu-pt-drift" style={{ animationDelay: '-1.8s', animationDuration: '4.5s' }} />
          </g>
          <g className="motu-orbit-2">
            <circle cx="44" cy="100" r="1.7" fill="#5EDCFF" className="motu-pt-drift" style={{ animationDelay: '-2.2s', animationDuration: '3.8s' }} />
            <circle cx="156" cy="100" r="1.0" fill="#83EAFF" className="motu-pt-drift" style={{ animationDelay: '-0.9s', animationDuration: '5.1s' }} />
          </g>
          <g className="motu-orbit-1">
            <circle cx="100" cy="62" r="2.0" fill="#83EAFF" className="motu-pt-drift" style={{ animationDelay: '-1.2s', animationDuration: '2.9s' }} />
            <circle cx="138" cy="100" r="1.4" fill="#5EDCFF" className="motu-pt-drift" style={{ animationDelay: '-3.1s', animationDuration: '4.2s' }} />
          </g>
        </g>

        {/* Objective 1: AI Core - Three independent composited blending shapes */}
        <g className="motu-core-group">
          <circle cx="100" cy="100" r="17" fill="#5EDCFF" className="motu-core-c3" style={{ mixBlendMode: 'screen' }} />
          <circle cx="100" cy="100" r="15" fill="#83EAFF" className="motu-core-c2" style={{ mixBlendMode: 'screen' }} />
          <circle cx="100" cy="100" r="13.5" fill="#FFFFFF" className="motu-core-c1" />
        </g>
      </svg>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';