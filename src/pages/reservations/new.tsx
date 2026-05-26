import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/ProtectedRoute'
import ReservationForm from '../../components/ReservationForm'
import { Card } from '../../components/ui'

export default function NewReservationPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRoles={['SuperAdmin', 'Recepción']}>
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Operación</p>
        <h1 className="mt-2 font-display text-4xl text-ink-900">Nueva reserva</h1>
        <p className="mt-2 text-ink-500 max-w-2xl">
          Selecciona un cliente, define las fechas y confirma la habitación disponible.
        </p>
      </header>

      <Card padding="lg">
        <ReservationForm
          allowClientSelection
          onSuccess={() => {
            void router.push('/reservations')
          }}
          onCancel={() => {
            void router.push('/reservations')
          }}
        />
      </Card>
    </ProtectedRoute>
  )
}
