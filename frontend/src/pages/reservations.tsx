import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import ReservationList from '../components/ReservationList'
import { api } from '../lib/api'

export default function ReservationsPage() {
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {} as Record<string, number>,
    totalRevenue: 0,
  })
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    fetchStatistics()
  }, [refresh])

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/reservations/statistics')
      setStatistics(response.data)
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
    }
  }

  return (
    <ProtectedRoute requiredRoles={['SuperAdmin', 'Recepción']}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1>Gestión de Reservas</h1>
            <p style={styles.subtitle}>Recepción y SuperAdmin administran las reservas del hotel.</p>
          </div>

          <Link href="/reservations/new" style={styles.createButton}>
            Nueva Reserva
          </Link>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total de Reservas</p>
            <p style={styles.statValue}>{statistics.total}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Confirmadas</p>
            <p style={styles.statValue}>{statistics.byStatus['Confirmada'] || 0}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Pendientes</p>
            <p style={styles.statValue}>{statistics.byStatus['Pendiente'] || 0}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Ingresos Totales</p>
            <p style={styles.statValue}>
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
              }).format(statistics.totalRevenue)}
            </p>
          </div>
        </div>

        <div style={styles.listContainer}>
          <h2>Reservas del Hotel</h2>
          <ReservationList key={refresh} myReservationsOnly={false} />
        </div>
      </div>
    </ProtectedRoute>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  subtitle: {
    marginTop: '0.25rem',
    color: '#64748b',
    fontSize: '0.95rem',
  },
  createButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    textDecoration: 'none',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  statLabel: {
    color: '#666',
    fontSize: '0.9rem',
    margin: 0,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0.5rem 0 0 0',
    color: '#333',
  },
  listContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
} as const
