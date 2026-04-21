import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface Reservation {
  id: number
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  status: string
  room?: {
    roomNumber: string
    type: string
  }
}

interface ReservationListProps {
  myReservationsOnly?: boolean
}

export default function ReservationList({ myReservationsOnly = true }: ReservationListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ status: '' })

  useEffect(() => {
    fetchReservations()
  }, [filter, myReservationsOnly])

  const fetchReservations = async () => {
    try {
      setIsLoading(true)
      const endpoint = myReservationsOnly ? '/reservations/my-reservations' : '/reservations'
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)

      const response = await api.get(`${endpoint}?${params.toString()}`)
      setReservations(response.data.reservations)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar reservas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (reservationId: number) => {
    if (window.confirm('¿Está seguro que desea cancelar esta reserva?')) {
      try {
        await api.delete(`/reservations/${reservationId}`)
        setReservations(reservations.filter((r) => r.id !== reservationId))
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cancelar reserva')
      }
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Pendiente: '#ffc107',
      Confirmada: '#28a745',
      Cancelada: '#dc3545',
      Completada: '#6c757d',
    }
    return colors[status] || '#6c757d'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calculateDays = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return <div style={styles.loading}>Cargando reservas...</div>
  }

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}

      {!myReservationsOnly && (
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label>Estado:</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ status: e.target.value })}
              style={styles.select}
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Completada">Completada</option>
            </select>
          </div>
        </div>
      )}

      {reservations.length === 0 ? (
        <div style={styles.noReservations}>No hay reservas registradas</div>
      ) : (
        <div style={styles.grid}>
          {reservations.map((reservation) => (
            <div key={reservation.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>Habitación {reservation.room?.roomNumber}</h3>
                <div
                  style={{
                    ...styles.status,
                    backgroundColor: getStatusColor(reservation.status),
                  }}
                >
                  {reservation.status}
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.dateSection}>
                  <div>
                    <p style={styles.label}>Entrada</p>
                    <p style={styles.value}>{formatDate(reservation.checkInDate)}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Salida</p>
                    <p style={styles.value}>{formatDate(reservation.checkOutDate)}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Noches</p>
                    <p style={styles.value}>
                      {calculateDays(reservation.checkInDate, reservation.checkOutDate)}
                    </p>
                  </div>
                </div>

                <div style={styles.infoSection}>
                  <p>
                    <strong>Tipo:</strong> {reservation.room?.type}
                  </p>
                  <p>
                    <strong>Huéspedes:</strong> {reservation.numberOfGuests}
                  </p>
                  <p>
                    <strong>Precio Total:</strong> ${parseFloat(reservation.totalPrice.toString()).toFixed(2)}
                  </p>
                </div>
              </div>

              <div style={styles.cardFooter}>
                {reservation.status !== 'Cancelada' && reservation.status !== 'Completada' && (
                  <button
                    onClick={() => handleCancel(reservation.id)}
                    style={styles.cancelButton}
                  >
                    Cancelar Reserva
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    borderLeft: '4px solid #721c24',
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  select: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardHeader: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  cardBody: {
    padding: '1rem',
    flex: 1,
  },
  dateSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee',
  },
  label: {
    fontSize: '0.85rem',
    color: '#666',
    margin: '0 0 0.25rem 0',
  },
  value: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: 0,
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  cardFooter: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem',
    borderTop: '1px solid #eee',
  },
  cancelButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  noReservations: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#999',
  },
} as const
