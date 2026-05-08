import { Router } from 'express'
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getRoomAvailability,
  getRoomStatistics,
} from '../controllers/roomController'
import { authenticateToken, requireRoomManagement } from '../middleware/auth'

const router = Router()

// Rutas públicas
router.get('/rooms', getAllRooms)
router.get('/rooms/availability', getRoomAvailability)
router.get('/rooms/statistics', getRoomStatistics)
router.get('/rooms/:id', getRoomById)

// Rutas protegidas - Solo Recepción y SuperAdmin pueden crear, actualizar o eliminar
router.post('/rooms', authenticateToken, requireRoomManagement, createRoom)
router.put('/rooms/:id', authenticateToken, requireRoomManagement, updateRoom)
router.delete('/rooms/:id', authenticateToken, requireRoomManagement, deleteRoom)
router.patch('/rooms/:id/status', authenticateToken, requireRoomManagement, updateRoomStatus)

export default router
