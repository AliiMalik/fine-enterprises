import 'dotenv/config'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { ENV_PATH, PORT, REPO_ROOT } from './config.js'
import { prisma } from './prisma/client.js'

// Ensure .env from repo root is loaded regardless of cwd
dotenv.config({ path: ENV_PATH })

import authRoutes from './routes/auth.routes.js'
import customerRoutes from './routes/customers.routes.js'
import invoiceRoutes from './routes/invoices.routes.js'
import billRoutes from './routes/bills.routes.js'
import productRoutes from './routes/products.routes.js'
import shipmentRoutes from './routes/shipments.routes.js'
import transactionRoutes from './routes/transactions.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/bills', billRoutes)
app.use('/api/products', productRoutes)
app.use('/api/shipments', shipmentRoutes)
app.use('/api/transactions', transactionRoutes)

const clientDist = path.resolve(REPO_ROOT, 'client', 'dist')

app.use(express.static(clientDist))

// SPA fallback: any GET not starting with /api -> index.html
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` })
})

// Centralized error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err)
    const status = err?.status ?? 500
    const message = err?.message ?? 'Internal server error'
    res.status(status).json({ error: message })
  },
)

app.listen(PORT, () => {
  console.log(`Fine Enterprises API listening on http://localhost:${PORT}`)
})

void prisma

export default app
