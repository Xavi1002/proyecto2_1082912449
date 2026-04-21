import Link from 'next/link'
import { useAuth } from '../lib/useAuth'

export default function NavBar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link href="/" style={styles.logo}>
          Proyecto 2
        </Link>
        <div style={styles.rightSection}>
          {isLoading ? null : isAuthenticated && user ? (
            <div style={styles.userSection}>
              <div style={styles.navLinks}>
                <Link href="/rooms" style={styles.link}>
                  Habitaciones
                </Link>
                <Link href="/profile" style={styles.link}>
                  Perfil
                </Link>
              </div>
              <span style={styles.userInfo}>
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Cerrar sesion
              </button>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link href="/login" style={styles.link}>
                Iniciar sesion
              </Link>
              <Link href="/register" style={styles.link}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#132a3a',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  logo: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'flex-end' as const,
  },
  userInfo: {
    fontSize: '0.9rem',
  },
  navLinks: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  authLinks: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 0.9rem',
    borderRadius: '999px',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoutBtn: {
    backgroundColor: '#d35f3f',
    color: 'white',
    border: 'none',
    padding: '0.5rem 0.9rem',
    borderRadius: '999px',
    cursor: 'pointer',
  },
} as const
