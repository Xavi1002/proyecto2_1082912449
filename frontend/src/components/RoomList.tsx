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

const statusConfig: Record<string, { color: string; bg: string; text: string }> = {
  Disponible: { color: 'emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-200' },
  Ocupada: { color: 'red', bg: 'bg-red-500/20', text: 'text-red-200' },
  Mantenimiento: { color: 'yellow', bg: 'bg-yellow-500/20', text: 'text-yellow-200' },
  Limpieza: { color: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-200' },
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
    <section className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Listado de Habitaciones</h2>
          <p className="text-slate-400">{summary}</p>
        </div>

        {/* Filters */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por número"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          <select
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Limpieza">Limpieza</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Cargando habitaciones...</p>
          </div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="border border-dashed border-white/20 rounded-lg p-12 text-center">
          <p className="text-slate-400">No hay habitaciones registradas con esos filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const statusInfo = statusConfig[room.status] || statusConfig.Disponible
            return (
              <article key={room.id} className="bg-white/5 hover:bg-white/10 backdrop-blur border border-white/20 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:border-white/40">
                {/* Room Header */}
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Habitación
                    </p>
                    <h3 className="text-2xl font-bold text-white">
                      {room.roomNumber}
                    </h3>
                  </div>
                  <span className={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap`}>
                    {room.status}
                  </span>
                </div>

                {/* Room Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1 font-medium">Tipo</p>
                    <p className="text-sm font-bold text-white">{room.type}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1 font-medium">Precio/Noche</p>
                    <p className="text-sm font-bold text-primary-400">
                      ${Number(room.pricePerNight).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {canManageRooms ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit?.(room)}
                      className="flex-1 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(room.id)}
                      className="flex-1 py-2 px-3 bg-red-600/80 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
