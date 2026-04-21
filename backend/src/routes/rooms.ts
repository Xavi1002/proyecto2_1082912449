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
import { authenticateToken, authorizeRole } from '../middleware/auth'
import { RoleType } from '../models/Role'

const router = Router()

router.get('/rooms', getAllRooms)
router.get('/rooms/availability', getRoomAvailability)
router.get('/rooms/statistics', getRoomStatistics)
router.get('/rooms/:id', getRoomById)

router.post('/rooms', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), createRoom)
router.put('/rooms/:id', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), updateRoom)
router.delete('/rooms/:id', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), deleteRoom)
router.patch(
  '/rooms/:id/status',
  authenticateToken,
  authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION),
  updateRoomStatus
)

export default router
