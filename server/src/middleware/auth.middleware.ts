import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt.js'

export interface AuthedRequest extends Request {
  userId?: string
  userEmail?: string
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim()
  }
  return null
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    const payload = verifyToken(token)
    req.userId = payload.userId
    req.userEmail = payload.email
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
