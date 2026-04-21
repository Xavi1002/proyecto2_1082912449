import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'proyecto2_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: false,
})

export default sequelize
