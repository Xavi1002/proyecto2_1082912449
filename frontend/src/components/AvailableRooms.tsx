import { useState, useEffect } from 'react'
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
    fetchRooms()
  }, [filter])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await api.get('/rooms', {
        params: {
          status: filter,
        },
      })
      setRooms(response.data.rooms)
      setError('')
    } catch (err) {
      console.error('Error al cargar habitaciones:', err)
      setError('Error al cargar habitaciones')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Disponible: '#28a745',
      Ocupada: '#dc3545',
      Mantenimiento: '#ffc107',
      Limpieza: '#17a2b8',
    }
    return colors[status] || '#6c757d'
  }

  const getTypeEmoji = (type: string) => {
    const emojis: { [key: string]: string } = {
      Individual: '🛏️',
      Doble: '🛏️🛏️',
      Triple: '🛏️🛏️🛏️',
      Suite: '👑',
    }
    return emojis[type] || '🏨'
  }

  if (loading) {
    return <div style={styles.loading}>Cargando habitaciones...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏨 Habitaciones</h2>
        <div style={styles.filters}>
          {['Disponible', 'Ocupada', 'Limpieza', 'Mantenimiento'].map((status) => (
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
        <div style={styles.empty}>No hay habitaciones en este estado</div>
      ) : (
        <div style={styles.grid}>
          {rooms.map((room) => (
            <div key={room.id} style={styles.roomCard}>
              <div
                style={{
                  ...styles.roomStatus,
                  backgroundColor: getStatusColor(room.status),
                }}
              >
                {room.status}
              </div>
              <div style={styles.roomContent}>
                <div style={styles.roomHeader}>
                  <h3 style={styles.roomNumber}>Hab. {room.roomNumber}</h3>
                  <span style={styles.typeEmoji}>{getTypeEmoji(room.type)}</span>
                </div>
                <p style={styles.roomType}>{room.type}</p>
                <div style={styles.roomInfo}>
                  <span>👥 {room.capacity} personas</span>
                  <span>💰 ${parseFloat(room.pricePerNight.toString()).toFixed(2)}/noche</span>
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
    marginBottom: '2rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#1a1a1a',
  } as React.CSSProperties,
  filters: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  filterBtn: {
    padding: '0.6rem 1.2rem',
    border: '2px solid #e5e7eb',
    borderRadius: '20px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: '#666',
  } as React.CSSProperties,
  filterBtnActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,
  roomCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    overflow: 'hidden',
    cursor: 'pointer',
  } as React.CSSProperties,
  roomStatus: {
    display: 'inline-block',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'white',
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,
  roomContent: {
    padding: 0,
  } as React.CSSProperties,
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  roomNumber: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#1a1a1a',
  } as React.CSSProperties,
  typeEmoji: {
    fontSize: '1.5rem',
  } as React.CSSProperties,
  roomType: {
    margin: '0.25rem 0 0.75rem 0',
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: 500,
  } as React.CSSProperties,
  roomInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#555',
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
    fontSize: '0.95rem',
  } as React.CSSProperties,
} as const
    backgroundColor: '#132a3a',
    color: 'white',
    borderColor: '#132a3a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.5rem',
  },
  roomCard: {
    position: 'relative' as const,
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #eee',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  roomStatus: {
    padding: '0.5rem 1rem',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    textAlign: 'center' as const,
  },
  roomContent: {
    padding: '1.2rem',
  },
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  roomNumber: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#132a3a',
  },
  typeEmoji: {
    fontSize: '1.5rem',
  },
  roomType: {
    margin: '0.25rem 0',
    color: '#666',
    fontSize: '0.95rem',
  },
  roomInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    marginTop: '0.75rem',
    fontSize: '0.85rem',
    color: '#555',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#999',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
} as const
