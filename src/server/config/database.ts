import { Sequelize } from 'sequelize'
import path from 'path'
import fs from 'fs'

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL

let sequelize: Sequelize

if (databaseUrl) {
  // Strip query params (sslmode, pgbouncer, etc) so pg doesn't enforce
  // verify-full against Supabase's self-signed chain; SSL is configured
  // explicitly below via dialectOptions.
  const cleanUrl = databaseUrl.split('?')[0]
  sequelize = new Sequelize(cleanUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  })
} else if (process.env.DB_HOST && process.env.DB_NAME) {
  sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  })
} else {
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
