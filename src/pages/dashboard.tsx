import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import SeedModeBanner from '../components/layout/SeedModeBanner'
import KpiCard from '../components/dashboard/KpiCard'
import { Bed, BedDouble, Wrench, CalendarClock } from '../components/icons'
import { Badge, EmptyState, Table } from '../components/ui'
import type { Column } from '../components/ui'

type DashboardData = {
  kpis: { availableRooms: number; occupiedRooms: number; maintenanceRooms: number; activeReservationsToday: number }
  reservationsToday: Array<{ id: number; clientName?: string; roomNumber?: string; checkInDate: string; status: string }>
  mode: 'live' | 'seed'
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/dashboard')
        setData((await res.json()) as DashboardData)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const reservations = data?.reservationsToday || []
  const columns: Column<DashboardData['reservationsToday'][number]>[] = [
    { key: 'clientName', header: 'Cliente', render: (r) => r.clientName || '—' },
    { key: 'roomNumber', header: 'Habitación', render: (r) => r.roomNumber || '—' },
    { key: 'checkInDate', header: 'Check-in', render: (r) => r.checkInDate?.slice(0, 10) || '—' },
    { key: 'status', header: 'Estado', render: (r) => <Badge tone={r.status === 'activa' ? 'success' : 'neutral'}>{r.status}</Badge> },
  ]

  return (
    <ProtectedRoute>
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Operación del día</p>
        <h1 className="mt-2 font-display text-4xl text-ink-900">Dashboard</h1>
        <p className="mt-2 text-ink-500">Estado actual del hotel y reservas con check-in hoy.</p>
      </header>

      {data?.mode === 'seed' && <SeedModeBanner />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Disponibles" value={loading ? '—' : data?.kpis.availableRooms ?? 0} icon={<Bed size={20} />} />
        <KpiCard label="Ocupadas" value={loading ? '—' : data?.kpis.occupiedRooms ?? 0} icon={<BedDouble size={20} />} />
        <KpiCard label="Mantenimiento" value={loading ? '—' : data?.kpis.maintenanceRooms ?? 0} icon={<Wrench size={20} />} />
        <KpiCard label="Check-in hoy" value={loading ? '—' : data?.kpis.activeReservationsToday ?? 0} icon={<CalendarClock size={20} />} />
      </div>

      <section>
        <h2 className="font-display text-xl text-ink-900 mb-4">Reservas de hoy</h2>
        {reservations.length === 0 ? (
          <EmptyState
            icon={<CalendarClock size={20} />}
            title="Sin reservas para hoy"
            description="Cuando se cree una reserva con check-in hoy, aparecerá aquí."
          />
        ) : (
          <Table columns={columns} data={reservations} />
        )}
      </section>
    </ProtectedRoute>
  )
}
