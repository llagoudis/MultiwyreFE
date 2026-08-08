/* Inline SVG icons lifted verbatim from the design handoff (index.html). */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (extra: P = {}) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...extra,
});

export const IcPlus = (p: P) => (
  <svg {...base({ strokeWidth: 2.2, ...p })}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
export const IcClose = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
export const IcCheck = (p: P) => (
  <svg {...base({ strokeWidth: 2.6, ...p })}><polyline points="20 6 9 17 4 12" /></svg>
);
export const IcCopy = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
);
export const IcEdit = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
export const IcTrash = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
);
export const IcClock = (p: P) => (
  <svg {...base({ strokeWidth: 2.4, ...p })}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>
);
export const IcLockClosed = (p: P) => (
  <svg {...base({ strokeWidth: 2.4, ...p })}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const IcXCircle = (p: P) => (
  <svg {...base({ strokeWidth: 2.4, ...p })}><circle cx="12" cy="12" r="9" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
);
export const IcShieldLock = (p: P) => (
  <svg {...base({ strokeWidth: 1.7, ...p })}><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.5" r="1.3" /></svg>
);
export const IcSearch = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.7" y2="16.7" /></svg>
);
export const IcRefresh = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><path d="M21 12a9 9 0 1 1-3-6.7" /><polyline points="21 4 21 9 16 9" /></svg>
);
export const IcCard = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
);
export const IcInfo = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
export const IcKebab = (p: P) => (
  <svg width="4" height="15" viewBox="0 0 4 16" fill="none" {...p}><circle cx="2" cy="2" r="2" fill="#D1D5DB" /><circle cx="2" cy="8" r="2" fill="#D1D5DB" /><circle cx="2" cy="14" r="2" fill="#D1D5DB" /></svg>
);
export const IcWalletEmpty = (p: P) => (
  <svg {...base({ strokeWidth: 1.7, ...p })}><rect x="2" y="6" width="20" height="14" rx="2.5" /><path d="M2 11h20" /><path d="M17 3H7" /></svg>
);
export const IcCamera = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
);
