import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import ProtectedRoute from '../components/ProtectedRoute'
import RoomForm from '../components/RoomForm'
import RoomList from '../components/RoomList'
import { api } from '../lib/api'
import { useAuth } from '../lib/useAuth'

interface Room {
  id?: number
  roomNumber: string
  type: string
  status: string
  pricePerNight: number
}

interface RoomStatistics {
  total: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  averagePrice: number
}

function RoomsContent() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | undefined>()
  const [statistics, setStatistics] = useState<RoomStatistics | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const canManageRooms = user?.role === 'SuperAdmin'

  const refreshRooms = () => {
    setRefreshKey((current) => current + 1)
  }

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/rooms/statistics')
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching room statistics:', error)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [refreshKey])

  const openCreateForm = () => {
    setEditingRoom(undefined)
    setShowForm(true)
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingRoom(undefined)
    refreshRooms()
  }

  const handleDeleteSuccess = () => {
    refreshRooms()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingRoom(undefined)
  }

  return (
    <>
      <NavBar />
      <main style={styles.page}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>CRUD de habitaciones</p>
            <h1 style={styles.title}>Administra numero, tipo, estado y precio por noche</h1>
            <p style={styles.subtitle}>
              Consulta la disponibilidad actual y manten actualizada la oferta del hotel desde un solo modulo.
            </p>
          </div>

          {canManageRooms ? (
            <button type="button" onClick={openCreateForm} style={styles.createButton}>
              Nueva habitacion
            </button>
          ) : null}
        </section>

        {statistics ? (
          <section style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Total</span>
              <strong style={styles.statValue}>{statistics.total}</strong>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Precio promedio</span>
              <strong style={styles.statValue}>${Number(statistics.averagePrice).toFixed(2)}</strong>
            </div>
            {Object.entries(statistics.byStatus).map(([status, count]) => (
              <div key={status} style={styles.statCard}>
                <span style={styles.statLabel}>{status}</span>
                <strong style={styles.statValue}>{count}</strong>
              </div>
            ))}
          </section>
        ) : null}

        {showForm ? (
          <div style={styles.modalBackdrop}>
            <div style={styles.modal}>
              <RoomForm room={editingRoom} onSuccess={handleFormSuccess} onCancel={handleCancel} />
            </div>
          </div>
        ) : null}

        <RoomList
          refreshKey={refreshKey}
          canManageRooms={canManageRooms}
          onEdit={canManageRooms ? handleEdit : undefined}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </main>
    </>
  )
}

export default function RoomsPage() {
  return (
    <ProtectedRoute>
      <RoomsContent />
    </ProtectedRoute>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 72px)',
    background: 'linear-gradient(180deg, #f4efe7 0%, #eef3f7 100%)',
    padding: '2rem 1rem 3rem',
  },
  hero: {
    maxWidth: '1200px',
    margin: '0 auto 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap' as const,
  },
  kicker: {
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#8d5f2c',
    fontSize: '0.8rem',
    fontWeight: 700,
    margin: 0,
  },
  title: {
    margin: '0.75rem 0',
    color: '#162534',
    maxWidth: '780px',
  },
  subtitle: {
    margin: 0,
    maxWidth: '760px',
    color: '#556371',
    lineHeight: 1.6,
  },
  createButton: {
    border: 'none',
    borderRadius: '999px',
    padding: '0.95rem 1.4rem',
    backgroundColor: '#163349',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  statsGrid: {
    maxWidth: '1200px',
    margin: '0 auto 1.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '18px',
    padding: '1.25rem',
    boxShadow: '0 18px 45px rgba(18, 38, 63, 0.08)',
  },
  statLabel: {
    display: 'block',
    color: '#617181',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.8rem',
    color: '#162534',
  },
  modalBackdrop: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(12, 24, 35, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000,
  },
  modal: {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '1.5rem',
    boxShadow: '0 25px 60px rgba(18, 38, 63, 0.18)',
  },
} as const
