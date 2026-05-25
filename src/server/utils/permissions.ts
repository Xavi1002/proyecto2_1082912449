import { RoleType } from '../models/Role'

/**
 * Utilidades para control de acceso y permisos
 * 
 * RN-03: Solo SuperAdmin puede crear, editar o eliminar habitaciones
 * RN-06: Recepcionista puede cambiar estado de habitaciones, pero no CRUD
 */

export interface PermissionSet {
  canCreateRooms: boolean
  canEditRooms: boolean
  canDeleteRooms: boolean
  canChangeRoomStatus: boolean
  canViewRooms: boolean
  canManageReservations: boolean
  canViewAllReservations: boolean
  canEditAllReservations: boolean
  canDeleteAllReservations: boolean
  canManageUsers: boolean
  canAccessAdminPanel: boolean
  canManageRooms: boolean
}

export const PERMISSIONS: Record<RoleType, PermissionSet> = {
  // SuperAdmin - Acceso total
  [RoleType.SUPERADMIN]: {
    // Habitaciones (RN-03)
    canCreateRooms: true,
    canEditRooms: true,
    canDeleteRooms: true,
    canChangeRoomStatus: true,
    canViewRooms: true,
    
    // Reservas
    canManageReservations: true,
    canViewAllReservations: true,
    canEditAllReservations: true,
    canDeleteAllReservations: true,
    
    // Usuarios
    canManageUsers: true,
    canAccessAdminPanel: true,
    
    // Legacy compat
    canManageRooms: true,
  },

  // Recepción - Gestiona reservas, puede cambiar estado de habitaciones (RN-06)
  [RoleType.RECEPCION]: {
    // Habitaciones (RN-06) - Solo estado, NO CRUD
    canCreateRooms: false,
    canEditRooms: false,
    canDeleteRooms: false,
    canChangeRoomStatus: true,  // Puede cambiar a mantenimiento o disponible
    canViewRooms: true,
    
    // Reservas
    canManageReservations: true,
    canViewAllReservations: true,
    canEditAllReservations: true,
    canDeleteAllReservations: true,
    
    // Usuarios
    canManageUsers: false,
    canAccessAdminPanel: false,
    
    // Legacy compat
    canManageRooms: false,
  },

  // Cliente - Solo ve sus propias reservas
  [RoleType.CLIENTE]: {
    // Habitaciones
    canCreateRooms: false,
    canEditRooms: false,
    canDeleteRooms: false,
    canChangeRoomStatus: false,
    canViewRooms: false,
    
    // Reservas
    canManageReservations: false,
    canViewAllReservations: false,
    canEditAllReservations: false,
    canDeleteAllReservations: false,
    
    // Usuarios
    canManageUsers: false,
    canAccessAdminPanel: false,
    
    // Legacy compat
    canManageRooms: false,
  },
}

export const getPermissions = (role: RoleType): PermissionSet => {
  return PERMISSIONS[role] || PERMISSIONS[RoleType.CLIENTE]
}

export const canViewReservation = (userRole: RoleType, userId: number, reservationUserId: number): boolean => {
  const permissions = getPermissions(userRole)
  
  // SuperAdmin y Recepción ven todas las reservas
  if (permissions.canViewAllReservations) {
    return true
  }
  
  // Cliente solo ve sus propias reservas
  return userId === reservationUserId
}

export const canEditReservation = (userRole: RoleType, userId: number, reservationUserId: number): boolean => {
  const permissions = getPermissions(userRole)
  
  // SuperAdmin y Recepción pueden editar todas
  if (permissions.canEditAllReservations) {
    return true
  }
  
  // Los clientes no pueden editar
  return false
}

export const canDeleteReservation = (userRole: RoleType, userId: number, reservationUserId: number): boolean => {
  const permissions = getPermissions(userRole)
  
  // SuperAdmin y Recepción pueden eliminar todas
  if (permissions.canDeleteAllReservations) {
    return true
  }
  
  // Los clientes no pueden eliminar
  return false
}

export const canManageRooms = (userRole: RoleType): boolean => {
  return getPermissions(userRole).canManageRooms
}

export const canAccessAdminPanel = (userRole: RoleType): boolean => {
  return getPermissions(userRole).canAccessAdminPanel
}
