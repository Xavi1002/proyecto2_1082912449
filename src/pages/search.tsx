import ProtectedRoute from '../components/ProtectedRoute'
import ClientSearch from '../components/ClientSearch'
import OccupancyChart from '../components/OccupancyChart'

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Insights</p>
        <h1 className="mt-2 font-display text-4xl text-ink-900">Búsqueda y ocupación</h1>
        <p className="mt-2 text-ink-500">
          Localiza clientes y consulta la ocupación del hotel.
        </p>
      </header>

      <div className="grid gap-8">
        <section>
          <OccupancyChart />
        </section>
        <section>
          <ClientSearch />
        </section>
      </div>
    </ProtectedRoute>
  )
}
