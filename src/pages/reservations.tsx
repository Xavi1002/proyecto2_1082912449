import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../components/ProtectedRoute'
import { api } from '../lib/api'
import { Calendar, Plus } from '../components/icons'
import { Badge, Button, EmptyState, Table, Tabs } from '../components/ui'
import type { Column } from '../components/ui'

interface Reservation {
  id: number
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  status: string
  client?: { name: string }
  user?: { name: string }
  room?: { roomNumber: string; type: string }
}

const formatCop = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

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

export default function ReservationsPage() {
  const router = useRouter()
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {} as Record<string, number>,
    totalRevenue: 0,
  })
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/reservations/statistics')
      setStatistics(response.data)
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
    }
  }

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filter && filter !== 'all') params.append('status', filter)
      const response = await api.get(`/reservations?${params.toString()}`)
      setReservations(response.data.reservations || [])
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar reservas')
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    void fetchReservations()
  }, [fetchReservations])

  const tabs = [
    { value: 'all', label: 'Todas' },
    { value: 'Pendiente', label: 'Pendientes' },
    { value: 'Confirmada', label: 'Confirmadas' },
    { value: 'Cancelada', label: 'Canceladas' },
    { value: 'Completada', label: 'Completadas' },
  ]

  const columns: Column<Reservation>[] = [
    {
      key: 'client',
      header: 'Cliente',
      render: (r) => (
        <span className="font-medium text-ink-900">
          {r.client?.name || r.user?.name || '—'}
        </span>
      ),
    },
    {
      key: 'room',
      header: 'Habitación',
      render: (r) => (
        <span className="text-ink-700">
          {r.room ? `#${r.room.roomNumber} · ${r.room.type}` : '—'}
        </span>
      ),
    },
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
  ]

  return (
    <ProtectedRoute requiredRoles={['SuperAdmin', 'Recepción']}>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Operación</p>
          <h1 className="mt-2 font-display text-4xl text-ink-900">Reservas</h1>
          <p className="mt-2 text-ink-500 max-w-2xl">
            Listado con filtros por estado y acceso rápido a crear nuevas.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => router.push('/reservations/new')}>
          Nueva reserva
        </Button>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-4">
          <p className="text-xs uppercase tracking-wide text-ink-500">Total</p>
          <p className="font-display text-2xl text-ink-900 mt-1">{statistics.total}</p>
        </div>
        <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-4">
          <p className="text-xs uppercase tracking-wide text-ink-500">Confirmadas</p>
          <p className="font-display text-2xl text-ink-900 mt-1">{statistics.byStatus['Confirmada'] || 0}</p>
        </div>
        <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-4">
          <p className="text-xs uppercase tracking-wide text-ink-500">Pendientes</p>
          <p className="font-display text-2xl text-ink-900 mt-1">{statistics.byStatus['Pendiente'] || 0}</p>
        </div>
        <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-4">
          <p className="text-xs uppercase tracking-wide text-ink-500">Ingresos</p>
          <p className="font-display text-2xl text-ink-900 mt-1">{formatCop(statistics.totalRevenue)}</p>
        </div>
      </section>

      <div className="mb-6">
        <Tabs items={tabs} active={filter} onChange={setFilter} />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-ink-500 py-12">Cargando reservas...</div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<Calendar size={20} />}
          title="Sin reservas"
          description="Crea la primera reserva para ver el listado."
          action={
            <Button icon={<Plus size={16} />} onClick={() => router.push('/reservations/new')}>
              Nueva reserva
            </Button>
          }
        />
      ) : (
        <Table columns={columns} data={reservations} />
      )}

    </ProtectedRoute>
  )
}
