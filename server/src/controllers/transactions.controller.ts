import type { Request, Response } from 'express'
import { prisma } from '../prisma/client.js'

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function monthBucket(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export async function listTransactions(_req: Request, res: Response) {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  })
  res.json(transactions)
}

export async function createTransaction(req: Request, res: Response) {
  const data = req.body ?? {}
  const type = data.type
  const description = (data.description ?? '').trim()
  const amount = Number(data.amount ?? 0)
  const date = data.date ? new Date(data.date) : new Date()

  if (!['MONEY_IN', 'MONEY_OUT'].includes(type)) {
    return res.status(400).json({ error: 'Type must be MONEY_IN or MONEY_OUT' })
  }
  if (!description) {
    return res.status(400).json({ error: 'Description is required' })
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than zero' })
  }

  const transaction = await prisma.transaction.create({
    data: {
      type,
      description,
      amount: amount.toFixed(2),
      date,
    },
  })
  res.status(201).json(transaction)
}

export async function summary(_req: Request, res: Response) {
  const now = new Date()
  const buckets: { key: string; label: string; moneyIn: number; moneyOut: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthBucket(d)
    buckets.push({ key, label: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, moneyIn: 0, moneyOut: 0 })
  }
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start } },
  })

  for (const t of transactions) {
    const key = monthBucket(new Date(t.date))
    const bucket = buckets.find((b) => b.key === key)
    if (!bucket) continue
    const amt = Number(t.amount)
    if (t.type === 'MONEY_IN') bucket.moneyIn += amt
    else bucket.moneyOut += amt
  }

  const rounded = buckets.map((b) => ({
    ...b,
    moneyIn: Number(b.moneyIn.toFixed(2)),
    moneyOut: Number(b.moneyOut.toFixed(2)),
  }))

  res.json(rounded)
}
