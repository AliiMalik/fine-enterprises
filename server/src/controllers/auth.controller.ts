import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma/client.js'
import { signToken } from '../lib/jwt.js'
import type { AuthedRequest } from '../middleware/auth.middleware.js'

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = signToken({ userId: user.id, email: user.email })
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  })
}

export async function me(req: AuthedRequest, res: Response) {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json({ user })
}
