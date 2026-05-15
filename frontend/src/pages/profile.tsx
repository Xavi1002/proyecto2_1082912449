import { useAuth } from '../lib/useAuth'
import ProtectedRoute from '../components/ProtectedRoute'
import { api } from '../lib/api'
import { useState } from 'react'
import { useRouter } from 'next/router'

const receptionRole = 'Recepci' + String.fromCharCode(243) + 'n'

function ProfileContent() {
  const router = useRouter()
  const { user, getCurrentUser } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      setLoading(true)
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      setMessage('Contraseña actualizada. Ya puedes usar el portal normalmente.')
      setCurrentPassword('')
      setNewPassword('')
      await getCurrentUser()
      if (user?.role === 'Cliente') {
        setTimeout(() => {
          router.replace('/my-reservations')
        }, 700)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'No fue posible cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>Mi perfil</h1>
          {user ? (
            <div style={styles.profileInfo}>
              <div style={styles.infoGroup}>
                <label>Nombre:</label>
                <p>{user.name}</p>
              </div>
              <div style={styles.infoGroup}>
                <label>Email:</label>
                <p>{user.email}</p>
              </div>
              <div style={styles.infoGroup}>
                <label>Rol:</label>
                <p>{user.role}</p>
              </div>
              <div style={styles.roleDescription}>
                {user.mustChangePassword && (
                  <p>
                    Debes cambiar tu contraseña temporal para continuar con acceso completo.
                  </p>
                )}
                {user.role === 'SuperAdmin' && (
                  <p>Tienes acceso total al sistema como administrador.</p>
                )}
                {user.role === receptionRole && (
                  <p>Tienes acceso como personal de recepcion.</p>
                )}
                {user.role === 'Cliente' && (
                  <p>Tienes acceso como cliente de la plataforma.</p>
                )}
              </div>

              <form onSubmit={handleChangePassword} style={styles.passwordForm}>
                <h3 style={styles.passwordTitle}>Cambiar contraseña</h3>
                {message && <div style={styles.successBox}>{message}</div>}
                {error && <div style={styles.errorBox}>{error}</div>}
                <input
                  type="password"
                  placeholder="Contraseña actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                <button type="submit" style={styles.button} disabled={loading}>
                  {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </form>
            </div>
          ) : (
            <p>Cargando informacion del usuario...</p>
          )}
        </div>
      </div>
    </>
  )
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 18px 45px rgba(18, 38, 63, 0.08)',
  },
  profileInfo: {
    marginTop: '2rem',
  },
  infoGroup: {
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee',
  },
  roleDescription: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#e7f3ff',
    borderRadius: '12px',
    color: '#0066cc',
  },
  passwordForm: {
    marginTop: '1.5rem',
    display: 'grid',
    gap: '0.6rem',
  },
  passwordTitle: {
    margin: 0,
    color: '#0f172a',
  },
  successBox: {
    padding: '0.7rem',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    backgroundColor: '#f0fdf4',
    color: '#166534',
  },
  errorBox: {
    padding: '0.7rem',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
  },
  input: {
    padding: '0.65rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
  },
  button: {
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#1d4ed8',
    color: '#fff',
    fontWeight: 700,
    padding: '0.65rem 0.8rem',
    cursor: 'pointer',
  },
} as const
