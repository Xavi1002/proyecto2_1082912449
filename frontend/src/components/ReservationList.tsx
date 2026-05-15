import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

interface Reservation {
  id: number
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  pricePerNightSnapshot?: number
  status: string
    client?: {
      name: string
    }
  room?: {
    roomNumber: string
    type: string
  }
}

interface ReservationListProps {
  myReservationsOnly?: boolean
}

const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
  Pendiente: { bg: 'bg-yellow-500/20', text: 'text-yellow-200', icon: '⏳' },
  Confirmada: { bg: 'bg-emerald-500/20', text: 'text-emerald-200', icon: '✅' },
  Cancelada: { bg: 'bg-red-500/20', text: 'text-red-200', icon: '❌' },
  Completada: { bg: 'bg-slate-500/20', text: 'text-slate-200', icon: '✓' },
}

export default function ReservationList({ myReservationsOnly = true }: ReservationListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ status: '' })

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true)
      const endpoint = myReservationsOnly ? '/reservations/my' : '/reservations'
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
  }, [filter.status, myReservationsOnly])

  useEffect(() => {
    void fetchReservations()
  }, [fetchReservations])

  const handleCancel = async (reservationId: number) => {
    if (myReservationsOnly) {
      return
    }

    if (window.confirm('¿Está seguro que desea cancelar esta reserva?')) {
      try {
        await api.delete(`/reservations/${reservationId}`)
        setReservations(reservations.filter((r) => r.id !== reservationId))
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cancelar reserva')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateDays = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Filters */}
      {!myReservationsOnly && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Filtrar por estado:
          </label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ status: e.target.value })}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Completada">Completada</option>
          </select>
        </div>
      )}

      {/* Content */}
      {reservations.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
          <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400">
            {myReservationsOnly
              ? 'Aún no tienes reservas. Contacta con recepción para hacer tu reserva.'
              : 'No hay reservas con los filtros aplicados.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((reservation) => {
            const statusInfo = statusConfig[reservation.status] || statusConfig.Pendiente
            const nights = calculateDays(reservation.checkInDate, reservation.checkOutDate)
            return (
              <div
                key={reservation.id}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-all duration-300 hover:shadow-lg flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600/20 to-primary-500/10 p-4 border-b border-white/10 flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Habitación</p>
                    <h3 className="text-2xl font-bold text-white">#{reservation.room?.roomNumber}</h3>
                  </div>
                  <div className={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap`}>
                    {statusInfo.icon} {reservation.status}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-grow space-y-4">
                  {/* Dates */}
                  <div className="grid grid-cols-3 gap-3 pb-4 border-b border-white/10">
                    <div>
                      <p className="text-xs text-slate-400 mb-1 font-medium">Entrada</p>
                      <p className="text-sm font-bold text-white">{formatDate(reservation.checkInDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1 font-medium">Salida</p>
                      <p className="text-sm font-bold text-white">{formatDate(reservation.checkOutDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1 font-medium">Noches</p>
                      <p className="text-sm font-bold text-primary-400">{nights} 🌙</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    {reservation.client?.name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Cliente:</span>
                        <span className="text-white font-medium">{reservation.client.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Tipo:</span>
                      <span className="text-white font-medium">{reservation.room?.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Huéspedes:</span>
                      <span className="text-white font-medium">{reservation.numberOfGuests} 👥</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                      <span className="text-slate-400 font-medium">Total:</span>
                      <span className="text-primary-400 font-bold">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        }).format(Number(reservation.totalPrice))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                {!myReservationsOnly && reservation.status !== 'Cancelada' && reservation.status !== 'Completada' && (
                  <div className="p-4 border-t border-white/10">
                    <button
                      onClick={() => handleCancel(reservation.id)}
                      className="w-full py-2 px-4 bg-red-600/80 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                    >
                      Cancelar Reserva
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
