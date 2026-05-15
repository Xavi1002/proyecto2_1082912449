import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isLoading || !isAuthenticated || requiredRoles.length === 0) {
      return
    }

    if (!requiredRoles.includes(user?.role || '')) {
      if (user?.role === 'Cliente') {
        router.replace('/my-reservations')
      } else {
        router.replace('/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, requiredRoles, user?.role, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Redirigiendo...</p>
      </div>
    )
  }

  // Redirect silencioso cuando no cumple rol
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-hm-text-secondary">Redirigiendo...</p>
      </div>
    )
  }

  return <>{children}</>
}
