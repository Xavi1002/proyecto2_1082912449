import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Badge, Card, EmptyState } from './ui'
import { ArrowRight, CalendarClock } from './icons'

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

const formatCop = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

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
    return <div className="text-center text-ink-500 py-8 text-sm">Cargando reservas...</div>
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-copper-500"><CalendarClock size={18} /></span>
          <h2 className="font-display text-xl text-ink-900">Próximas reservas</h2>
        </div>
        <Badge tone="neutral">{reservations.length}</Badge>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={20} />}
          title="Sin reservas próximas"
          description="No hay reservas confirmadas próximas."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {reservations.map((reservation) => {
            const today = isToday(reservation.checkInDate)
            const soon = isSoon(reservation.checkInDate)
            const tone: 'warning' | 'danger' | 'neutral' = today ? 'warning' : soon ? 'danger' : 'neutral'
            const label = today ? 'HOY' : soon ? 'PRONTO' : 'PRÓXIMA'
            return (
              <li
                key={reservation.id}
                className={`flex items-center justify-between gap-4 rounded-xl border bg-white p-4 transition ${
                  today
                    ? 'border-warning-500/40 bg-[#FCF6EC]'
                    : soon
                      ? 'border-danger-500/30 bg-[#FBEFEE]'
                      : 'border-sand-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink-900">
                    <span>{formatDate(reservation.checkInDate)}</span>
                    <span className="text-ink-400"><ArrowRight size={14} /></span>
                    <span>{formatDate(reservation.checkOutDate)}</span>
                    <span className="text-xs font-normal text-ink-500">
                      ({calculateDays(reservation.checkInDate, reservation.checkOutDate)} noches)
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-ink-700">
                    <span className="font-medium text-ink-900">Habitación {reservation.room?.roomNumber}</span>
                    <span className="text-ink-500"> · {reservation.numberOfGuests} huéspedes</span>
                  </div>
                  {reservation.user && (
                    <div className="mt-0.5 text-xs text-ink-500">{reservation.user.name}</div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-display text-lg text-ink-900">
                    {formatCop(parseFloat(reservation.totalPrice.toString()))}
                  </p>
                  <Badge tone={tone}>{label}</Badge>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
