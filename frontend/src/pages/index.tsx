import Link from 'next/link'
import NavBar from '../components/NavBar'
import { useAuth } from '../lib/useAuth'

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()

  return (
    <>
      <NavBar />
      <main style={styles.main}>
        {isLoading ? (
          <div style={styles.panel}>
            <h1>Cargando</h1>
            <p>Estamos recuperando tu sesion.</p>
          </div>
        ) : isAuthenticated && user ? (
          <div style={styles.dashboard}>
            <div style={styles.hero}>
              <p style={styles.kicker}>Panel principal</p>
              <h1>Bienvenido, {user.name}</h1>
              <p style={styles.subtitle}>
                Administra las habitaciones del hotel, revisa disponibilidad y manten los precios al dia.
              </p>
            </div>

            <div style={styles.grid}>
              <Link href="/rooms" style={styles.card}>
                <h2>Habitaciones</h2>
                <p>Crear, editar, eliminar y consultar habitaciones.</p>
              </Link>

              <Link href="/reservations" style={styles.card}>
                <h2>Reservas</h2>
                <p>Ver, crear y gestionar reservas de habitaciones.</p>
              </Link>

              <Link href="/profile" style={styles.card}>
                <h2>Mi perfil</h2>
                <p>Consulta la informacion de tu cuenta y tu rol actual.</p>
              </Link>
            </div>

            <div style={styles.accountCard}>
              <h3>Tu cuenta</h3>
              <p>
                <strong>Nombre:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Rol:</strong> {user.role}
              </p>
            </div>
          </div>
        ) : (
          <div style={styles.panel}>
            <p style={styles.kicker}>Sistema hotelero</p>
            <h1>Gestiona usuarios y habitaciones desde un solo lugar</h1>
            <p style={styles.subtitle}>
              Inicia sesion para usar el CRUD de habitaciones y administrar su estado, tipo y precio por noche.
            </p>
            <div style={styles.actions}>
              <Link href="/login" style={styles.primaryButton}>
                Iniciar sesion
              </Link>
              <Link href="/register" style={styles.secondaryButton}>
                Crear cuenta
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
    minHeight: 'calc(100vh - 72px)',
    background: 'linear-gradient(180deg, #f4efe7 0%, #eef3f7 100%)',
    padding: '2rem 1rem 3rem',
  },
  panel: {
    maxWidth: '960px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '3rem',
    boxShadow: '0 20px 60px rgba(18, 38, 63, 0.08)',
  },
  dashboard: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '2rem',
  },
  kicker: {
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#8d5f2c',
    fontSize: '0.8rem',
    fontWeight: 700,
    marginBottom: '0.75rem',
  },
  subtitle: {
    color: '#44505c',
    fontSize: '1.05rem',
    lineHeight: 1.6,
    maxWidth: '700px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  card: {
    textDecoration: 'none',
    color: '#18212b',
    backgroundColor: 'white',
    borderRadius: '18px',
    padding: '1.5rem',
    boxShadow: '0 18px 45px rgba(18, 38, 63, 0.08)',
    border: '1px solid #e6e2db',
  },
  accountCard: {
    backgroundColor: '#132a3a',
    color: 'white',
    borderRadius: '18px',
    padding: '1.5rem',
    boxShadow: '0 18px 45px rgba(18, 38, 63, 0.12)',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    marginTop: '2rem',
  },
  primaryButton: {
    display: 'inline-block',
    textDecoration: 'none',
    backgroundColor: '#132a3a',
    color: 'white',
    padding: '0.9rem 1.4rem',
    borderRadius: '999px',
    fontWeight: 700,
  },
  secondaryButton: {
    display: 'inline-block',
    textDecoration: 'none',
    backgroundColor: '#d08c38',
    color: '#1c1408',
    padding: '0.9rem 1.4rem',
    borderRadius: '999px',
    fontWeight: 700,
  },
} as const
