import { ReactNode } from 'react'
import { useAuth } from '../lib/useAuth'

interface RoleBasedAccessProps {
  children: ReactNode
  allowedRoles?: string[]
  fallback?: ReactNode
}

/**
 * Componente para mostrar contenido basado en el rol del usuario
 * 
 * @example
 * // Solo para SuperAdmin
 * <RoleBasedAccess allowedRoles={['SuperAdmin']}>
 *   <SpecialContent />
 * </RoleBasedAccess>
 * 
 * // Para SuperAdmin o Recepción
 * <RoleBasedAccess allowedRoles={['SuperAdmin', 'Recepción']}>
 *   <AdminContent />
 * </RoleBasedAccess>
 * 
 * // Con fallback
 * <RoleBasedAccess 
 *   allowedRoles={['SuperAdmin']} 
 *   fallback={<p>No tienes permiso</p>}
 * >
 *   <SecretContent />
 * </RoleBasedAccess>
 */
export default function RoleBasedAccess({
  children,
  allowedRoles = ['SuperAdmin'],
  fallback = null,
}: RoleBasedAccessProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  if (allowedRoles.includes(user.role)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 */
export const useHasRole = (roles: string | string[]): boolean => {
  const { user } = useAuth()
  
  if (!user) return false
  
  const rolesArray = Array.isArray(roles) ? roles : [roles]
  return rolesArray.includes(user.role)
}

/**
 * Hook para obtener los permisos basados en el rol
 */
export const useRolePermissions = () => {
  const { user } = useAuth()
  
  if (!user) {
    return {
      canManageUsers: false,
      canManageRooms: false,
      canManageReservations: false,
      canViewAllReservations: false,
      isSuperAdmin: false,
      isReception: false,
      isClient: false,
    }
  }

  const permissions = {
    SuperAdmin: {
      canManageUsers: true,
      canManageRooms: true,
      canManageReservations: true,
      canViewAllReservations: true,
      isSuperAdmin: true,
      isReception: false,
      isClient: false,
    },
    Recepción: {
      canManageUsers: false,
      canManageRooms: true,
      canManageReservations: true,
      canViewAllReservations: true,
      isSuperAdmin: false,
      isReception: true,
      isClient: false,
    },
    Cliente: {
      canManageUsers: false,
      canManageRooms: false,
      canManageReservations: false,
      canViewAllReservations: false,
      isSuperAdmin: false,
      isReception: false,
      isClient: true,
    },
  }

  return permissions[user.role as keyof typeof permissions] || permissions.Cliente
}
