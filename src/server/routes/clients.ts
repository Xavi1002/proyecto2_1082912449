import { Router } from 'express'
import {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  searchClients,
  updateClient,
} from '../controllers/clientController'
import { authenticateToken, authorizeRole } from '../middleware/auth'
import { RoleType } from '../models/Role'

const router = Router()

router.get('/clients/search', authenticateToken, searchClients)

router.get('/clients', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), getClients)
router.post('/clients', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), createClient)
router.get('/clients/:id', authenticateToken, getClientById)
router.put('/clients/:id', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), updateClient)
router.delete('/clients/:id', authenticateToken, authorizeRole(RoleType.SUPERADMIN), deleteClient)

export default router
