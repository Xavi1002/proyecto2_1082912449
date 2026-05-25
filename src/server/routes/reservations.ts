import { Router } from 'express'
import {
  checkAvailability,
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  getMyReservations,
  getReservationStatistics,
} from '../controllers/reservationController'
import { authenticateToken, authorizeRole } from '../middleware/auth'
import { RoleType } from '../models/Role'

const router = Router()

// Rutas públicas
router.get('/reservations/availability', checkAvailability)

// Obtener estadísticas - Solo autenticados
router.get('/reservations/statistics', authenticateToken, getReservationStatistics)

// Crear reserva - Todos los usuarios autenticados
router.post('/reservations', authenticateToken, createReservation)

// Obtener mis reservas - Todos los usuarios autenticados
router.get('/reservations/my-reservations', authenticateToken, getMyReservations)
router.get('/reservations/my', authenticateToken, getMyReservations)

// Obtener todas las reservas - Solo Recepción y SuperAdmin
router.get('/reservations', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), getReservations)

// Obtener reserva por ID - El propietario o Recepción/SuperAdmin
router.get('/reservations/:id', authenticateToken, getReservationById)

// Actualizar reserva - Recepción y SuperAdmin
router.put('/reservations/:id', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), updateReservation)

// Cancelar reserva - El propietario o Recepción/SuperAdmin
router.delete('/reservations/:id', authenticateToken, cancelReservation)

export default router
