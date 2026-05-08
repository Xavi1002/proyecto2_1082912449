import { RoleType } from '../models/Role'

/**
 * Utilidades para control de acceso y permisos
 */

export const PERMISSIONS = {
  // SuperAdmin - Acceso total
  SUPERADMIN: {
    canManageRooms: true,
    canManageReservations: true,
    canManageUsers: true,
    canViewAllReservations: true,
    canEditAllReservations: true,
    canDeleteAllReservations: true,
    canAccessAdminPanel: true,
  },

  // Recepción - Gestiona reservas y habitaciones
  RECEPCION: {
    canManageRooms: true,
    canManageReservations: true,
    canManageUsers: false,
    canViewAllReservations: true,
    canEditAllReservations: true,
    canDeleteAllReservations: true,
    canAccessAdminPanel: false,
  },

  // Cliente - Solo ve sus propias reservas
  CLIENTE: {
    canManageRooms: false,
    canManageReservations: false,
    canManageUsers: false,
    canViewAllReservations: false,
    canEditAllReservations: false,
    canDeleteAllReservations: false,
    canAccessAdminPanel: false,
  },
}

export const getPermissions = (role: RoleType) => {
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
