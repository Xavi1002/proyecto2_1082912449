import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../lib/useAuth'
import NavBar from '../components/NavBar'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <NavBar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Iniciar Sesión</h1>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="tu@email.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={styles.footer}>
            <p>
              ¿No tienes cuenta?{' '}
              <Link href="/register" style={styles.link}>
                Registrarse
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    backgroundColor: '#f5f5f5',
    padding: '2rem 1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    borderLeft: '4px solid #721c24',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
} as const
