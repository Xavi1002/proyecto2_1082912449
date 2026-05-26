import type { NextApiRequest, NextApiResponse } from 'next'

// Test endpoint SIN dependencias para aislar problemas de bundling.
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    pong: true,
    runtime: 'node',
    isVercel: Boolean(process.env.VERCEL),
    nodeEnv: process.env.NODE_ENV,
    nodeVersion: process.version,
    hasPostgresUrlNonPooling: Boolean(process.env.POSTGRES_URL_NON_POOLING),
    hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
    hasPostgresHost: Boolean(process.env.POSTGRES_HOST),
    hasJwtSecret: Boolean(process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET),
  })
}
