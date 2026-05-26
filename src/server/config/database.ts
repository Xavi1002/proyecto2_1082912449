import { Sequelize } from 'sequelize'
// Import explicito para que webpack/NFT detecte pg como dependencia estatica
// del bundle del serverless function. Sequelize lo carga via require('pg')
// dinamico que ni serverExternalPackages ni Vercel NFT atrapan, lo que
// produce "Please install pg package manually" en runtime.
import 'pg'

// Conexion a Postgres (Supabase). En local lee de .env.local, en Vercel de la
// integracion Vercel <-> Supabase. Si no hay envs, se construye una instancia
// placeholder que falla en .authenticate() con mensaje claro — NUNCA lanzar
// en module-load porque tumba el serverless function antes del handler.

const databaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL

let sequelize: Sequelize

if (databaseUrl) {
  // Strip query params (sslmode, pgbouncer, etc) para que pg no fuerce
  // verify-full contra el self-signed de Supabase.
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
} else {
  // Placeholder — fallara en authenticate() con un mensaje de conexion claro.
  sequelize = new Sequelize('postgres://unset:unset@unset:5432/unset', {
    dialect: 'postgres',
    logging: false,
  })
}

export default sequelize
