import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Badge, Button, EmptyState, Select, Table } from './ui'
import type { Column } from './ui'
import { Calendar, Trash } from './icons'

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

const statusTone = (status: string): 'success' | 'warning' | 'neutral' | 'danger' => {
  switch (status) {
    case 'Confirmada':
      return 'success'
    case 'Pendiente':
      return 'warning'
    case 'Cancelada':
      return 'neutral'
    case 'Completada':
      return 'neutral'
    default:
      return 'neutral'
  }
}

const formatCop = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

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

  const columns: Column<Reservation>[] = [
    {
      key: 'room',
      header: 'Habitación',
      render: (r) => (
        <span className="font-medium text-ink-900">
          {r.room ? `#${r.room.roomNumber}` : '—'}
          {r.room?.type && <span className="text-ink-500"> · {r.room.type}</span>}
        </span>
      ),
    },
    ...(myReservationsOnly
      ? []
      : [
          {
            key: 'client',
            header: 'Cliente',
            render: (r: Reservation) => (
              <span className="text-ink-700">{r.client?.name || '—'}</span>
            ),
          } as Column<Reservation>,
        ]),
    {
      key: 'checkInDate',
      header: 'Check-in',
      render: (r) => <span className="text-ink-700">{formatDate(r.checkInDate)}</span>,
    },
    {
      key: 'checkOutDate',
      header: 'Check-out',
      render: (r) => <span className="text-ink-700">{formatDate(r.checkOutDate)}</span>,
    },
    {
      key: 'nights',
      header: 'Noches',
      render: (r) => (
        <span className="text-ink-700">
          {calculateDays(r.checkInDate, r.checkOutDate)}
        </span>
      ),
    },
    {
      key: 'numberOfGuests',
      header: 'Huéspedes',
      render: (r) => <span className="text-ink-700">{r.numberOfGuests}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'totalPrice',
      header: 'Total',
      render: (r) => (
        <span className="font-medium text-ink-900">{formatCop(Number(r.totalPrice))}</span>
      ),
    },
    ...(myReservationsOnly
      ? []
      : [
          {
            key: 'actions',
            header: '',
            render: (r: Reservation) =>
              r.status !== 'Cancelada' && r.status !== 'Completada' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash size={14} />}
                  onClick={() => handleCancel(r.id)}
                >
                  Cancelar
                </Button>
              ) : null,
            className: 'text-right',
          } as Column<Reservation>,
        ]),
  ]

  if (isLoading) {
    return <div className="text-center text-ink-500 py-12">Cargando reservas...</div>
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      {!myReservationsOnly && (
        <div className="max-w-xs">
          <Select
            label="Filtrar por estado"
            value={filter.status}
            onChange={(e) => setFilter({ status: e.target.value })}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'Confirmada', label: 'Confirmada' },
              { value: 'Cancelada', label: 'Cancelada' },
              { value: 'Completada', label: 'Completada' },
            ]}
          />
        </div>
      )}

      {reservations.length === 0 ? (
        <EmptyState
          icon={<Calendar size={20} />}
          title="Sin reservas"
          description={
            myReservationsOnly
              ? 'Aún no tienes reservas. Contacta con recepción para hacer tu reserva.'
              : 'No hay reservas con los filtros aplicados.'
          }
        />
      ) : (
        <Table columns={columns} data={reservations} />
      )}
    </div>
  )
}
