import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt'

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
