import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import RoomForm from '../components/RoomForm'
import RoomCard from '../components/RoomCard'
import { Bed, Plus } from '../components/icons'
import { Button, Tabs, EmptyState, Modal } from '../components/ui'
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

const receptionRole = 'Recepci' + String.fromCharCode(243) + 'n'

function RoomsContent() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | undefined>()
  const [statistics, setStatistics] = useState<RoomStatistics | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const canManageRooms = user?.role === 'SuperAdmin' || user?.role === receptionRole

  const refreshRooms = () => {
    setRefreshKey((current) => current + 1)
  }

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/rooms/statistics')
      setStatistics(response.data)
    } catch (err) {
      console.error('Error fetching room statistics:', err)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [refreshKey])

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (statusFilter && statusFilter !== 'all') {
          params.append('status', statusFilter)
        }
        const response = await api.get(`/rooms?${params.toString()}`)
        setRooms(response.data.rooms || [])
        setError('')
      } catch (err: any) {
        setError(err.response?.data?.error || 'No fue posible cargar las habitaciones')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [statusFilter, refreshKey])

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

  const handleDelete = async (room: Room) => {
    if (!room.id) return
    const shouldDelete = window.confirm('Deseas eliminar esta habitacion?')
    if (!shouldDelete) return

    try {
      await api.delete(`/rooms/${room.id}`)
      setRooms((current) => current.filter((r) => r.id !== room.id))
      handleDeleteSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || 'No fue posible eliminar la habitacion')
    }
  }

  const tabs = [
    { value: 'all', label: 'Todas' },
    { value: 'Disponible', label: 'Disponible' },
    { value: 'Ocupada', label: 'Ocupada' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
  ]

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Inventario</p>
          <h1 className="mt-2 font-display text-4xl text-ink-900">Habitaciones</h1>
          <p className="mt-2 text-ink-500 max-w-2xl">
            Consulta la disponibilidad actual y manten actualizada la oferta del hotel desde un solo modulo.
          </p>
        </div>
        {canManageRooms && (
          <Button variant="primary" icon={<Plus size={16} />} onClick={openCreateForm}>
            Nueva habitación
          </Button>
        )}
      </header>

      {statistics && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">Total</p>
            <p className="font-display text-2xl text-ink-900 mt-1">{statistics.total}</p>
          </div>
          <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">Precio promedio</p>
            <p className="font-display text-2xl text-ink-900 mt-1">
              {Number(statistics.averagePrice).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
            </p>
          </div>
          {Object.entries(statistics.byStatus).slice(0, 2).map(([status, count]) => (
            <div key={status} className="bg-white border border-sand-200 rounded-xl shadow-paper p-4">
              <p className="text-xs uppercase tracking-wide text-ink-500">{status}</p>
              <p className="font-display text-2xl text-ink-900 mt-1">{count}</p>
            </div>
          ))}
        </section>
      )}

      <div className="mb-6">
        <Tabs items={tabs} active={statusFilter} onChange={setStatusFilter} />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-ink-500 py-12">Cargando habitaciones...</div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<Bed size={20} />}
          title="Sin habitaciones"
          description="No hay habitaciones que coincidan con el filtro seleccionado."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={{
                id: room.id as number,
                roomNumber: room.roomNumber,
                type: room.type,
                pricePerNight: room.pricePerNight,
                status: room.status,
              }}
              canManage={canManageRooms}
              onEdit={canManageRooms ? () => handleEdit(room) : undefined}
              onDelete={canManageRooms ? () => handleDelete(room) : undefined}
            />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={handleCancel} title={editingRoom ? 'Editar habitación' : 'Nueva habitación'}>
        <RoomForm room={editingRoom} onSuccess={handleFormSuccess} onCancel={handleCancel} />
      </Modal>
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
