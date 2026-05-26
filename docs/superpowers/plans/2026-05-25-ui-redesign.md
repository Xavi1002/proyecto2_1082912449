# HotelManager Pro UI 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la capa visual completa del frontend a un sistema "Hotel premium minimal" coherente, sin tocar la lógica de negocio ni el backend.

**Architecture:** Sistema de design tokens en CSS vars + extensión Tailwind. Librería interna de componentes UI en `src/components/ui/`. Iconos SVG inline propios en `src/components/icons.tsx` reemplazando `lucide-react`. Tipografías `Fraunces` (serif) + `Inter` (sans) vía `next/font/google`. Refactor visual de las 14 pantallas existentes manteniendo lógica intacta.

**Tech Stack:** Next.js 14 Pages Router, Tailwind v3, TypeScript, next/font, SVG inline. Sin librerías nuevas. Verificación: `npm run dev` + `npm run build` + recorrido manual.

**Spec:** `docs/superpowers/specs/2026-05-25-ui-redesign-design.md`

**TDD nota:** Este plan no usa tests automatizados (no estaban en el plan original y son UI). Cada tarea verifica con: (a) `npx tsc --noEmit` sin errores, (b) `npm run dev` renderiza la pantalla sin warnings de consola, (c) inspección visual manual del usuario antes del siguiente commit.

---

## Task 1: Fundamentos — fuentes y tokens

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/styles/globals.css` (reescritura completa)
- Modify: `src/pages/_app.tsx`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Crear `src/styles/tokens.css`**

```css
:root {
  /* Sand (fondos y surfaces) */
  --sand-50: #FAF7F2;
  --sand-100: #F2EDE3;
  --sand-200: #E8E1D5;

  /* Ink (texto, marca) */
  --ink-900: #1B2A4E;
  --ink-700: #2F3F66;
  --ink-500: #5B6788;
  --ink-400: #8290AC;

  /* Copper (acentos) */
  --copper-500: #B8743D;
  --copper-600: #9A5E2E;

  /* Estados */
  --success-500: #3E8E5A;
  --warning-500: #B8843D;
  --danger-500: #B0463E;

  /* Fuentes (asignadas por next/font en _app.tsx) */
  --font-display: 'Fraunces', Georgia, serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

- [ ] **Step 2: Reescribir `src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './tokens.css';

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--sand-50);
    color: var(--ink-900);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-display);
    color: var(--ink-900);
    letter-spacing: -0.01em;
  }
}
```

- [ ] **Step 3: Cargar fuentes con `next/font` en `_app.tsx`**

Modificar `src/pages/_app.tsx` para añadir `Fraunces` e `Inter`:

```tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Fraunces, Inter } from 'next/font/google'
import { AuthProvider } from '../lib/useAuth'
import ToastHost from '../components/feedback/ToastHost'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${fraunces.variable} ${inter.variable}`}>
      <AuthProvider>
        <Component {...pageProps} />
        <ToastHost />
      </AuthProvider>
    </div>
  )
}
```

(Conserva el resto del `_app.tsx` actual si tiene más lógica — solo añade los `next/font` y envuelve con la div de variables.)

- [ ] **Step 4: Extender `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: 'var(--sand-50)',
          100: 'var(--sand-100)',
          200: 'var(--sand-200)',
        },
        ink: {
          400: 'var(--ink-400)',
          500: 'var(--ink-500)',
          700: 'var(--ink-700)',
          900: 'var(--ink-900)',
        },
        copper: {
          500: 'var(--copper-500)',
          600: 'var(--copper-600)',
        },
        success: { 500: 'var(--success-500)' },
        warning: { 500: 'var(--warning-500)' },
        danger: { 500: 'var(--danger-500)' },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
      boxShadow: {
        paper: '0 1px 2px rgba(27,42,78,0.04), 0 1px 1px rgba(27,42,78,0.03)',
      },
      borderRadius: {
        xl: '12px',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Verificar build y dev**

Run: `npx tsc --noEmit && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3030/login`
Expected: tsc OK + HTTP 200 (asume dev server corriendo).

- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.css src/styles/globals.css src/pages/_app.tsx tailwind.config.js
git commit -m "feat(ui): fundamentos — tokens CSS, fuentes Fraunces/Inter, extension Tailwind"
```

---

## Task 2: Iconos SVG inline

**Files:**
- Create: `src/components/icons.tsx`

- [ ] **Step 1: Crear `src/components/icons.tsx` con todos los iconos**

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/icons.tsx
git commit -m "feat(ui): set de iconos SVG inline (sustituye lucide-react)"
```

---

## Task 3: Componentes UI base

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Select.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Table.tsx`
- Create: `src/components/ui/Tabs.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/Avatar.tsx`
- Create: `src/components/ui/index.ts` (barrel)

- [ ] **Step 1: Crear `Button.tsx`**

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink-900 text-white hover:bg-ink-700 disabled:bg-ink-400',
  secondary: 'bg-white text-ink-900 border border-sand-200 hover:bg-sand-50',
  ghost: 'bg-transparent text-ink-900 hover:bg-sand-100',
  danger: 'bg-danger-500 text-white hover:opacity-90',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{loading ? 'Cargando…' : children}</span>
    </button>
  )
}
```

- [ ] **Step 2: Crear `Card.tsx`**

```tsx
import { HTMLAttributes, ReactNode } from 'react'

type Padding = 'sm' | 'md' | 'lg'
type Props = HTMLAttributes<HTMLDivElement> & {
  padding?: Padding
  children: ReactNode
}

const paddings: Record<Padding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({ padding = 'md', children, className = '', ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`bg-white border border-sand-200 rounded-xl shadow-paper ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Crear `Badge.tsx`**

```tsx
import { ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const tones: Record<Tone, string> = {
  neutral: 'bg-sand-100 text-ink-700',
  success: 'bg-[#E5F0EA] text-success-500',
  warning: 'bg-[#F5E9D9] text-warning-500',
  danger: 'bg-[#F5DDDB] text-danger-500',
  info: 'bg-[#E0E6F2] text-ink-900',
}

export default function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 h-6 text-xs font-medium rounded-full ${tones[tone]}`}>
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Crear `Input.tsx`**

```tsx
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, leftIcon, rightIcon, className = '', id, ...rest }, ref
) {
  const inputId = id || rest.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{leftIcon}</span>
        )}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          className={`w-full h-10 ${leftIcon ? 'pl-10' : 'pl-3'} ${rightIcon ? 'pr-10' : 'pr-3'} bg-white border ${error ? 'border-danger-500' : 'border-sand-200'} rounded-md text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900 transition ${className}`}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">{rightIcon}</span>
        )}
      </div>
      {(error || hint) && (
        <p className={`mt-1.5 text-xs ${error ? 'text-danger-500' : 'text-ink-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  )
})
export default Input
```

- [ ] **Step 5: Crear `Select.tsx`**

```tsx
import { SelectHTMLAttributes, forwardRef } from 'react'

type Option = { value: string; label: string }
type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options: Option[]
}

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, options, id, className = '', ...rest }, ref
) {
  const selectId = id || rest.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink-700 mb-1.5">{label}</label>
      )}
      <select
        {...rest}
        ref={ref}
        id={selectId}
        className={`w-full h-10 px-3 bg-white border ${error ? 'border-danger-500' : 'border-sand-200'} rounded-md text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900 transition ${className}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
    </div>
  )
})
export default Select
```

- [ ] **Step 6: Crear `Modal.tsx`**

```tsx
import { ReactNode, useEffect } from 'react'
import { X } from '../icons'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ open, onClose, title, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div className="relative bg-white border border-sand-200 rounded-xl shadow-paper w-full max-w-lg max-h-[90vh] overflow-auto">
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-sand-200">
            <h2 className="font-display text-xl text-ink-900">{title}</h2>
            <button onClick={onClose} className="text-ink-500 hover:text-ink-900" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-sand-200 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Crear `Table.tsx`**

```tsx
import { ReactNode } from 'react'

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  empty?: ReactNode
  onRowClick?: (row: T) => void
}

export default function Table<T extends { id: number | string }>({ columns, data, empty, onRowClick }: Props<T>) {
  if (data.length === 0 && empty) return <>{empty}</>
  return (
    <div className="bg-white border border-sand-200 rounded-xl shadow-paper overflow-hidden">
      <table className="w-full">
        <thead className="bg-sand-50 border-b border-sand-200">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`text-left text-xs font-medium uppercase tracking-wide text-ink-500 px-4 py-3 ${c.className || ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-sand-200 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-sand-50' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 text-sm text-ink-900 ${c.className || ''}`}>
                  {c.render ? c.render(row) : (row as any)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 8: Crear `Tabs.tsx`**

```tsx
type Tab = { value: string; label: string }
type Props = {
  items: Tab[]
  active: string
  onChange: (value: string) => void
}

export default function Tabs({ items, active, onChange }: Props) {
  return (
    <div className="inline-flex gap-1 p-1 bg-sand-100 rounded-md">
      {items.map((t) => {
        const isActive = active === t.value
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`h-8 px-3 text-sm font-medium rounded-md transition ${
              isActive ? 'bg-white text-ink-900 shadow-paper' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 9: Crear `EmptyState.tsx`**

```tsx
import { ReactNode } from 'react'

type Props = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="bg-white border border-sand-200 rounded-xl shadow-paper px-6 py-16 text-center">
      {icon && <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sand-100 text-ink-500 mb-4">{icon}</div>}
      <h3 className="font-display text-xl text-ink-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-ink-500 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
```

- [ ] **Step 10: Crear `Avatar.tsx`**

```tsx
type Size = 'sm' | 'md' | 'lg'
const sizes: Record<Size, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '·'
}

export default function Avatar({ name, size = 'md' }: { name: string; size?: Size }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-ink-900 text-white font-medium ${sizes[size]}`}
      aria-label={name}
    >
      {initialsOf(name)}
    </span>
  )
}
```

- [ ] **Step 11: Crear `src/components/ui/index.ts`**

```ts
export { default as Button } from './Button'
export { default as Card } from './Card'
export { default as Badge } from './Badge'
export { default as Input } from './Input'
export { default as Select } from './Select'
export { default as Modal } from './Modal'
export { default as Table } from './Table'
export type { Column } from './Table'
export { default as Tabs } from './Tabs'
export { default as EmptyState } from './EmptyState'
export { default as Avatar } from './Avatar'
```

- [ ] **Step 12: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 13: Commit**

```bash
git add src/components/ui/
git commit -m "feat(ui): libreria interna de componentes UI base"
```

---

## Task 4: Layout — Sidebar, Topbar, AppLayout

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Topbar.tsx`
- Modify: `src/components/layout/AppLayout.tsx` (reescritura)
- Modify: `src/components/layout/SeedModeBanner.tsx`

- [ ] **Step 1: Crear `Sidebar.tsx`**

```tsx
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { Dashboard, BedDouble, Users, Calendar, Shield, ClipboardList, UserCircle } from '../icons'

type RoleKey = 'superadmin' | 'recepcionista' | 'cliente'
type Item = { href: string; label: string; icon: ReactNode }

const items: Record<RoleKey, Item[]> = {
  superadmin: [
    { href: '/dashboard', label: 'Dashboard', icon: <Dashboard size={18} /> },
    { href: '/rooms', label: 'Habitaciones', icon: <BedDouble size={18} /> },
    { href: '/clients', label: 'Clientes', icon: <Users size={18} /> },
    { href: '/reservations', label: 'Reservas', icon: <Calendar size={18} /> },
    { href: '/admin/users', label: 'Usuarios', icon: <Shield size={18} /> },
    { href: '/admin/audit', label: 'Auditoría', icon: <ClipboardList size={18} /> },
    { href: '/profile', label: 'Perfil', icon: <UserCircle size={18} /> },
  ],
  recepcionista: [
    { href: '/dashboard', label: 'Dashboard', icon: <Dashboard size={18} /> },
    { href: '/rooms', label: 'Habitaciones', icon: <BedDouble size={18} /> },
    { href: '/clients', label: 'Clientes', icon: <Users size={18} /> },
    { href: '/reservations', label: 'Reservas', icon: <Calendar size={18} /> },
    { href: '/profile', label: 'Perfil', icon: <UserCircle size={18} /> },
  ],
  cliente: [
    { href: '/my-reservations', label: 'Mis Reservas', icon: <Calendar size={18} /> },
    { href: '/profile', label: 'Perfil', icon: <UserCircle size={18} /> },
  ],
}

function normalizeRole(role?: string): RoleKey {
  const raw = (role || '').toLowerCase()
  if (raw.includes('superadmin')) return 'superadmin'
  if (raw.includes('recep')) return 'recepcionista'
  return 'cliente'
}

export default function Sidebar({ role }: { role?: string }) {
  const router = useRouter()
  const list = items[normalizeRole(role)]

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-sand-50 border-r border-sand-200 min-h-screen">
      <div className="px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-3">
          <span className="inline-flex w-9 h-9 items-center justify-center rounded-md bg-ink-900 text-white font-display text-base">HM</span>
          <span className="font-display text-lg text-ink-900 leading-none">HotelManager<br/><span className="text-ink-500 text-xs tracking-widest uppercase">Pro</span></span>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {list.map((it) => {
          const active = router.pathname === it.href || router.pathname.startsWith(it.href + '/')
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`relative flex items-center gap-3 h-10 px-3 rounded-md text-sm transition ${
                active ? 'bg-sand-100 text-ink-900 font-medium' : 'text-ink-500 hover:text-ink-900 hover:bg-sand-100/60'
              }`}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-copper-500 rounded-r" />}
              <span className={active ? 'text-ink-900' : 'text-ink-400'}>{it.icon}</span>
              {it.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Crear `Topbar.tsx`**

```tsx
import { useState } from 'react'
import { ChevronDown, LogOut, UserCircle } from '../icons'
import Avatar from '../ui/Avatar'

type Props = {
  user?: { name: string; email: string; role: string }
  onLogout: () => void
}

export default function Topbar({ user, onLogout }: Props) {
  const [open, setOpen] = useState(false)
  if (!user) return null
  return (
    <header className="h-16 bg-white border-b border-sand-200 flex items-center justify-end px-6">
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 h-10 px-2 rounded-md hover:bg-sand-50 transition"
        >
          <Avatar name={user.name} size="sm" />
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-sm font-medium text-ink-900">{user.name}</div>
            <div className="text-xs text-ink-500">{user.role}</div>
          </div>
          <ChevronDown size={16} className="text-ink-400" />
        </button>
        {open && (
          <div className="absolute right-0 top-12 w-56 bg-white border border-sand-200 rounded-xl shadow-paper p-2 z-30">
            <a href="/profile" className="flex items-center gap-2 px-3 h-10 rounded-md text-sm text-ink-900 hover:bg-sand-50">
              <UserCircle size={18} className="text-ink-500" /> Mi perfil
            </a>
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 h-10 rounded-md text-sm text-danger-500 hover:bg-sand-50">
              <LogOut size={18} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Reescribir `AppLayout.tsx`**

```tsx
import { ReactNode } from 'react'
import { useAuth } from '../../lib/useAuth'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-sand-50 flex">
      <Sidebar role={user?.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user || undefined} onLogout={logout} />
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Refactorizar `SeedModeBanner.tsx`**

```tsx
import { AlertCircle } from '../icons'

export default function SeedModeBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#F5E9D9] border border-warning-500/30 rounded-md">
      <AlertCircle size={20} className="text-warning-500 shrink-0 mt-0.5" />
      <div className="text-sm text-ink-700">
        Modo demo: los datos mostrados son ejemplo. Inicia la base con bootstrap para datos reales.
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Typecheck + verificación visual**

Run: `npx tsc --noEmit`
Expected: sin errores. Abrir `http://localhost:3030/dashboard` autenticado — la sidebar debe verse con el nuevo estilo crema, item activo con barra cobre.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/
git commit -m "feat(ui): redisenio del layout — Sidebar crema con marca serif + Topbar con menu de usuario"
```

---

## Task 5: Login + Register

**Files:**
- Modify: `src/pages/login.tsx` (reescritura)
- Modify: `src/pages/register.tsx`

- [ ] **Step 1: Reescribir `src/pages/login.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { AlertCircle } from '../components/icons'
import { Button, Input } from '../components/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.mustChangePassword) router.replace('/profile')
      else if (user?.role === 'Cliente') router.replace('/my-reservations')
      else router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router, user])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-sand-50">
      {/* Panel marca */}
      <div className="hidden md:flex flex-col justify-between bg-ink-900 text-white p-12">
        <div className="flex items-center gap-3">
          <span className="inline-flex w-11 h-11 items-center justify-center rounded-md bg-white/10 font-display text-lg">HM</span>
          <span className="font-display text-xl">HotelManager Pro</span>
        </div>
        <div>
          <h1 className="font-display text-4xl leading-tight text-white mb-3">Operación hotelera, sin fricción.</h1>
          <p className="text-white/70 max-w-md">Gestiona habitaciones, clientes y reservas desde un panel coherente y rápido.</p>
        </div>
        <div className="text-white/40 text-xs">© HotelManager Pro</div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl text-ink-900 mb-2">Iniciar sesión</h2>
          <p className="text-sm text-ink-500 mb-8">Accede con tus credenciales del sistema.</p>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 mb-4 bg-[#F5DDDB] border border-danger-500/30 rounded-md text-sm text-danger-500">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Correo"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Refactorizar `src/pages/register.tsx`**

Si `/register` está deshabilitado en producción, mostrar una página informativa simple en lugar de un form. Si está activo, replicar el split del login con el form de registro existente. Verificar primero el contenido actual:

```bash
cat src/pages/register.tsx
```

Si el form sigue activo, reusar el split layout del login y reemplazar el form interno con el de registro. Si está deshabilitado, mostrar mensaje:

```tsx
import Link from 'next/link'
import { Button } from '../components/ui'

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 p-8">
      <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-10 max-w-md text-center">
        <h1 className="font-display text-2xl text-ink-900 mb-2">Registro deshabilitado</h1>
        <p className="text-sm text-ink-500 mb-6">Las cuentas de cliente son creadas por la recepción del hotel.</p>
        <Link href="/login"><Button>Volver a iniciar sesión</Button></Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar dev**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3030/login`
Expected: 200. Abrir en navegador: split visible, form funcional.

- [ ] **Step 4: Commit**

```bash
git add src/pages/login.tsx src/pages/register.tsx
git commit -m "feat(ui): login con split layout (panel marca + form) y register simplificado"
```

---

## Task 6: Dashboard + KpiCard

**Files:**
- Modify: `src/components/dashboard/KpiCard.tsx`
- Modify: `src/pages/dashboard.tsx`

- [ ] **Step 1: Reescribir `KpiCard.tsx`**

```tsx
import { ReactNode } from 'react'
import Card from '../ui/Card'

type Props = {
  label: string
  value: string | number
  icon: ReactNode
  hint?: string
}

export default function KpiCard({ label, value, icon, hint }: Props) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
          <p className="mt-3 font-display text-4xl text-ink-900 leading-none">{value}</p>
          {hint && <p className="mt-2 text-xs text-ink-500">{hint}</p>}
        </div>
        <div className="inline-flex w-10 h-10 items-center justify-center rounded-md bg-sand-100 text-ink-700">
          {icon}
        </div>
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Reescribir `src/pages/dashboard.tsx`**

```tsx
import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import SeedModeBanner from '../components/layout/SeedModeBanner'
import KpiCard from '../components/dashboard/KpiCard'
import { Bed, BedDouble, Wrench, CalendarClock } from '../components/icons'
import { Badge, EmptyState, Table, Column } from '../components/ui'

type DashboardData = {
  kpis: { availableRooms: number; occupiedRooms: number; maintenanceRooms: number; activeReservationsToday: number }
  reservationsToday: Array<{ id: number; clientName?: string; roomNumber?: string; checkInDate: string; status: string }>
  mode: 'live' | 'seed'
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/dashboard')
      setData((await res.json()) as DashboardData)
      setLoading(false)
    }
    run()
  }, [])

  const reservations = data?.reservationsToday || []
  const columns: Column<DashboardData['reservationsToday'][number]>[] = [
    { key: 'clientName', header: 'Cliente', render: (r) => r.clientName || '—' },
    { key: 'roomNumber', header: 'Habitación', render: (r) => r.roomNumber || '—' },
    { key: 'checkInDate', header: 'Check-in', render: (r) => r.checkInDate?.slice(0, 10) || '—' },
    { key: 'status', header: 'Estado', render: (r) => <Badge tone={r.status === 'activa' ? 'success' : 'neutral'}>{r.status}</Badge> },
  ]

  return (
    <ProtectedRoute>
      <AppLayout>
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Operación del día</p>
          <h1 className="mt-2 font-display text-4xl text-ink-900">Dashboard</h1>
          <p className="mt-2 text-ink-500">Estado actual del hotel y reservas con check-in hoy.</p>
        </header>

        {data?.mode === 'seed' && <SeedModeBanner />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard label="Disponibles" value={loading ? '—' : data?.kpis.availableRooms ?? 0} icon={<Bed size={20} />} />
          <KpiCard label="Ocupadas" value={loading ? '—' : data?.kpis.occupiedRooms ?? 0} icon={<BedDouble size={20} />} />
          <KpiCard label="Mantenimiento" value={loading ? '—' : data?.kpis.maintenanceRooms ?? 0} icon={<Wrench size={20} />} />
          <KpiCard label="Check-in hoy" value={loading ? '—' : data?.kpis.activeReservationsToday ?? 0} icon={<CalendarClock size={20} />} />
        </div>

        <section>
          <h2 className="font-display text-xl text-ink-900 mb-4">Reservas de hoy</h2>
          {reservations.length === 0 ? (
            <EmptyState
              icon={<CalendarClock size={20} />}
              title="Sin reservas para hoy"
              description="Cuando se cree una reserva con check-in hoy, aparecerá aquí."
            />
          ) : (
            <Table columns={columns} data={reservations} />
          )}
        </section>
      </AppLayout>
    </ProtectedRoute>
  )
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores. Visitar `/dashboard`: KPIs serif grandes, tabla limpia o empty state.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/KpiCard.tsx src/pages/dashboard.tsx
git commit -m "feat(ui): dashboard redisenado con KPIs serif y tabla del dia"
```

---

## Task 6.5: Refactor ProtectedRoute + página index para consistency

**Files:**
- Modify: `src/components/ProtectedRoute.tsx` (solo si está visualmente roto)
- Modify: `src/pages/index.tsx`

- [ ] **Step 1: Revisar `ProtectedRoute.tsx`**

```bash
cat src/components/ProtectedRoute.tsx
```

Si tiene un loading state con estilos viejos, reemplazar el loading con:

```tsx
return (
  <div className="min-h-screen flex items-center justify-center bg-sand-50">
    <p className="text-sm text-ink-500">Cargando…</p>
  </div>
)
```

Sin tocar la lógica de redirect.

- [ ] **Step 2: Actualizar `src/pages/index.tsx`**

```tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user) { router.replace('/login'); return }
    if (user.role === 'Cliente') { router.replace('/my-reservations'); return }
    router.replace('/dashboard')
  }, [isLoading, isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50">
      <p className="text-sm text-ink-500">Redirigiendo…</p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProtectedRoute.tsx src/pages/index.tsx
git commit -m "feat(ui): pulir pantallas de loading y redirect inicial"
```

---

## Task 7: Rooms (lista + new + edit + RoomCard)

**Files:**
- Create: `src/components/RoomCard.tsx`
- Modify: `src/pages/rooms.tsx` (reescritura visual)
- Modify: `src/components/RoomList.tsx` (refactor o remoción)
- Modify: `src/components/RoomForm.tsx` (refactor visual)
- Modify: `src/components/AvailableRooms.tsx` (refactor visual)

- [ ] **Step 1: Crear `src/components/RoomCard.tsx`**

```tsx
import { Badge } from './ui'
import { Pencil, Trash } from './icons'

type Room = {
  id: number
  roomNumber: string | number
  type: string
  pricePerNight: number | string
  status: string
}

type Props = {
  room: Room
  canManage?: boolean
  onEdit?: (room: Room) => void
  onDelete?: (room: Room) => void
}

const tone = (status: string) => {
  const s = status.toLowerCase()
  if (s.includes('dispon')) return 'success' as const
  if (s.includes('ocup')) return 'danger' as const
  if (s.includes('manten') || s.includes('limp')) return 'warning' as const
  return 'neutral' as const
}

export default function RoomCard({ room, canManage, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Habitación</p>
          <p className="font-display text-3xl text-ink-900 leading-none mt-1">{room.roomNumber}</p>
        </div>
        <Badge tone={tone(room.status)}>{room.status}</Badge>
      </div>
      <div>
        <p className="text-sm text-ink-700">{room.type}</p>
        <p className="text-sm text-ink-500 mt-0.5">
          {Number(room.pricePerNight).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} / noche
        </p>
      </div>
      {canManage && (
        <div className="flex gap-2 pt-2 border-t border-sand-200">
          <button onClick={() => onEdit?.(room)} className="inline-flex items-center gap-1 text-xs text-ink-700 hover:text-ink-900">
            <Pencil size={14} /> Editar
          </button>
          <button onClick={() => onDelete?.(room)} className="inline-flex items-center gap-1 text-xs text-danger-500 hover:opacity-80 ml-auto">
            <Trash size={14} /> Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Refactorizar `src/pages/rooms.tsx`**

Leer primero: `cat src/pages/rooms.tsx`. Reescribir conservando toda la lógica de fetch / filtros / permisos, y reemplazar la UI con:

- Header con eyebrow + título serif "Habitaciones".
- Toolbar: `Tabs` para filtro por estado, botón `<Button icon={<Plus />}>Nueva habitación</Button>` para SuperAdmin (alineado a la derecha).
- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` con `RoomCard`.
- Empty state si no hay resultados.

Plantilla:

```tsx
import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import RoomCard from '../components/RoomCard'
import { api } from '../lib/api'
import { useAuth } from '../lib/useAuth'
import { Plus, Bed } from '../components/icons'
import { Button, Tabs, EmptyState } from '../components/ui'

// (mantener tipos y estado actuales)

export default function RoomsPage() {
  // ...lógica intacta (estado, useEffect, handlers)...
  const isSuperAdmin = user?.role === 'SuperAdmin'

  return (
    <ProtectedRoute>
      <AppLayout>
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Inventario</p>
            <h1 className="mt-2 font-display text-4xl text-ink-900">Habitaciones</h1>
            <p className="mt-2 text-ink-500">Gestiona el inventario, estado y precio por noche.</p>
          </div>
          {isSuperAdmin && (
            <Button icon={<Plus size={16} />} onClick={() => router.push('/rooms/new')}>Nueva habitación</Button>
          )}
        </header>

        <div className="mb-6">
          <Tabs items={[{ value: 'all', label: 'Todas' }, { value: 'Disponible', label: 'Disponibles' }, { value: 'Ocupada', label: 'Ocupadas' }, { value: 'Mantenimiento', label: 'Mantenimiento' }]} active={statusFilter} onChange={setStatusFilter} />
        </div>

        {filteredRooms.length === 0 ? (
          <EmptyState icon={<Bed size={20} />} title="Sin habitaciones" description="Cuando crees una habitación aparecerá aquí." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} canManage={isSuperAdmin} onEdit={(r) => router.push(`/rooms/${r.id}/edit`)} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}
```

(Sustituir los nombres `statusFilter`, `setStatusFilter`, `filteredRooms`, `handleDelete` por los reales del archivo actual.)

- [ ] **Step 3: Refactorizar `RoomForm.tsx`**

Mantener handlers, reemplazar layout y campos por `Card` + `Input` + `Select` + `Button` del sistema UI.

- [ ] **Step 4: Refactorizar `AvailableRooms.tsx`**

Solo cambios visuales (cards con la misma estética que `RoomCard`).

- [ ] **Step 5: Eliminar `RoomList.tsx` si quedó huérfano**

```bash
grep -rl "from.*RoomList\|/RoomList'" src/ || echo "(huérfano - se puede borrar)"
```

Si está huérfano: `git rm src/components/RoomList.tsx`.

- [ ] **Step 6: Typecheck + visual**

Run: `npx tsc --noEmit && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3030/rooms`
Expected: tsc OK, HTTP 200, cards con tipografía serif para número, badges de estado en color correcto.

- [ ] **Step 7: Commit**

```bash
git add -A src/pages/rooms.tsx src/pages/rooms* src/components/RoomCard.tsx src/components/RoomForm.tsx src/components/AvailableRooms.tsx src/components/RoomList.tsx
git commit -m "feat(ui): redisenio de habitaciones — RoomCard nueva, toolbar con tabs y boton primario"
```

---

## Task 8: Clients

**Files:**
- Modify: `src/pages/clients.tsx`
- Modify: `src/components/ClientSearchInput.tsx`
- Modify: `src/components/ClientSearch.tsx`

- [ ] **Step 1: Refactorizar `ClientSearchInput.tsx`**

Conservar el debounce 300ms y handlers. Reemplazar el input por `<Input leftIcon={<Search size={16} />} />` del sistema UI.

- [ ] **Step 2: Refactorizar `src/pages/clients.tsx`**

Plantilla:

```tsx
import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import ClientSearchInput from '../components/ClientSearchInput'
import { api } from '../lib/api'
import { Users, Plus } from '../components/icons'
import { Avatar, Badge, Button, EmptyState, Table, Column } from '../components/ui'

// (tipos y lógica actuales)

export default function ClientsPage() {
  // ...lógica intacta...

  const columns: Column<Client>[] = [
    { key: 'avatar', header: '', render: (c) => <Avatar name={c.name} size="sm" />, className: 'w-12' },
    { key: 'name', header: 'Nombre', render: (c) => <span className="font-medium text-ink-900">{c.name}</span> },
    { key: 'email', header: 'Email', render: (c) => <span className="text-ink-500">{c.email}</span> },
    { key: 'document', header: 'Documento', render: (c) => c.document || '—' },
    { key: 'createdAt', header: 'Registro', render: (c) => new Date(c.createdAt).toLocaleDateString('es-CO') },
  ]

  return (
    <ProtectedRoute>
      <AppLayout>
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Huéspedes</p>
            <h1 className="mt-2 font-display text-4xl text-ink-900">Clientes</h1>
            <p className="mt-2 text-ink-500">Búsqueda con prefijos, perfiles con historial.</p>
          </div>
          <Button icon={<Plus size={16} />} onClick={onCreate}>Nuevo cliente</Button>
        </header>

        <div className="mb-6 max-w-md">
          <ClientSearchInput value={query} onChange={setQuery} />
        </div>

        {clients.length === 0 ? (
          <EmptyState icon={<Users size={20} />} title="Sin clientes" description="Cuando registres un cliente aparecerá aquí." />
        ) : (
          <Table columns={columns} data={clients} onRowClick={openDetail} />
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}
```

- [ ] **Step 3: Refactorizar `ClientSearch.tsx`**

Es un componente grande (621 líneas). Mantener toda la lógica, reemplazar solo: contenedor por `Card`, inputs por `Input`/`Select`, botones por `Button`, tabla por `Table`. NO reescribir lógica.

- [ ] **Step 4: Typecheck + visual**

Run: `npx tsc --noEmit && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3030/clients`
Expected: tsc OK, HTTP 200, tabla con avatares y búsqueda funcional.

- [ ] **Step 5: Commit**

```bash
git add -A src/pages/clients.tsx src/components/ClientSearch.tsx src/components/ClientSearchInput.tsx
git commit -m "feat(ui): redisenio de clientes — tabla con avatares y busqueda con input nuevo"
```

---

## Task 9: Reservations

**Files:**
- Modify: `src/pages/reservations.tsx`
- Modify: `src/pages/reservations/new.tsx`
- Modify: `src/components/ReservationForm.tsx`
- Modify: `src/components/ReservationList.tsx`
- Modify: `src/components/UpcomingReservations.tsx`

- [ ] **Step 1: Refactorizar `src/pages/reservations.tsx`**

Plantilla:

```tsx
// ...imports y lógica intacta...
import { Calendar, Plus } from '../components/icons'
import { Badge, Button, EmptyState, Tabs, Table, Column } from '../components/ui'

const tabs = [
  { value: 'all', label: 'Todas' },
  { value: 'activa', label: 'Activas' },
  { value: 'cancelada', label: 'Canceladas' },
]

const tone = (status: string) => status === 'activa' ? 'success' : 'neutral'

// columns con Cliente / Habitación / Check-in / Check-out / Estado / Total

return (
  <ProtectedRoute>
    <AppLayout>
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Operación</p>
          <h1 className="mt-2 font-display text-4xl text-ink-900">Reservas</h1>
          <p className="mt-2 text-ink-500">Listado con filtros por estado y acceso rápido a crear nuevas.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => router.push('/reservations/new')}>Nueva reserva</Button>
      </header>

      <div className="mb-6"><Tabs items={tabs} active={filter} onChange={setFilter} /></div>

      {data.length === 0
        ? <EmptyState icon={<Calendar size={20} />} title="Sin reservas" description="Crea la primera reserva para ver el listado." />
        : <Table columns={columns} data={data} />
      }
    </AppLayout>
  </ProtectedRoute>
)
```

- [ ] **Step 2: Refactorizar `src/pages/reservations/new.tsx` + `ReservationForm.tsx`**

`new.tsx` es pequeño (31 líneas) — solo cambiar wrapper a `AppLayout` + Card. El form (`ReservationForm.tsx`, 327 líneas) mantiene su lógica; reemplazar inputs/selects/buttons por los del sistema UI, dividir en secciones visuales (Cliente · Fechas · Habitación · Resumen).

- [ ] **Step 3: Refactorizar `ReservationList.tsx`** y `UpcomingReservations.tsx`

Solo cambios visuales: contenedores por `Card`, badges de estado, tipografía consistente.

- [ ] **Step 4: Typecheck + visual**

Run: `npx tsc --noEmit && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3030/reservations`
Expected: tsc OK, HTTP 200, tabla con tabs de filtro y botón "Nueva reserva".

- [ ] **Step 5: Commit**

```bash
git add -A src/pages/reservations.tsx src/pages/reservations/new.tsx src/components/Reservation* src/components/UpcomingReservations.tsx
git commit -m "feat(ui): redisenio de reservas — tabla con filtros y form en secciones"
```

---

## Task 10: My-reservations (vista cliente)

**Files:**
- Modify: `src/pages/my-reservations.tsx`

- [ ] **Step 1: Reescribir `src/pages/my-reservations.tsx`**

```tsx
import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import { api } from '../lib/api'
import { Calendar } from '../components/icons'
import { Badge, Card, EmptyState } from '../components/ui'

type Reservation = {
  id: number
  room?: { roomNumber: string; type: string }
  checkInDate: string
  checkOutDate: string
  totalAmount: number | string
  status: string
}

export default function MyReservations() {
  const [items, setItems] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reservations/my').then((r) => setItems(r.data?.reservations || [])).finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute>
      <AppLayout>
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Mi estancia</p>
          <h1 className="mt-2 font-display text-4xl text-ink-900">Mis reservas</h1>
          <p className="mt-2 text-ink-500">Tus reservas pasadas, activas y futuras.</p>
        </header>

        {loading ? null : items.length === 0 ? (
          <EmptyState icon={<Calendar size={20} />} title="Aún no tienes reservas" description="Cuando la recepción registre tu reserva, aparecerá aquí." />
        ) : (
          <div className="grid gap-4">
            {items.map((r) => (
              <Card key={r.id} padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Habitación</p>
                    <p className="font-display text-2xl text-ink-900 mt-1">{r.room?.roomNumber || '—'}</p>
                    <p className="text-sm text-ink-500 mt-0.5">{r.room?.type}</p>
                  </div>
                  <Badge tone={r.status === 'activa' ? 'success' : 'neutral'}>{r.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-sand-200">
                  <div>
                    <p className="text-xs text-ink-500">Check-in</p>
                    <p className="text-sm text-ink-900">{r.checkInDate?.slice(0, 10)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Check-out</p>
                    <p className="text-sm text-ink-900">{r.checkOutDate?.slice(0, 10)}</p>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <p className="text-xs text-ink-500">Total</p>
                  <p className="font-display text-xl text-ink-900">
                    {Number(r.totalAmount).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/my-reservations.tsx
git commit -m "feat(ui): vista cliente — tarjetas de reserva con tipografia serif y badge de estado"
```

---

## Task 11: Profile

**Files:**
- Modify: `src/pages/profile.tsx`

- [ ] **Step 1: Refactorizar `src/pages/profile.tsx`**

Conservar handlers de cambio de contraseña. Reemplazar:
- Wrapper: `AppLayout`.
- Header con eyebrow + título serif "Perfil".
- Sección 1 (datos): `Card` con Avatar grande + name + email + role badge.
- Sección 2 (contraseña): `Card` con `Input` para current/new/confirm, `Button` primario.

- [ ] **Step 2: Typecheck + visual**

Run: `npx tsc --noEmit && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3030/profile`
Expected: tsc OK, HTTP 200.

- [ ] **Step 3: Commit**

```bash
git add src/pages/profile.tsx
git commit -m "feat(ui): perfil con datos del usuario y form de cambio de contrasenia"
```

---

## Task 12: Admin (users + audit + db-setup)

**Files:**
- Modify: `src/pages/admin/users.tsx`
- Modify: `src/pages/admin/audit.tsx`
- Modify: `src/pages/admin/db-setup.tsx`
- Modify: `src/pages/users.tsx`

- [ ] **Step 1: Refactorizar `src/pages/admin/users.tsx`**

- Header + botón "Nuevo usuario".
- Tabla con `Avatar`, Nombre, Email, Rol (`Badge`), Estado activo (`Badge`), fecha, acciones.
- `Modal` para crear usuario; al guardar, mostrar password temporal con `Input readOnly` + botón `<Button icon={<Copy />}>Copiar</Button>`.

Mantener toda la lógica de fetch/POST.

- [ ] **Step 2: Refactorizar `src/pages/admin/audit.tsx`**

Timeline vertical: cada entrada en una card con icono por tipo + timestamp + actor + detalles colapsables (`<details><summary>`).

- [ ] **Step 3: Refactorizar `src/pages/admin/db-setup.tsx`**

`Card` central con título "Diagnóstico de base de datos", badges de conexión, botón "Verificar".

- [ ] **Step 4: Refactorizar `src/pages/users.tsx`**

Misma estética que `admin/users` pero sin modal de creación (página no enlazada desde sidebar — solo herramienta histórica).

- [ ] **Step 5: Typecheck + visual**

Run: `npx tsc --noEmit && for url in /admin/users /admin/audit /admin/db-setup /users; do echo -n "$url: "; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3030$url; done`
Expected: tsc OK, todas las URLs HTTP 200.

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/ src/pages/users.tsx
git commit -m "feat(ui): admin — usuarios con modal de password temporal, auditoria como timeline, db-setup limpio"
```

---

## Task 13: Search + componentes restantes

**Files:**
- Modify: `src/pages/search.tsx`
- Modify: `src/components/OccupancyChart.tsx`
- Modify: `src/components/DashboardStats.tsx`
- Modify: `src/components/NavBar.tsx`
- Modify: `src/components/RoleBasedAccess.tsx`
- Modify: `src/components/feedback/ToastHost.tsx`

- [ ] **Step 1: Verificar uso de `NavBar.tsx`**

```bash
grep -rln "from.*NavBar\|/NavBar'" src/
```

Si está huérfano (después del refactor de login), borrarlo: `git rm src/components/NavBar.tsx`. Si aún se usa, refactorizar visualmente.

- [ ] **Step 2: Refactorizar `src/pages/search.tsx`**

Wrapper `AppLayout`, header con eyebrow + título, contenedor con `ClientSearch` + `OccupancyChart` refactorizado.

- [ ] **Step 3: Refactorizar `OccupancyChart.tsx`**

Reemplazar paleta interna (colores hex hardcoded) por tokens (`var(--success-500)`, `var(--danger-500)`, `var(--warning-500)`). Contenedor en `Card`.

- [ ] **Step 4: Refactorizar `DashboardStats.tsx`**

Si todavía se usa, alinearlo a `KpiCard` o eliminarlo si quedó duplicado.

- [ ] **Step 5: Refactorizar `ToastHost.tsx`**

Reemplazar tipografía + colores por tokens. Estética: `bg-white` con border `sand-200`, icono por tono.

- [ ] **Step 6: Typecheck + visual**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ui): pulir componentes restantes — search, OccupancyChart, ToastHost"
```

---

## Task 14: Limpieza final

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Verify: ningún import de `lucide-react`
- Verify: ningún uso de `--hm-*`

- [ ] **Step 1: Verificar que no quedan imports de lucide-react**

Run: `grep -rln "lucide-react" src/`
Expected: sin resultados. Si hay alguno pendiente, reemplazar con `../components/icons` antes de continuar.

- [ ] **Step 2: Verificar que no quedan `--hm-*`**

Run: `grep -rn "\\-\\-hm\\-" src/`
Expected: sin resultados.

- [ ] **Step 3: Quitar dependencia lucide-react**

```bash
npm uninstall lucide-react
```

- [ ] **Step 4: Build de producción**

Run: `npm run build`
Expected: build OK, sin warnings críticos.

- [ ] **Step 5: Recorrido manual con 3 roles**

Manualmente (anotar resultados):
- Login con `admin@xavi.com / admin123` → llega a `/dashboard`.
- Sidebar muestra SuperAdmin (7 items). Cada link abre la página correcta.
- `/rooms` listado, `/rooms/new`, `/rooms/[id]/edit` funcionales.
- `/clients` con búsqueda, `/reservations` con tabs, `/reservations/new` form.
- `/admin/users` crear usuario → modal con password temporal + copia.
- Logout → vuelve a `/login`.
- Crear un usuario `Recepción` con password temporal, hacer login con él, verificar que sidebar muestra 5 items (sin admin/*).
- Crear un usuario `Cliente`, hacer login, verificar que solo ve `/my-reservations` y `/profile`. Visitar `/rooms` → redirige a `/my-reservations`.

- [ ] **Step 6: Commit final**

```bash
git add package.json package-lock.json
git commit -m "chore: remover dependencia lucide-react tras migrar a iconos SVG inline propios"
git push origin master
```

---

## Self-Review

**1. Spec coverage:**
- Paleta sand/ink/copper → Task 1 ✓
- Fraunces + Inter via next/font → Task 1 ✓
- Tokens CSS → Task 1 ✓
- Iconos SVG inline → Task 2 ✓
- Lib UI compartida → Task 3 ✓
- Sidebar/Topbar/AppLayout → Task 4 ✓
- 14 pantallas (login, register, AppLayout, dashboard, rooms+new+edit, clients, reservations+new, my-reservations, profile, admin/users, admin/audit, db-setup, search, users) → Tasks 5–13 ✓
- Empty states / errores → cubiertos en cada pantalla con `EmptyState` ✓
- Eliminar lucide-react → Task 14 ✓
- Criterio de aceptación (typecheck, build, sin lucide, sin --hm-*) → Task 14 ✓

**2. Placeholder scan:** Sin "TBD" ni "etc". Las plantillas marcadas como "lógica intacta" referencian variables del archivo actual; el ejecutor debe leer el archivo antes de aplicar el diff.

**3. Type consistency:** `Column<T>` se exporta en Task 3 (`src/components/ui/index.ts`) y se usa en Tasks 6, 8, 9, 12. `Avatar` y `Badge` props consistentes. `Button` `variant`/`size`/`icon` consistentes en todas las pantallas.
