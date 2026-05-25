import { useEffect, useState, type CSSProperties } from 'react'
import { api } from '../lib/api'

interface Room {
  id: number
  roomNumber: string
  type: string
  capacity: number
  pricePerNight: number
  status: string
}

export default function AvailableRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('Disponible')

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const response = await api.get('/rooms', {
          params: {
            status: filter,
          },
        })
        setRooms(response.data.rooms || [])
        setError('')
      } catch (err) {
        console.error('Error al cargar habitaciones:', err)
        setError('Error al cargar habitaciones')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [filter])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Disponible: '#16A34A',
      Ocupada: '#DC2626',
      Mantenimiento: '#D97706',
      Limpieza: '#D97706',
    }
    return colors[status] || '#64748B'
  }

  if (loading) {
    return <div style={styles.loading}>Cargando habitaciones...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Habitaciones</h2>
        <div style={styles.filters}>
          {['Disponible', 'Ocupada', 'Mantenimiento'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                ...styles.filterBtn,
                ...(filter === status ? styles.filterBtnActive : {}),
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {rooms.length === 0 ? (
        <div style={styles.empty}>No hay habitaciones en este estado.</div>
      ) : (
        <div style={styles.grid}>
          {rooms.map((room) => (
            <div key={room.id} style={styles.roomCard}>
              <div style={{ ...styles.roomStatus, backgroundColor: getStatusColor(room.status) }}>{room.status}</div>
              <div style={styles.roomContent}>
                <div style={styles.roomHeader}>
                  <h3 style={styles.roomNumber}>Hab. {room.roomNumber}</h3>
                  <span style={styles.typeEmoji}>{room.type === 'Suite' ? '??' : '???'}</span>
                </div>
                <p style={styles.roomType}>{room.type}</p>
                <div style={styles.roomInfo}>
                  <span>Capacidad: {room.capacity || 1}</span>
                  <span>Precio: ${Number(room.pricePerNight).toFixed(2)} / noche</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #E2E8F0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#0F172A',
  },
  filters: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    border: '1px solid #E2E8F0',
    borderRadius: '999px',
    backgroundColor: '#FFFFFF',
    padding: '0.35rem 0.85rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    color: '#334155',
  },
  filterBtnActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
    color: '#FFFFFF',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.75rem',
  },
  roomCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  roomStatus: {
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: 700,
    textAlign: 'center',
    padding: '0.4rem 0.7rem',
  },
  roomContent: {
    padding: '0.8rem',
  },
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomNumber: {
    margin: 0,
    fontSize: '1rem',
    color: '#0F172A',
  },
  typeEmoji: {
    fontSize: '1.1rem',
  },
  roomType: {
    margin: '0.3rem 0',
    color: '#64748B',
    fontSize: '0.85rem',
  },
  roomInfo: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.8rem',
    color: '#475569',
    gap: '0.2rem',
  },
  error: {
    marginBottom: '0.8rem',
    padding: '0.7rem',
    border: '1px solid #FECACA',
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    borderRadius: '8px',
  },
  empty: {
    textAlign: 'center',
    color: '#64748B',
    padding: '1rem 0',
  },
  loading: {
    textAlign: 'center',
    color: '#64748B',
    padding: '1rem 0',
  },
}
