import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, BedDouble, Users, CalendarDays, Shield, UserCircle, LogOut, ClipboardList } from 'lucide-react'
import { ReactNode } from 'react'
import { useAuth } from '../../lib/useAuth'

type RoleKey = 'superadmin' | 'recepcionista' | 'cliente'

type SidebarItem = {
  href: string
  label: string
  icon: ReactNode
}

const normalizeRole = (role?: string): RoleKey => {
  const raw = (role || '').toLowerCase()
  if (raw.includes('superadmin')) return 'superadmin'
  if (raw.includes('recep')) return 'recepcionista'
  return 'cliente'
}

const sidebarByRole: Record<RoleKey, SidebarItem[]> = {
  superadmin: [
    { href: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { href: '/rooms', label: 'Habitaciones', icon: <BedDouble size={18} /> },
    { href: '/clients', label: 'Clientes', icon: <Users size={18} /> },
    { href: '/reservations', label: 'Reservas', icon: <CalendarDays size={18} /> },
    { href: '/admin/users', label: 'Administración: Usuarios', icon: <Shield size={18} /> },
    { href: '/admin/audit', label: 'Administración: Auditoría', icon: <ClipboardList size={18} /> },
    { href: '/profile', label: 'Perfil', icon: <UserCircle size={18} /> },
  ],
  recepcionista: [
    { href: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { href: '/rooms', label: 'Habitaciones', icon: <BedDouble size={18} /> },
    { href: '/clients', label: 'Clientes', icon: <Users size={18} /> },
    { href: '/reservations', label: 'Reservas', icon: <CalendarDays size={18} /> },
    { href: '/profile', label: 'Perfil', icon: <UserCircle size={18} /> },
  ],
  cliente: [
    { href: '/my-reservations', label: 'Mis Reservas', icon: <CalendarDays size={18} /> },
    { href: '/profile', label: 'Perfil', icon: <UserCircle size={18} /> },
  ],
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const role = normalizeRole(user?.role)
  const items = sidebarByRole[role]

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-hm-bg">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-hm-border bg-white px-4 py-6">
          <div className="mb-8 rounded-xl bg-hm-primary px-4 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.14em] text-blue-100">HotelManager Pro</p>
            <p className="mt-1 text-lg font-semibold">Inventario y Operación</p>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const active = router.pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-hm-primary text-white'
                      : 'text-hm-text-secondary hover:bg-blue-50 hover:text-hm-primary',
                  ].join(' ')}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 border-t border-hm-border pt-4">
            <p className="text-xs text-hm-text-secondary">Sesión activa</p>
            <p className="mt-1 text-sm font-semibold text-hm-text-main">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-hm-text-secondary">{user?.role || 'Sin rol'}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-hm-border px-3 py-2 text-sm font-medium text-hm-text-secondary hover:bg-slate-100"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <section className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </section>
      </div>
    </div>
  )
}
