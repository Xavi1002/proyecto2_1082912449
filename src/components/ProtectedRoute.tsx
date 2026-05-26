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
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <p className="text-sm text-ink-500">Cargando…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <p className="text-sm text-ink-500">Redirigiendo…</p>
      </div>
    )
  }

  // Redirect silencioso cuando no cumple rol
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <p className="text-sm text-ink-500">Redirigiendo…</p>
      </div>
    )
  }

  return <>{children}</>
}
