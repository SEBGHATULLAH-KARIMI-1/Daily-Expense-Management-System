const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const Plus = (p) => <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
export const ChevronRight = (p) => <svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>
export const ChevronLeft = (p) => <svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>
export const Search = (p) => <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
export const Edit = (p) => <svg {...base} {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
export const Trash = (p) => <svg {...base} {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
export const Download = (p) => <svg {...base} {...p}><path d="M12 3v12M7 10l5 5 5-5M4 21h16" /></svg>
export const Close = (p) => <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
export const Tag = (p) => <svg {...base} {...p}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.2" /></svg>
export const User = (p) => <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
export const Check = (p) => <svg {...base} {...p}><path d="m5 12 5 5L20 7" /></svg>
export const Users = (p) => <svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2 21a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 21a7 7 0 0 0-3-5.7" /></svg>
export const Key = (p) => <svg {...base} {...p}><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l3 3" /></svg>
export const LogOut = (p) => <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
