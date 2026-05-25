import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt'
import { getPermissions } from '../utils/permissions'
import { RoleType } from '../models/Role'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token no proporcionado' })
    return
  }

  const payload = verifyToken(token)
  if (!payload) {
    res.status(403).json({ error: 'Token inválido o expirado' })
    return
  }

  req.user = payload
  next()
}

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `No tiene permiso. Roles requeridos: ${allowedRoles.join(', ')}`,
      })
      return
    }

    next()
  }
}

/**
 * Middleware para crear/editar/eliminar habitaciones - Solo SuperAdmin (RN-03)
 */
export const requireSuperAdminRoomManagement = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }

  if (req.user.role !== RoleType.SUPERADMIN) {
    res.status(403).json({
      error: 'No tiene permiso. Solo SuperAdmin puede crear, editar o eliminar habitaciones',
    })
    return
  }

  next()
}

/**
 * Middleware para cambiar estado de habitaciones - SuperAdmin o Recepcionista (RN-06)
 */
export const requireChangeRoomStatus = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }

  const permissions = getPermissions(req.user.role as RoleType)
  if (!permissions.canChangeRoomStatus) {
    res.status(403).json({
      error: 'No tiene permiso para cambiar estado de habitaciones',
    })
    return
  }

  next()
}

/**
 * Middleware para verificar si el usuario puede gestionar usuarios
 */
export const requireUserManagement = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }

  const permissions = getPermissions(req.user.role as RoleType)
  if (!permissions.canManageUsers) {
    res.status(403).json({
      error: 'No tiene permiso para gestionar usuarios',
    })
    return
  }

  next()
}

/**
 * Middleware para verificar si es SuperAdmin
 */
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }

  if (req.user.role !== RoleType.SUPERADMIN) {
    res.status(403).json({
      error: 'Solo SuperAdmin puede acceder a este recurso',
    })
    return
  }

  next()
}
