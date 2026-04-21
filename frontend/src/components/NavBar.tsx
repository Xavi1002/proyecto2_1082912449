import Link from 'next/link'
import { useAuth } from '../lib/useAuth'

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth()

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
          {isAuthenticated && user ? (
            <div style={styles.userSection}>
              <span style={styles.userInfo}>
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link href="/login" style={styles.link}>
                Iniciar Sesión
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
    backgroundColor: '#333',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
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
    gap: '1rem',
  },
  userInfo: {
    fontSize: '0.9rem',
  },
  authLinks: {
    display: 'flex',
    gap: '1rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
} as const
