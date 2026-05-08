import NavBar from '../components/NavBar'
import ProtectedRoute from '../components/ProtectedRoute'
import ClientSearch from '../components/ClientSearch'

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <NavBar />
      <main style={styles.main}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <p style={styles.kicker}>🔍 Búsqueda</p>
              <h1>Buscar Clientes</h1>
              <p style={styles.subtitle}>
                Encuentra clientes por nombre y consulta sus reservas
              </p>
            </div>
          </div>

          {/* Search Component */}
          <section style={styles.section}>
            <ClientSearch />
          </section>
        </div>
      </main>
    </ProtectedRoute>
  )
}

const styles = {
  main: {
    minHeight: 'calc(100vh - 72px)',
    backgroundColor: '#f3f4f6',
    padding: '2rem 1rem',
  } as React.CSSProperties,
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,
  header: {
    marginBottom: '2.5rem',
  } as React.CSSProperties,
  kicker: {
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#666',
    fontSize: '0.85rem',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
  } as React.CSSProperties,
  subtitle: {
    color: '#666',
    fontSize: '1.05rem',
    margin: '0.5rem 0 0 0',
    maxWidth: '600px',
  } as React.CSSProperties,
  section: {
    marginBottom: '2rem',
  } as React.CSSProperties,
}
