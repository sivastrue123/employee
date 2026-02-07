import React from 'react';

const LogoMark: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="relative h-10 w-10">
      <svg className="h-full w-full" viewBox="0 0 40 40" role="img" aria-label="EzOfis logo mark">
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b7c1ff" />
            <stop offset="45%" stopColor="#19c1d4" />
            <stop offset="100%" stopColor="#8300e6" />
          </linearGradient>
        </defs>
        <path
          d="M8 10L22 0l10 20-10 20L8 25.5z"
          fill="url(#logo-gradient)"
          opacity="0.9"
        />
        <path
          d="M0 10L14 0l10 20-10 20L0 25.5z"
          fill="url(#logo-gradient)"
          opacity="0.45"
        />
      </svg>
      <div className="absolute inset-0 rounded-xl border border-white/60" />
    </div>
    <div>
      <p className="text-lg font-semibold tracking-tight text-slate-900">EZ WORK HUB</p>
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">powered by EzOfis</p>
    </div>
  </div>
);

export default LogoMark;

