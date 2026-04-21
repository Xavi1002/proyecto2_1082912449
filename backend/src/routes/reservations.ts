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
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Rutas públicas
router.get('/reservations/availability', checkAvailability)
router.get('/reservations/statistics', getReservationStatistics)

// Rutas protegidas
router.post('/reservations', authenticateToken, createReservation)
router.get('/reservations/my-reservations', authenticateToken, getMyReservations)
router.get('/reservations', getReservations)
router.get('/reservations/:id', getReservationById)
router.put('/reservations/:id', authenticateToken, updateReservation)
router.delete('/reservations/:id', authenticateToken, cancelReservation)

export default router
