import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/ProtectedRoute'
import ReservationForm from '../../components/ReservationForm'

export default function NewReservationPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRoles={['SuperAdmin', 'Recepción']}>
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-hm-text-secondary">Operación de reservas</p>
        <h1 className="mt-2 text-3xl font-bold text-hm-text-main">Nueva Reserva</h1>
        <p className="mt-2 text-sm text-hm-text-secondary">
          Selecciona un cliente, define las fechas y confirma la habitación disponible.
        </p>
      </header>

      <section className="rounded-xl border border-hm-border bg-white p-6 shadow-sm">
        <ReservationForm
          allowClientSelection
          onSuccess={() => {
            void router.push('/reservations')
          }}
          onCancel={() => {
            void router.push('/reservations')
          }}
        />
      </section>
    </ProtectedRoute>
  )
}
