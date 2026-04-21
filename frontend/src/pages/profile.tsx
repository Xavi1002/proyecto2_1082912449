import { useAuth } from '../lib/useAuth'
import ProtectedRoute from '../components/ProtectedRoute'
import NavBar from '../components/NavBar'

const receptionRole = 'Recepci' + String.fromCharCode(243) + 'n'

function ProfileContent() {
  const { user } = useAuth()

  return (
    <>
      <NavBar />
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
} as const
