import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface OccupancyData {
  total: number
  available: number
  occupied: number
  maintenance: number
  cleaning: number
}

export default function OccupancyChart() {
  const [data, setData] = useState<OccupancyData>({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    cleaning: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/rooms/statistics')
      const stats = response.data

      setData({
        total: stats.total,
        available: stats.statusCounts?.Disponible || 0,
        occupied: stats.statusCounts?.Ocupada || 0,
        maintenance: stats.statusCounts?.Mantenimiento || 0,
        cleaning: stats.statusCounts?.Limpieza || 0,
      })
      setError('')
    } catch (err) {
      console.error('Error al cargar datos de ocupación:', err)
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={styles.loading}>Cargando gráfico...</div>
  }

  const occupancyPercent = data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0
  const availablePercent = data.total > 0 ? Math.round((data.available / data.total) * 100) : 0
  const cleaningPercent = data.total > 0 ? Math.round((data.cleaning / data.total) * 100) : 0
  const maintenancePercent = data.total > 0 ? Math.round((data.maintenance / data.total) * 100) : 0

  const chartData = [
    { label: 'Ocupadas', value: data.occupied, percent: occupancyPercent, color: '#3b82f6', icon: '🔴' },
    { label: 'Disponibles', value: data.available, percent: availablePercent, color: '#10b981', icon: '🟢' },
    { label: 'En limpieza', value: data.cleaning, percent: cleaningPercent, color: '#06b6d4', icon: '🔵' },
    { label: 'Mantenimiento', value: data.maintenance, percent: maintenancePercent, color: '#f97316', icon: '🟠' },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📊 Estado de Habitaciones</h2>
          <p style={styles.subtitle}>Monitoreo de disponibilidad en tiempo real</p>
        </div>
        <div style={styles.refreshInfo}>
          <span style={styles.refreshDot}></span>
          <span style={styles.refreshText}>En vivo</span>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Gráfico de ocupación principal */}
      <div style={styles.mainChart}>
        <div style={styles.occupancySection}>
          <div style={styles.occupancyLabel}>Ocupación General</div>
          <div style={styles.occupancyCircle}>
            <svg viewBox="0 0 100 100" style={styles.svg}>
              <circle cx="50" cy="50" r="45" style={styles.circleBackground} />
              <circle
                cx="50"
                cy="50"
                r="45"
                style={{
                  ...styles.circleFill,
                  strokeDasharray: `${(occupancyPercent / 100) * 283} 283`,
                }}
              />
            </svg>
            <div style={styles.occupancyText}>
              <div style={styles.occupancyValue}>{occupancyPercent}%</div>
              <div style={styles.occupancyDesc}>{data.occupied} / {data.total}</div>
            </div>
          </div>
          <div style={styles.occupancyInfo}>
            <p style={styles.occupancyStatus}>
              {occupancyPercent >= 80 ? '🔥 Ocupación alta' : occupancyPercent >= 50 ? '⚡ Ocupación normal' : '✨ Mucha disponibilidad'}
            </p>
          </div>
        </div>

        {/* Barras horizontales para cada estado */}
        <div style={styles.barCharts}>
          {chartData.map((item) => (
            <div key={item.label} style={styles.barItem}>
              <div style={styles.barHeader}>
                <div style={styles.barLabel}>
                  <span style={styles.barIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <div style={styles.barCount}>{item.value}</div>
              </div>
              <div style={styles.barBackground}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
              <div style={styles.barPercent}>{item.percent}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards de resumen */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>{data.total}</div>
          <div style={styles.summaryLabel}>Total de Habitaciones</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryNumber, color: '#3b82f6' }}>{data.occupied}</div>
          <div style={styles.summaryLabel}>Ocupadas Ahora</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryNumber, color: '#10b981' }}>{data.available}</div>
          <div style={styles.summaryLabel}>Disponibles Ahora</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryNumber, color: '#f97316' }}>{data.maintenance + data.cleaning}</div>
          <div style={styles.summaryLabel}>Mantenimiento/Limpieza</div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    marginBottom: '2rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  } as React.CSSProperties,
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1a1a1a',
  } as React.CSSProperties,
  subtitle: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#999',
  } as React.CSSProperties,
  refreshInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f0fdf4',
    padding: '0.6rem 1rem',
    borderRadius: '20px',
    border: '1px solid #dcfce7',
  } as React.CSSProperties,
  refreshDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    animation: 'pulse 2s infinite',
  } as React.CSSProperties,
  refreshText: {
    fontSize: '0.85rem',
    color: '#059669',
    fontWeight: 600,
  } as React.CSSProperties,
  error: {
    backgroundColor: 'rgba(248, 215, 218, 0.9)',
    color: '#721c24',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #f5c6cb',
  } as React.CSSProperties,
  mainChart: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '3rem',
    marginBottom: '2rem',
    alignItems: 'center',
  } as React.CSSProperties,
  occupancySection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  occupancyLabel: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: 600,
    marginBottom: '1.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,
  occupancyCircle: {
    position: 'relative' as const,
    width: '180px',
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  svg: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  } as React.CSSProperties,
  circleBackground: {
    fill: 'none',
    stroke: '#f0f0f0',
    strokeWidth: '4',
  } as React.CSSProperties,
  circleFill: {
    fill: 'none',
    stroke: 'url(#occupancyGradient)',
    strokeWidth: '4',
    strokeLinecap: 'round' as const,
    transition: 'stroke-dasharray 0.5s ease',
  } as React.CSSProperties,
  occupancyText: {
    textAlign: 'center' as const,
    zIndex: 1,
  } as React.CSSProperties,
  occupancyValue: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#1a1a1a',
  } as React.CSSProperties,
  occupancyDesc: {
    fontSize: '0.9rem',
    color: '#999',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  occupancyInfo: {
    width: '100%',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  occupancyStatus: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#333',
  } as React.CSSProperties,
  barCharts: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  } as React.CSSProperties,
  barItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,
  barHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  barLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#333',
  } as React.CSSProperties,
  barIcon: {
    fontSize: '1.2rem',
  } as React.CSSProperties,
  barCount: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1a1a1a',
    minWidth: '30px',
    textAlign: 'right' as const,
  } as React.CSSProperties,
  barBackground: {
    backgroundColor: '#f0f0f0',
    borderRadius: '12px',
    height: '32px',
    overflow: 'hidden',
  } as React.CSSProperties,
  barFill: {
    height: '100%',
    borderRadius: '12px',
    transition: 'width 0.5s ease',
  } as React.CSSProperties,
  barPercent: {
    fontSize: '0.8rem',
    color: '#999',
    fontWeight: 600,
  } as React.CSSProperties,
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,
  summaryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center' as const,
    border: '1px solid #e5e7eb',
  } as React.CSSProperties,
  summaryNumber: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#1a1a1a',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  summaryLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: 600,
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
    fontSize: '0.95rem',
  } as React.CSSProperties,
} as const

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    marginBottom: '2rem',
  },
  title: {
    margin: '0 0 1.5rem 0',
    color: '#132a3a',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  chartContainer: {
    marginBottom: '2rem',
  },
  barWrapper: {
    marginBottom: '1.5rem',
  },
  barLabel: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#333',
  },
  barContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    height: '40px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  bar: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '1rem',
    transition: 'width 0.3s',
  },
  barText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  barInfo: {
    fontSize: '0.85rem',
    color: '#666',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  detailCard: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  colorBox: {
    width: '8px',
    height: '60px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    margin: '0 0 0.25rem 0',
    fontSize: '0.9rem',
    color: '#666',
  },
  detailValue: {
    margin: '0.25rem 0',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  detailPercent: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.85rem',
    color: '#999',
  },
  miniBar: {
    width: '50px',
    height: '24px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  miniBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: '0.9rem',
    color: '#666',
  },
  summaryValue: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#333',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
} as const
