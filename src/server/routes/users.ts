import { Router } from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsersByName,
} from '../controllers/userController'
import { authenticateToken, requireSuperAdmin } from '../middleware/auth'

const router = Router()

// Búsqueda de usuarios - Solo usuarios autenticados
router.get('/users/search', authenticateToken, searchUsersByName)

// Todas las operaciones CRUD solo para SuperAdmin
router.get('/users', authenticateToken, requireSuperAdmin, getUsers)
router.get('/users/:id', authenticateToken, requireSuperAdmin, getUserById)
router.post('/users', authenticateToken, requireSuperAdmin, createUser)
router.put('/users/:id', authenticateToken, requireSuperAdmin, updateUser)
router.delete('/users/:id', authenticateToken, requireSuperAdmin, deleteUser)

export default router
