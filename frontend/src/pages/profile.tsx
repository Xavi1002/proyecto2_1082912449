import { useAuth } from '../lib/useAuth'
import ProtectedRoute from '../components/ProtectedRoute'
import NavBar from '../components/NavBar'

function ProfileContent() {
  const { user } = useAuth()

  return (
    <>
      <NavBar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>Mi Perfil</h1>
          {user && (
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
                  <p>Tienes acceso total al sistema como administrador</p>
                )}
                {user.role === 'Recepción' && (
                  <p>Tienes acceso como personal de recepción</p>
                )}
                {user.role === 'Cliente' && (
                  <p>Tienes acceso como cliente de la plataforma</p>
                )}
              </div>
            </div>
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
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
    borderRadius: '4px',
    color: '#0066cc',
    borderLeft: '4px solid #0066cc',
  },
} as const
