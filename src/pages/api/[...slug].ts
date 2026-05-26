import type { NextApiRequest, NextApiResponse } from 'next'
import app from '../../server/app'

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    return (app as any)(req, res)
  } catch (e: any) {
    res.status(500).json({
      error: 'Request handler crash',
      message: e?.message || String(e),
      envHints: {
        hasPostgresUrlNonPooling: Boolean(process.env.POSTGRES_URL_NON_POOLING),
        hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
        hasPostgresHost: Boolean(process.env.POSTGRES_HOST),
        hasJwtSecret: Boolean(process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET),
        isVercel: Boolean(process.env.VERCEL),
        nodeEnv: process.env.NODE_ENV,
      },
    })
  }
}
