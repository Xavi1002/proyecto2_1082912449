import { Router } from 'express'
import {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
} from '../controllers/authController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = Router()

// Rutas públicas
router.post('/auth/register', register)
router.post('/auth/login', login)
router.post('/auth/logout', logout)

// Rutas protegidas
router.get('/auth/me', authenticateToken, getCurrentUser)
router.post('/auth/change-password', authenticateToken, changePassword)

export default router
