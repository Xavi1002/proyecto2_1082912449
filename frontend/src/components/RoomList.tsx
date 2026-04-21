import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

interface Room {
  id: number
  roomNumber: string
  type: string
  status: string
  pricePerNight: number
}

interface RoomListProps {
  refreshKey?: number
  canManageRooms?: boolean
  onEdit?: (room: Room) => void
  onDeleteSuccess?: () => void
}

const statusColors: Record<string, string> = {
  Disponible: '#2e8b57',
  Ocupada: '#c0392b',
  Mantenimiento: '#c78a11',
  Limpieza: '#227c9d',
}

export default function RoomList({
  refreshKey = 0,
  canManageRooms = false,
  onEdit,
  onDeleteSuccess,
}: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
  })

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()

        if (filters.search.trim()) {
          params.append('search', filters.search.trim())
        }
        if (filters.type) {
          params.append('type', filters.type)
        }
        if (filters.status) {
          params.append('status', filters.status)
        }

        const response = await api.get(`/rooms?${params.toString()}`)
        setRooms(response.data.rooms)
        setError('')
      } catch (err: any) {
        setError(err.response?.data?.error || 'No fue posible cargar las habitaciones')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [filters, refreshKey])

  const summary = useMemo(() => `${rooms.length} habitacion${rooms.length === 1 ? '' : 'es'}`, [rooms.length])

  const handleDelete = async (roomId: number) => {
    const shouldDelete = window.confirm('Deseas eliminar esta habitacion?')

    if (!shouldDelete) {
      return
    }

    try {
      await api.delete(`/rooms/${roomId}`)
      setRooms((current) => current.filter((room) => room.id !== roomId))
      onDeleteSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error || 'No fue posible eliminar la habitacion')
    }
  }

  return (
    <section style={styles.section}>
      <div style={styles.toolbar}>
        <div>
          <h2 style={styles.sectionTitle}>Listado de habitaciones</h2>
          <p style={styles.sectionSubtitle}>{summary}</p>
        </div>

        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Buscar por numero"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            style={styles.input}
          />
          <select
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            style={styles.input}
          >
            <option value="">Todos los tipos</option>
            <option value="Individual">Individual</option>
            <option value="Doble">Doble</option>
            <option value="Triple">Triple</option>
            <option value="Suite">Suite</option>
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            style={styles.input}
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Limpieza">Limpieza</option>
          </select>
        </div>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}

      {isLoading ? (
        <div style={styles.stateBox}>Cargando habitaciones...</div>
      ) : rooms.length === 0 ? (
        <div style={styles.stateBox}>No hay habitaciones registradas con esos filtros.</div>
      ) : (
        <div style={styles.grid}>
          {rooms.map((room) => (
            <article key={room.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <p style={styles.cardLabel}>Habitacion</p>
                  <h3 style={styles.cardTitle}>{room.roomNumber}</h3>
                </div>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: statusColors[room.status] || '#5c6770',
                  }}
                >
                  {room.status}
                </span>
              </div>

              <div style={styles.metaGrid}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Tipo</span>
                  <strong>{room.type}</strong>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Precio por noche</span>
                  <strong>${Number(room.pricePerNight).toFixed(2)}</strong>
                </div>
              </div>

              {canManageRooms ? (
                <div style={styles.actions}>
                  <button type="button" onClick={() => onEdit?.(room)} style={styles.editButton}>
                    Editar
                  </button>
                  <button type="button" onClick={() => handleDelete(room.id)} style={styles.deleteButton}>
                    Eliminar
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const styles = {
  section: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '1.5rem',
    boxShadow: '0 18px 45px rgba(18, 38, 63, 0.08)',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap' as const,
    marginBottom: '1.25rem',
  },
  sectionTitle: {
    margin: 0,
    color: '#162534',
  },
  sectionSubtitle: {
    margin: '0.4rem 0 0',
    color: '#617181',
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
    width: '100%',
    maxWidth: '640px',
  },
  input: {
    border: '1px solid #ccd5de',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    fontSize: '0.95rem',
    backgroundColor: '#fbfcfe',
  },
  error: {
    backgroundColor: '#fbe5e6',
    color: '#8b1e2d',
    borderRadius: '12px',
    padding: '0.9rem 1rem',
    marginBottom: '1rem',
  },
  stateBox: {
    border: '1px dashed #cfd7df',
    borderRadius: '18px',
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#607080',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem',
  },
  card: {
    border: '1px solid #e1e7ed',
    borderRadius: '18px',
    padding: '1.25rem',
    backgroundColor: '#fcfdff',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.75rem',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  cardLabel: {
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontSize: '0.75rem',
    color: '#8c5d2e',
    fontWeight: 700,
  },
  cardTitle: {
    margin: '0.35rem 0 0',
    fontSize: '1.6rem',
    color: '#162534',
  },
  badge: {
    color: 'white',
    borderRadius: '999px',
    padding: '0.45rem 0.8rem',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.75rem',
  },
  metaItem: {
    backgroundColor: '#eef3f7',
    borderRadius: '14px',
    padding: '0.9rem',
  },
  metaLabel: {
    display: 'block',
    color: '#607080',
    fontSize: '0.82rem',
    marginBottom: '0.35rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  editButton: {
    flex: 1,
    border: 'none',
    borderRadius: '999px',
    padding: '0.8rem 1rem',
    backgroundColor: '#163349',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  deleteButton: {
    flex: 1,
    border: 'none',
    borderRadius: '999px',
    padding: '0.8rem 1rem',
    backgroundColor: '#c64032',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
} as const
