import { Router } from 'express'
import { listAuditEvents } from '../controllers/auditController'
import { authenticateToken, requireSuperAdmin } from '../middleware/auth'

const router = Router()

router.get('/audits', authenticateToken, requireSuperAdmin, listAuditEvents)

export default router