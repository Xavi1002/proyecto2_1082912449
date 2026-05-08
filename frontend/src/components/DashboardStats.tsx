import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface StatCard {
  label: string
  value: number | string
  subtext: string
  icon: string
  borderColor: string
}

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    activeReservations: 0,
    totalRevenue: 0,
    averagePrice: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [roomsRes, reservationsRes] = await Promise.all([
        api.get('/rooms/statistics'),
        api.get('/reservations/statistics'),
      ])

      const roomStats = roomsRes.data
      const reservationStats = reservationsRes.data

      setStats({
        totalRooms: roomStats.total,
        availableRooms: roomStats.statusCounts?.Disponible || 0,
        occupiedRooms: roomStats.statusCounts?.Ocupada || 0,
        maintenanceRooms: (roomStats.statusCounts?.Mantenimiento || 0) + (roomStats.statusCounts?.Limpieza || 0),
        activeReservations: reservationStats.byStatus?.Confirmada || 0,
        totalRevenue: reservationStats.totalRevenue || 0,
        averagePrice: roomStats.averagePrice || 0,
      })
      setError('')
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
      setError('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0

  const statCards: StatCard[] = [
    {
      label: 'Disponibles',
      value: stats.availableRooms,
      subtext: `de ${stats.totalRooms} habitaciones`,
      icon: '🟢',
      borderColor: 'border-emerald-500',
    },
    {
      label: 'Ocupadas',
      value: stats.occupiedRooms,
      subtext: `${occupancyRate}% de ocupación`,
      icon: '🔵',
      borderColor: 'border-blue-500',
    },
    {
      label: 'Reservas Activas',
      value: stats.activeReservations,
      subtext: 'reservas confirmadas',
      icon: '📅',
      borderColor: 'border-purple-500',
    },
    {
      label: 'En Mantenimiento',
      value: stats.maintenanceRooms,
      subtext: 'no disponibles',
      icon: '🔧',
      borderColor: 'border-orange-500',
    },
    {
      label: 'Ingresos Totales',
      value: `$${parseFloat(stats.totalRevenue.toString()).toFixed(2)}`,
      subtext: 'de todas las reservas',
      icon: '💰',
      borderColor: 'border-yellow-500',
    },
    {
      label: 'Precio Promedio',
      value: `$${parseFloat(stats.averagePrice.toString()).toFixed(2)}`,
      subtext: 'por noche',
      icon: '📊',
      borderColor: 'border-indigo-500',
    },
  ]

  return (
    <div className="mb-8">
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start space-x-3 animate-fade-in">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white/10 backdrop-blur-lg border-t-4 ${card.borderColor} rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">
                {card.label}
              </h3>
              <span className="text-2xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
                {card.icon}
              </span>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white mb-2 leading-none">
              {card.value}
            </p>
            <p className="text-xs md:text-sm text-slate-400 font-medium">
              {card.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
