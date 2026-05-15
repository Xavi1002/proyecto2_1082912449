import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { BedDouble, Bed, Wrench, CalendarClock } from 'lucide-react'
import KpiCard from '../components/dashboard/KpiCard'
import SeedModeBanner from '../components/layout/SeedModeBanner'

type DashboardData = {
  kpis: {
    availableRooms: number
    occupiedRooms: number
    maintenanceRooms: number
    activeReservationsToday: number
  }
  reservationsToday: Array<{
    id: number
    clientName?: string
    roomNumber?: string
    checkInDate: string
    status: string
  }>
  mode: 'live' | 'seed'
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      const payload = (await response.json()) as DashboardData
      setData(payload)
      setLoading(false)
    }

    fetchDashboard()
  }, [])

  return (
    <ProtectedRoute>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-hm-text-secondary">Operación del día</p>
        <h1 className="mt-2 text-3xl font-bold text-hm-text-main">Dashboard HotelManager Pro</h1>
        <p className="mt-2 text-hm-text-secondary">
          Visualiza en segundos cuántas habitaciones están disponibles y cuántas reservas ingresan hoy.
        </p>
      </header>

      {data?.mode === 'seed' && <SeedModeBanner />}

      {loading || !data ? (
        <div className="rounded-xl border border-hm-border bg-white p-8 text-center text-hm-text-secondary">Cargando dashboard...</div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Habitaciones Disponibles"
              value={data.kpis.availableRooms}
              tone="available"
              icon={<BedDouble size={20} />}
            />
            <KpiCard title="Habitaciones Ocupadas" value={data.kpis.occupiedRooms} tone="occupied" icon={<Bed size={20} />} />
            <KpiCard
              title="En Mantenimiento"
              value={data.kpis.maintenanceRooms}
              tone="maintenance"
              icon={<Wrench size={20} />}
            />
            <KpiCard
              title="Reservas Activas de Hoy"
              value={data.kpis.activeReservationsToday}
              tone="active"
              icon={<CalendarClock size={20} />}
            />
          </section>

          <section className="mt-6 rounded-xl border border-hm-border bg-white p-6">
            <h2 className="text-xl font-semibold text-hm-text-main">Entradas de hoy</h2>
            {data.reservationsToday.length === 0 ? (
              <p className="mt-3 text-hm-text-secondary">No hay reservas activas para hoy.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-hm-border text-hm-text-secondary">
                      <th className="py-2">Cliente</th>
                      <th className="py-2">Habitación</th>
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reservationsToday.map((item) => (
                      <tr key={item.id} className="border-b border-hm-border/60">
                        <td className="py-3 text-hm-text-main">{item.clientName || 'Sin nombre'}</td>
                        <td className="py-3 text-hm-text-main">{item.roomNumber || 'Sin asignar'}</td>
                        <td className="py-3 text-hm-text-secondary">{String(item.checkInDate).slice(0, 10)}</td>
                        <td className="py-3 text-hm-text-secondary">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </ProtectedRoute>
  )
}
