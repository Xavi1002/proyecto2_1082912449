import { useEffect, useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { Card, EmptyState } from '../../components/ui'
import { ClipboardList } from '../../components/icons'
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
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Administración</p>
        <h1 className="mt-2 font-display text-4xl text-ink-900">Auditoría</h1>
        <p className="mt-2 text-ink-500 max-w-2xl">
          Eventos recientes del sistema y operaciones críticas registradas.
        </p>
      </header>

      {loading ? (
        <div className="text-center text-ink-500 py-12">Cargando auditoría...</div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={20} />}
          title="Sin eventos registrados"
          description="La auditoría aparecerá cuando ocurran acciones críticas."
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const hasMetadata = event.metadata && Object.keys(event.metadata).length > 0
            return (
              <Card
                key={`${event.recordedAt}-${event.action}-${event.entity}-${event.entityId}`}
                padding="sm"
              >
                <div className="flex gap-4">
                  <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-sand-100 text-ink-400">
                    <ClipboardList size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-900">
                      {event.action} <span className="text-ink-500">·</span> {event.entity}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {new Date(event.recordedAt).toLocaleString('es-CO')} · Entidad #{event.entityId} · Usuario #{event.actorUserId}
                    </p>
                    {hasMetadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-copper-500 cursor-pointer">Ver detalles</summary>
                        <pre className="mt-2 text-xs text-ink-700 bg-sand-50 rounded-md p-3 overflow-auto">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </ProtectedRoute>
  )
}
