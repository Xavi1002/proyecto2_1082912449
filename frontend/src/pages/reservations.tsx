import { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import RoleBasedAccess, { useHasRole, useRolePermissions } from '../components/RoleBasedAccess'
import ReservationForm from '../components/ReservationForm'
import ReservationList from '../components/ReservationList'
import { api } from '../lib/api'

export default function ReservationsPage() {
  const [showForm, setShowForm] = useState(false)
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {},
    totalRevenue: 0,
  })
  const [refresh, setRefresh] = useState(0)
  const isStaff = useHasRole(['SuperAdmin', 'Recepción'])
  const permissions = useRolePermissions()

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

  const handleReservationSuccess = () => {
    setShowForm(false)
    setRefresh((prev) => prev + 1)
  }

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        {/* Encabezado diferenciado por rol */}
        <div style={styles.header}>
          <div>
            <h1>{isStaff ? 'Gestión de Reservas' : 'Mis Reservas'}</h1>
            <p style={styles.subtitle}>
              {permissions.isSuperAdmin && 'SuperAdmin - Acceso total a todas las reservas'}
              {permissions.isReception && 'Recepción - Gestión de reservas del hotel'}
              {permissions.isClient && 'Cliente - Visualización de mis reservas'}
            </p>
          </div>
          
          {/* Botón para clientes */}
          <RoleBasedAccess allowedRoles={['Cliente']}>
            <button onClick={() => setShowForm(!showForm)} style={styles.createButton}>
              {showForm ? 'Cancelar' : 'Nueva Reserva'}
            </button>
          </RoleBasedAccess>
        </div>

        {/* Estadísticas */}
        {permissions.canViewAllReservations && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total de Reservas</p>
              <p style={styles.statValue}>{statistics.total}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Confirmadas</p>
              <p style={styles.statValue}>
                {statistics.byStatus['Confirmada'] || 0}
              </p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Pendientes</p>
              <p style={styles.statValue}>
                {statistics.byStatus['Pendiente'] || 0}
              </p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Ingresos Totales</p>
              <p style={styles.statValue}>
                ${parseFloat(statistics.totalRevenue.toString()).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Formulario para clientes */}
        <RoleBasedAccess allowedRoles={['Cliente']}>
          {showForm && (
            <div style={styles.formContainer}>
              <ReservationForm
                onSuccess={handleReservationSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </RoleBasedAccess>

        {/* Lista de Reservas */}
        <div style={styles.listContainer}>
          <h2>
            {isStaff ? 'Todas las Reservas del Hotel' : 'Tus Reservas'}
          </h2>
          <ReservationList 
            key={refresh} 
            myReservationsOnly={permissions.isClient}
          />
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
  createButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
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
  formContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  listContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
} as const
