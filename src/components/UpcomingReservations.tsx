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
  user?: {
    name: string
    email: string
  }
}

export default function UpcomingReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/reservations', {
        params: {
          status: 'Confirmada',
        },
      })
      // Ordenar por fecha de entrada más cercana
      const sorted = response.data.reservations.sort(
        (a: Reservation, b: Reservation) =>
          new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()
      )
      setReservations(sorted.slice(0, 10)) // Top 10 próximas
      setError('')
    } catch (err) {
      console.error('Error al cargar reservas:', err)
      setError('Error al cargar reservas')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateDays = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  const isSoon = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const daysUntil = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntil <= 3 && daysUntil > 0
  }

  if (loading) {
    return <div style={styles.loading}>Cargando reservas...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📅 Próximas Reservas</h2>
        <span style={styles.count}>{reservations.length}</span>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {reservations.length === 0 ? (
        <div style={styles.empty}>No hay reservas confirmadas próximas</div>
      ) : (
        <div style={styles.list}>
          {reservations.map((reservation, index) => (
            <div
              key={reservation.id}
              style={{
                ...styles.item,
                ...(isToday(reservation.checkInDate) ? styles.itemToday : {}),
                ...(isSoon(reservation.checkInDate) ? styles.itemSoon : {}),
              }}
            >
              <div style={styles.itemLeft}>
                <div style={styles.dates}>
                  <span style={styles.checkIn}>
                    {formatDate(reservation.checkInDate)}
                  </span>
                  <span style={styles.arrow}>→</span>
                  <span style={styles.checkOut}>
                    {formatDate(reservation.checkOutDate)}
                  </span>
                  <span style={styles.nights}>
                    ({calculateDays(reservation.checkInDate, reservation.checkOutDate)} noches)
                  </span>
                </div>
                <div style={styles.guestInfo}>
                  <strong>Habitación {reservation.room?.roomNumber}</strong> • {reservation.numberOfGuests} huéspedes
                </div>
                {reservation.user && (
                  <div style={styles.userName}>{reservation.user.name}</div>
                )}
              </div>

              <div style={styles.itemRight}>
                <div style={styles.price}>
                  ${parseFloat(reservation.totalPrice.toString()).toFixed(2)}
                </div>
                <div
                  style={{
                    ...styles.badge,
                    ...(isToday(reservation.checkInDate) ? styles.badgeToday : {}),
                    ...(isSoon(reservation.checkInDate) ? styles.badgeSoon : {}),
                  }}
                >
                  {isToday(reservation.checkInDate)
                    ? 'HOY'
                    : isSoon(reservation.checkInDate)
                      ? 'PRONTO'
                      : 'PRÓXIMA'}
                </div>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#1a1a1a',
  } as React.CSSProperties,
  count: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontWeight: 700,
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  } as React.CSSProperties,
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  } as React.CSSProperties,
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,
  itemToday: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
    borderLeft: '5px solid #f59e0b',
  } as React.CSSProperties,
  itemSoon: {
    backgroundColor: '#fed7aa',
    borderColor: '#fdba74',
    borderLeft: '5px solid #f97316',
  } as React.CSSProperties,
  itemLeft: {
    flex: 1,
  } as React.CSSProperties,
  dates: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  checkIn: {
    color: '#10b981',
  } as React.CSSProperties,
  checkOut: {
    color: '#ef4444',
  } as React.CSSProperties,
  arrow: {
    color: '#999',
    fontSize: '1.2rem',
  } as React.CSSProperties,
  nights: {
    color: '#666',
    fontSize: '0.85rem',
    fontWeight: 500,
  } as React.CSSProperties,
  guestInfo: {
    fontSize: '0.95rem',
    color: '#555',
    marginBottom: '0.25rem',
    fontWeight: 500,
  } as React.CSSProperties,
  userName: {
    fontSize: '0.85rem',
    color: '#999',
  } as React.CSSProperties,
  itemRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.75rem',
    marginLeft: '1rem',
  } as React.CSSProperties,
  price: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#1a1a1a',
  } as React.CSSProperties,
  badge: {
    padding: '0.35rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: '#e5e7eb',
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,
  badgeToday: {
    backgroundColor: '#f59e0b',
    color: 'white',
  } as React.CSSProperties,
  badgeSoon: {
    backgroundColor: '#ef4444',
    color: 'white',
  } as React.CSSProperties,
  error: {
    backgroundColor: 'rgba(248, 215, 218, 0.9)',
    color: '#721c24',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #f5c6cb',
    fontSize: '0.95rem',
  } as React.CSSProperties,
  empty: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#999',
    fontSize: '1rem',
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
    fontSize: '0.95rem',
  } as React.CSSProperties,
} as const
