import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../lib/useAuth'
import NavBar from '../components/NavBar'

const receptionRole = 'Recepci' + String.fromCharCode(243) + 'n'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('Cliente')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!name || !email || !password) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      await register(name, email, password, role)
      router.replace('/')
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al registrarse')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <NavBar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Crear cuenta</h1>

          {error ? <div style={styles.error}>{error}</div> : null}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                style={styles.input}
                placeholder="Juan Perez"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                style={styles.input}
                placeholder="tu@email.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="role" style={styles.label}>
                Tipo de cuenta
              </label>
              <select id="role" value={role} onChange={(event) => setRole(event.target.value)} style={styles.input}>
                <option value="Cliente">Cliente</option>
                <option value={receptionRole}>{receptionRole}</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Contrasena
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                style={styles.input}
                placeholder="********"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirmar contrasena
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                style={styles.input}
                placeholder="********"
              />
            </div>

            <button type="submit" disabled={isSubmitting} style={styles.button}>
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div style={styles.footer}>
            <p>
              Ya tienes cuenta?{' '}
              <Link href="/login" style={styles.link}>
                Inicia sesion
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
    borderRadius: '16px',
    boxShadow: '0 18px 45px rgba(18, 38, 63, 0.08)',
    padding: '2rem',
    width: '100%',
    maxWidth: '440px',
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
    padding: '0.85rem 1rem',
    border: '1px solid #d6dde4',
    borderRadius: '12px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  button: {
    padding: '0.9rem',
    backgroundColor: '#d08c38',
    color: '#1c1408',
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  link: {
    color: '#0b5ed7',
    textDecoration: 'none',
  },
} as const
