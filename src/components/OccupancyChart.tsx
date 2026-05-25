import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { api } from '../lib/api'

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
    const maintenance = Number(stats.byStatus?.Mantenimiento || 0) + Number(stats.byStatus?.Limpieza || 0)
    const total = Number(stats.total || 0)

    return [
      { label: 'Disponibles', value: available, color: '#16A34A' },
      { label: 'Ocupadas', value: occupied, color: '#DC2626' },
      { label: 'Mantenimiento/Limpieza', value: maintenance, color: '#D97706' },
      { label: 'Total', value: total, color: '#1D4ED8' },
    ]
  }, [stats])

  if (loading) {
    return <div style={styles.loading}>Cargando ocupación...</div>
  }

  return (
    <section style={styles.container}>
      <h2 style={styles.title}>Estado de ocupación</h2>
      <div style={styles.grid}>
        {rows.map((row) => (
          <article key={row.label} style={styles.card}>
            <p style={styles.label}>{row.label}</p>
            <p style={{ ...styles.value, color: row.color }}>{row.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

const styles: Record<string, CSSProperties> = {
  container: {
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  title: {
    margin: '0 0 0.75rem 0',
    color: '#0F172A',
    fontSize: '1.1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.75rem',
  },
  card: {
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '0.75rem',
  },
  label: {
    color: '#64748B',
    margin: 0,
    fontSize: '0.8rem',
  },
  value: {
    margin: '0.45rem 0 0 0',
    fontSize: '1.7rem',
    fontWeight: 700,
  },
  loading: {
    color: '#64748B',
    textAlign: 'center',
    padding: '1rem 0',
  },
}
