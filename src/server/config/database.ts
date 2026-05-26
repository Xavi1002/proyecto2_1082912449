import { Sequelize } from 'sequelize'
import path from 'path'
import fs from 'fs'

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

const databaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL

let sequelize: Sequelize

if (databaseUrl) {
  // Strip query params (sslmode, pgbouncer, etc) so pg no fuerza verify-full
  // contra el certificado self-signed de Supabase.
  const cleanUrl = databaseUrl.split('?')[0]
  sequelize = new Sequelize(cleanUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  })
} else if (process.env.POSTGRES_HOST && process.env.POSTGRES_DATABASE) {
  sequelize = new Sequelize({
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    host: process.env.POSTGRES_HOST,
    port: 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  })
} else if (isServerless) {
  // No envs en serverless — instancia placeholder que fallara en authenticate()
  // con un mensaje claro. NUNCA lanzar en module-load: tumba el Function.
  sequelize = new Sequelize('postgres://unset:unset@unset:5432/unset', {
    dialect: 'postgres',
    logging: false,
  })
} else {
  // Fallback SQLite local
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  const storage = process.env.SQLITE_PATH || path.join(dataDir, 'dev.sqlite')
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
  })
}

export default sequelize
