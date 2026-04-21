import React, { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../lib/useAuth'
import NavBar from '../components/NavBar'

export default function Home() {
  const { isAuthenticated, user, getCurrentUser } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser()
    }
  }, [isAuthenticated, getCurrentUser])

  return (
    <>
      <NavBar />
      <main style={styles.main}>
        {isAuthenticated && user ? (
          <div style={styles.dashboard}>
            <h1>Bienvenido, {user.name}!</h1>
            <div style={styles.userCard}>
              <h2>Información de tu cuenta</h2>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Rol:</strong> {user.role}
              </p>
            </div>
          </div>
        ) : (
          <div style={styles.welcome}>
            <h1>Bienvenido al Proyecto 2</h1>
            <p>Sistema de Autenticación con JWT y Roles</p>
            <div style={styles.buttons}>
              <Link href="/login" style={styles.primaryButton}>
                Iniciar Sesión
              </Link>
              <Link href="/register" style={styles.secondaryButton}>
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

const styles = {
  main: {
    minHeight: 'calc(100vh - 60px)',
    backgroundColor: '#f5f5f5',
    padding: '2rem',
  },
  welcome: {
    textAlign: 'center' as const,
    paddingTop: '4rem',
  },
  dashboard: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    marginTop: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
    flexWrap: 'wrap' as const,
  },
  primaryButton: {
    display: 'inline-block',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  secondaryButton: {
    display: 'inline-block',
    backgroundColor: '#28a745',
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
} as const
