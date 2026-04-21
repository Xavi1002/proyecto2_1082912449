import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import sequelize from './config/database'
import userRoutes from './routes/users'
import authRoutes from './routes/auth'
import User from './models/User'
import Role, { RoleType } from './models/Role'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.use('/api', authRoutes)
app.use('/api', userRoutes)

// Database connection and seed roles
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('✓ Base de datos conectada')
    await sequelize.sync({ alter: true })
    console.log('✓ Tablas sincronizadas')

    // Crear roles por defecto si no existen
    const roles = [
      { name: RoleType.SUPERADMIN, description: 'Administrador del sistema' },
      { name: RoleType.RECEPCION, description: 'Personal de recepción' },
      { name: RoleType.CLIENTE, description: 'Cliente de la plataforma' },
    ]

    for (const roleData of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData,
      })
      if (created) {
        console.log(`✓ Rol ${roleData.name} creado`)
      }
    }

    app.listen(PORT, () => {
      console.log(`✓ Servidor ejecutándose en puerto ${PORT}`)
    })
  } catch (error) {
    console.error('Error al iniciar servidor:', error)
    process.exit(1)
  }
}

startServer()

export default app
