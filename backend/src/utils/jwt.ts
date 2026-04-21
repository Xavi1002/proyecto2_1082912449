import jwt from 'jsonwebtoken'

export interface JwtPayload {
  id: number
  email: string
  roleId: number
  role: string
  iat?: number
  exp?: number
}

export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET || 'tu-secret-muy-seguro-cambiar-en-produccion'
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign(payload, secret, { expiresIn })
}

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'tu-secret-muy-seguro-cambiar-en-produccion'
    const decoded = jwt.verify(token, secret) as JwtPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload
    return decoded
  } catch (error) {
    console.error('Token decode failed:', error)
    return null
  }
}
