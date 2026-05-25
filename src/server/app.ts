import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import sequelize from './config/database'
import userRoutes from './routes/users'
import authRoutes from './routes/auth'
import auditRoutes from './routes/audit'
import roomRoutes from './routes/rooms'
import reservationRoutes from './routes/reservations'
import clientRoutes from './routes/clients'
import Role, { RoleType } from './models/Role'
// Importar el resto de modelos para registrar asociaciones
import './models/User'
import './models/Room'
import './models/Reservation'
import './models/Client'

let initPromise: Promise<void> | null = null

async function initDatabase() {
  await sequelize.authenticate()
  // sync() sin alter:true. Las tablas se crean si no existen.
  // alter:true genera SQL malformado en Postgres para constraints UNIQUE.
  // Si necesitas cambiar el schema, hazlo via migracion SQL en Supabase.
  await sequelize.sync()

  const roles = [
    { name: RoleType.SUPERADMIN, description: 'Administrador del sistema' },
    { name: RoleType.RECEPCION, description: 'Personal de recepción' },
    { name: RoleType.CLIENTE, description: 'Cliente de la plataforma' },
  ]

  for (const roleData of roles) {
    await Role.findOrCreate({
      where: { name: roleData.name },
      defaults: roleData,
    })
  }
}

export function ensureDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = initDatabase().catch((error) => {
      initPromise = null
      throw error
    })
  }
  return initPromise
}

const app: Express = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await ensureDatabase()
    next()
  } catch (error) {
    next(error)
  }
})

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', auditRoutes)
app.use('/api', roomRoutes)
app.use('/api', reservationRoutes)
app.use('/api', clientRoutes)

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API error:', error)
  res.status(500).json({ error: error?.message || 'Error interno del servidor' })
})

export default app
