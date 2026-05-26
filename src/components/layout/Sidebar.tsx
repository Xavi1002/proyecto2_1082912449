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
