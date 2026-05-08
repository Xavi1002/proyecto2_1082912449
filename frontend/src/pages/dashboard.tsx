import { useEffect } from 'react'
import Head from 'next/head'
import NavBar from '../components/NavBar'
import ProtectedRoute from '../components/ProtectedRoute'
import DashboardStats from '../components/DashboardStats'
import OccupancyChart from '../components/OccupancyChart'
import AvailableRooms from '../components/AvailableRooms'
import UpcomingReservations from '../components/UpcomingReservations'
import { useAuth } from '../lib/useAuth'

export default function Dashboard() {
  const { user } = useAuth()

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <ProtectedRoute>
      <Head>
        <title>Panel de Control - Sistema de Reservas</title>
      </Head>
      <NavBar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              {/* Title Section */}
              <div className="flex-1">
                <p className="text-primary-400 text-sm font-bold uppercase tracking-wider">
                  📊 Panel de Control
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mt-2">
                  Bienvenido, {user?.name || 'Usuario'}
                </h1>
                <p className="text-slate-300 text-lg mt-2">
                  Monitorea el estado del hotel en tiempo real
                </p>
              </div>

              {/* Date/Time Box */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center min-w-fit">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Hoy
                </div>
                <div className="text-2xl font-bold text-white">
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
                <div className="text-slate-300 text-sm font-mono mt-2">
                  {new Date().toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas principales */}
          <section className="mb-8 animate-fade-in">
            <DashboardStats />
          </section>

          {/* Gráfico de ocupación */}
          <section className="mb-8 animate-fade-in">
            <OccupancyChart />
          </section>

          {/* Dos columnas: Próximas reservas y Habitaciones disponibles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <section className="animate-fade-in">
              <UpcomingReservations />
            </section>

            <section className="animate-fade-in">
              <AvailableRooms />
            </section>
          </div>

          {/* Footer */}
          <footer className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-300 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Última actualización:</span>
                <span className="text-white font-semibold">{new Date().toLocaleTimeString('es-ES')}</span>
              </div>
              <div className="hidden sm:block text-slate-500">•</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Auto-refresh:</span>
                <span className="text-white font-semibold">cada 5 minutos</span>
              </div>
            </div>
          </footer>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </ProtectedRoute>
  )
}
} as const
