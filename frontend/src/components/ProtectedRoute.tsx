import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Acceso Denegado</h1>
        <p>No tiene permisos para acceder a esta página</p>
      </div>
    )
  }

  return <>{children}</>
}
