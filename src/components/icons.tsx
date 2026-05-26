import * as React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number): React.SVGAttributes<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

export const Dashboard = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M3 12L12 4l9 8"/><path d="M5 10v10h14V10"/></svg>
)
export const Bed = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M3 18V8h8a4 4 0 0 1 4 4v6"/><path d="M3 14h18"/><path d="M21 14v4"/></svg>
)
export const BedDouble = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M2 18V8h20v10"/><path d="M2 14h20"/><path d="M7 12V9h4v3"/><path d="M13 12V9h4v3"/></svg>
)
export const Users = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)
export const User = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
export const UserCircle = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.5 19a6 6 0 0 1 11 0"/></svg>
)
export const Calendar = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
)
export const CalendarDays = Calendar
export const CalendarClock = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 10h14M8 2v4"/><circle cx="18" cy="18" r="4"/><path d="M18 16.5V18l1 1"/></svg>
)
export const Clock = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
)
export const Shield = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>
)
export const ClipboardList = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 4V2h6v2"/><path d="M9 11h6M9 15h6M9 7h6"/></svg>
)
export const LogOut = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>
)
export const Search = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
)
export const Plus = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14"/></svg>
)
export const Pencil = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
)
export const Trash = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
)
export const Check = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M20 6L9 17l-5-5"/></svg>
)
export const X = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>
)
export const AlertCircle = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
)
export const ArrowRight = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
)
export const Eye = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
)
export const EyeOff = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 3.94-4.94"/><path d="M9.9 4.24A10.06 10.06 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.06 3.06"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M2 2l20 20"/></svg>
)
export const KeyRound = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="8" cy="15" r="4"/><path d="M10.5 12.5L19 4M16 7l3 3"/></svg>
)
export const Wrench = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M14.7 6.3a4.95 4.95 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a4.95 4.95 0 0 0 6.4-6.4l-3 3-2.5-2.5 3-3z"/></svg>
)
export const ChevronDown = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M6 9l6 6 6-6"/></svg>
)
export const ChevronRight = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M9 6l6 6-6 6"/></svg>
)
export const Copy = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
)
export const Home = Dashboard
