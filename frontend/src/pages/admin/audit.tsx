import { useEffect, useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { api } from '../../lib/api'

type AuditEvent = {
  action: string
  entity: string
  entityId: number | string
  actorUserId: number
  recordedAt: string
  metadata?: Record<string, unknown>
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setLoading(true)
        const response = await api.get('/audits')
        setEvents(response.data.events || [])
      } catch (_error) {
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchAudit()
  }, [])

  return (
    <ProtectedRoute requiredRoles={['SuperAdmin']}>
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-hm-text-secondary">Administración</p>
        <h1 className="mt-2 text-3xl font-bold text-hm-text-main">Auditoría</h1>
        <p className="mt-2 text-sm text-hm-text-secondary">Eventos recientes del sistema y operaciones críticas registradas.</p>
      </header>
      <section className="rounded-xl border border-hm-border bg-white p-6">
        {loading ? (
          <p className="text-hm-text-secondary">Cargando auditoría...</p>
        ) : events.length === 0 ? (
          <p className="text-hm-text-secondary">Aún no hay eventos de auditoría.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <article key={`${event.recordedAt}-${event.action}-${event.entity}-${event.entityId}`} className="rounded-xl border border-hm-border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-hm-text-main">{event.action} · {event.entity}</p>
                    <p className="text-xs text-hm-text-secondary">Entidad #{event.entityId} · Usuario #{event.actorUserId}</p>
                  </div>
                  <time className="text-xs text-hm-text-secondary">{new Date(event.recordedAt).toLocaleString('es-CO')}</time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </ProtectedRoute>
  )
}
