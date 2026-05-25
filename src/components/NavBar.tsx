import Link from 'next/link'
import { useAuth } from '../lib/useAuth'

export default function NavBar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  // Determinar qué links mostrar según el rol
  const getNavLinks = () => {
    if (!user) return []

    const baseLinks = [
      { href: '/dashboard', label: 'Dashboard' },
    ]

    const roleLinks = {
      SuperAdmin: [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/users', label: 'Gestionar Usuarios' },
        { href: '/rooms', label: 'Gestionar Habitaciones' },
        { href: '/reservations', label: 'Todas las Reservas' },
        { href: '/profile', label: 'Perfil' },
      ],
      Recepción: [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/rooms', label: 'Habitaciones' },
        { href: '/reservations', label: 'Reservas' },
        { href: '/search', label: 'Buscador Clientes' },
        { href: '/profile', label: 'Perfil' },
      ],
      Cliente: [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/search', label: 'Buscar Habitaciones' },
        { href: '/reservations', label: 'Mis Reservas' },
        { href: '/profile', label: 'Perfil' },
      ],
    }

    return roleLinks[user.role as keyof typeof roleLinks] || baseLinks
  }

  return (
    <nav className="bg-slate-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold">P2</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">
              Sistema de Reservas
            </span>
          </Link>

          {/* Navigation */}
          {!isLoading && isAuthenticated && user ? (
            <div className="flex items-center space-x-1">
              {/* Nav Links - Dinámicos según rol */}
              <div className="hidden md:flex space-x-1">
                {getNavLinks().map((link) => (
                  <NavLink key={link.href} href={link.href} label={link.label} />
                ))}
              </div>

              {/* User Info con Badge de Rol */}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-slate-700">
                <div className="hidden sm:block text-right">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-400 text-xs">{user.email}</span>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="flex space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Registrarse
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium"
    >
      {label}
    </Link>
  )
}

function RoleBadge({ role }: { role: string }) {
  const badgeColors = {
    SuperAdmin: 'bg-red-900 text-red-200',
    Recepción: 'bg-blue-900 text-blue-200',
    Cliente: 'bg-green-900 text-green-200',
  }

  const colors = badgeColors[role as keyof typeof badgeColors] || 'bg-slate-700 text-slate-200'

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${colors}`}>
      {role}
    </span>
  )
}
