import ProtectedRoute from '../components/ProtectedRoute'
import ReservationList from '../components/ReservationList'

export default function MyReservationsPage() {
  return (
    <ProtectedRoute requiredRoles={['Cliente']}>
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-hm-text-secondary">Portal del huésped</p>
        <h1 className="mt-2 text-3xl font-bold text-hm-text-main">Mis Reservas</h1>
        <p className="mt-2 text-sm text-hm-text-secondary">
          Aquí ves únicamente las reservas asociadas a tu cuenta.
        </p>
      </header>

      <ReservationList myReservationsOnly />
    </ProtectedRoute>
  )
}
