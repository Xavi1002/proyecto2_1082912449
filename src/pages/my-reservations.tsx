import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { api } from '../lib/api'
import { Calendar } from '../components/icons'
import { Badge, Card, EmptyState } from '../components/ui'

type Reservation = {
  id: number
  room?: { roomNumber: string; type: string }
  checkInDate: string
  checkOutDate: string
  totalAmount: number | string
  status: string
}

export default function MyReservations() {
  const [items, setItems] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reservations/my').then((r) => setItems(r.data?.reservations || [])).finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute>
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Mi estancia</p>
        <h1 className="mt-2 font-display text-4xl text-ink-900">Mis reservas</h1>
        <p className="mt-2 text-ink-500">Tus reservas pasadas, activas y futuras.</p>
      </header>

      {loading ? null : items.length === 0 ? (
        <EmptyState icon={<Calendar size={20} />} title="Aún no tienes reservas" description="Cuando la recepción registre tu reserva, aparecerá aquí." />
      ) : (
        <div className="grid gap-4">
          {items.map((r) => (
            <Card key={r.id} padding="md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Habitación</p>
                  <p className="font-display text-2xl text-ink-900 mt-1">{r.room?.roomNumber || '—'}</p>
                  <p className="text-sm text-ink-500 mt-0.5">{r.room?.type}</p>
                </div>
                <Badge tone={r.status === 'activa' ? 'success' : 'neutral'}>{r.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-sand-200">
                <div>
                  <p className="text-xs text-ink-500">Check-in</p>
                  <p className="text-sm text-ink-900">{r.checkInDate?.slice(0, 10)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Check-out</p>
                  <p className="text-sm text-ink-900">{r.checkOutDate?.slice(0, 10)}</p>
                </div>
              </div>
              <div className="mt-4 text-right">
                <p className="text-xs text-ink-500">Total</p>
                <p className="font-display text-xl text-ink-900">
                  {Number(r.totalAmount).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ProtectedRoute>
  )
}
