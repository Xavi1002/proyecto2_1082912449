import { Sequelize } from 'sequelize'
import path from 'path'
import fs from 'fs'

// Variables de la integracion Vercel <-> Supabase (mismos nombres que en
// Project Settings -> Environment Variables / .env.local).
const databaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

let sequelize: Sequelize

if (databaseUrl) {
  // Strip query params (sslmode, pgbouncer, etc) so pg no fuerza verify-full
  // contra el certificado self-signed de Supabase. El SSL se configura
  // explicitamente via dialectOptions.
  const cleanUrl = databaseUrl.split('?')[0]
  sequelize = new Sequelize(cleanUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  })
} else if (process.env.POSTGRES_HOST && process.env.POSTGRES_DATABASE) {
  // Fallback: componentes individuales (tambien expuestos por la integracion).
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
  throw new Error(
    'Falta POSTGRES_URL_NON_POOLING / POSTGRES_URL en el entorno serverless. ' +
      'Configura las variables de la integracion Vercel <-> Supabase en ' +
      'Project Settings -> Environment Variables (habilitadas para Production y Preview).'
  )
} else {
  // Fallback SQLite solo para desarrollo local. En serverless ya bloqueamos arriba.
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
