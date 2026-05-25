import { Router } from 'express'
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getRoomAvailability,
  getAvailableRoomsForDates,
  getRoomStatistics,
} from '../controllers/roomController'
import { authenticateToken, requireSuperAdminRoomManagement, requireChangeRoomStatus, authorizeRole } from '../middleware/auth'
import { RoleType } from '../models/Role'

const router = Router()

// Rutas públicas - Cualquiera puede ver disponibilidad
router.get('/rooms/availability', getRoomAvailability)
router.get('/rooms/available', getAvailableRoomsForDates) // Debe ir antes de /:id
router.get('/rooms/statistics', getRoomStatistics)

// Listado y detalle de habitaciones - solo personal autorizado
router.get('/rooms/:id', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), getRoomById)
router.get('/rooms', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), getAllRooms)

// Rutas protegidas - Solo SuperAdmin puede crear (RN-03)
router.post('/rooms', authenticateToken, requireSuperAdminRoomManagement, createRoom)

// Rutas protegidas - Solo SuperAdmin puede editar (RN-03)
router.put('/rooms/:id', authenticateToken, requireSuperAdminRoomManagement, updateRoom)

// Rutas protegidas - Solo SuperAdmin puede eliminar (RN-03)
router.delete('/rooms/:id', authenticateToken, requireSuperAdminRoomManagement, deleteRoom)

// Rutas protegidas - SuperAdmin o Recepcionista pueden cambiar estado (RN-06)
router.patch('/rooms/:id/status', authenticateToken, requireChangeRoomStatus, updateRoomStatus)

export default router
