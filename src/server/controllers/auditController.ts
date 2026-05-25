import { Request, Response } from 'express'
import { getAuditRecords } from '../utils/audit'

export const listAuditEvents = async (_req: Request, res: Response) => {
  try {
    const events = await getAuditRecords(150)

    res.json({
      count: events.length,
      events,
    })
  } catch (error) {
    console.error('Error al obtener auditoría:', error)
    res.status(500).json({ error: 'Error al obtener auditoría' })
  }
}