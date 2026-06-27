import React from 'react';

export default function HeartbeatDivider() {
  return (
    <div style={{ position: 'relative', height: '48px', overflow: 'hidden', margin: '0' }}>
      <svg
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* Base line */}
        <line x1="0" y1="24" x2="1200" y2="24" stroke="var(--color-border)" strokeWidth="1" />

        {/* Heartbeat path — single memorable element */}
        <path
          d="M0,24 L300,24 L340,24 L360,4 L380,44 L400,8 L420,38 L440,24 L480,24 L520,24 L560,24 L600,24 L640,24 L680,24 L700,4 L720,44 L740,8 L760,38 L780,24 L820,24 L860,24 L900,24 L940,24 L980,24 L1000,4 L1020,44 L1040,8 L1060,38 L1080,24 L1200,24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1200"
          strokeDashoffset="1200"
          style={{ animation: 'drawHeartbeat 2.5s ease forwards 0.3s' }}
        />

        {/* Moving dot */}
        <circle r="3.5" fill="var(--color-accent)" opacity="0.85">
          <animateMotion
            dur="2.5s"
            begin="0.3s"
            fill="freeze"
            path="M0,24 L300,24 L340,24 L360,4 L380,44 L400,8 L420,38 L440,24 L480,24 L520,24 L560,24 L600,24 L640,24 L680,24 L700,4 L720,44 L740,8 L760,38 L780,24 L820,24 L860,24 L900,24 L940,24 L980,24 L1000,4 L1020,44 L1040,8 L1060,38 L1080,24 L1200,24"
          />
        </circle>
      </svg>

      <style>{`
        @keyframes drawHeartbeat {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
