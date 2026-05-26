import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { Card } from './ui'

type RoomStats = {
  total: number
  byStatus?: Record<string, number>
}

export default function OccupancyChart() {
  const [stats, setStats] = useState<RoomStats>({ total: 0, byStatus: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await api.get('/rooms/statistics')
        setStats(response.data)
      } catch (_error) {
        setStats({ total: 0, byStatus: {} })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const rows = useMemo(() => {
    const available = Number(stats.byStatus?.Disponible || 0)
    const occupied = Number(stats.byStatus?.Ocupada || 0)
    const maintenance =
      Number(stats.byStatus?.Mantenimiento || 0) + Number(stats.byStatus?.Limpieza || 0)
    const total = Number(stats.total || 0)

    return [
      { label: 'Disponibles', value: available, color: 'var(--success-500)' },
      { label: 'Ocupadas', value: occupied, color: 'var(--danger-500)' },
      { label: 'Mantenimiento/Limpieza', value: maintenance, color: 'var(--warning-500)' },
      { label: 'Total', value: total, color: 'var(--ink-900)' },
    ]
  }, [stats])

  if (loading) {
    return (
      <Card padding="md">
        <p className="text-sm text-ink-500 text-center py-4">Cargando ocupación...</p>
      </Card>
    )
  }

  return (
    <Card padding="md">
      <h2 className="font-display text-xl text-ink-900 mb-4">Estado de ocupación</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rows.map((row) => (
          <article
            key={row.label}
            className="border border-sand-200 rounded-xl p-4 bg-white"
          >
            <p className="text-xs uppercase tracking-wide text-ink-500">{row.label}</p>
            <p
              className="mt-2 font-display text-3xl"
              style={{ color: row.color }}
            >
              {row.value}
            </p>
          </article>
        ))}
      </div>
    </Card>
  )
}
