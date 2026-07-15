import type { Request, Response } from 'express'
import { prisma } from '../prisma/client.js'

async function computeNextBillNumber(): Promise<string> {
  const bills = await prisma.bill.findMany({ select: { billNumber: true } })
  let max = 0
  for (const b of bills) {
    const m = /BILL-(\d+)/.exec(b.billNumber)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n > max) max = n
    }
  }
  return `BILL-${String(max + 1).padStart(4, '0')}`
}

export async function listBills(_req: Request, res: Response) {
  const bills = await prisma.bill.findMany({
    orderBy: { issueDate: 'desc' },
    include: { items: true },
  })
  res.json(bills)
}

export async function getBill(req: Request, res: Response) {
  const bill = await prisma.bill.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  })
  if (!bill) {
    return res.status(404).json({ error: 'Bill not found' })
  }
  res.json(bill)
}

export async function createBill(req: Request, res: Response) {
  const data = req.body ?? {}
  const items: any[] = Array.isArray(data.items) ? data.items : []

  if (!String(data.supplierName ?? '').trim()) {
    return res.status(400).json({ error: 'Supplier name is required' })
  }
  if (items.length === 0) {
    return res.status(400).json({ error: 'At least one line item is required' })
  }
  const taxRate = Number(data.taxRate ?? 0)
  if (Number.isNaN(taxRate) || taxRate < 0) {
    return res.status(400).json({ error: 'Invalid tax rate' })
  }

  const normalized = items.map((i) => ({
    description: String(i.description ?? '').trim(),
    quantity: Number(i.quantity ?? 0),
    unitPrice: String(i.unitPrice ?? '0'),
  }))
  const subtotal = normalized.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
  const tax = subtotal * (taxRate / 100)
  const grandTotal = subtotal + tax
  const round = (n: number) => n.toFixed(2)
  const status = ['DRAFT', 'SENT', 'PAID', 'OVERDUE'].includes(data.status) ? data.status : 'DRAFT'
  const billNumber = await computeNextBillNumber()

  const bill = await prisma.bill.create({
    data: {
      billNumber,
      supplierName: String(data.supplierName).trim(),
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status,
      category: data.category?.trim() || null,
      subtotal: round(subtotal),
      tax: round(tax),
      grandTotal: round(grandTotal),
      items: {
        create: normalized.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          lineTotal: round(Number(i.unitPrice) * i.quantity),
        })),
      },
    },
    include: { items: true },
  })
  res.status(201).json(bill)
}

export async function updateBillStatus(req: Request, res: Response) {
  const { id } = req.params
  const { status } = req.body ?? {}
  if (!['DRAFT', 'SENT', 'PAID', 'OVERDUE'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const existing = await prisma.bill.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Bill not found' })
  }

  // The AP counterpart of invoices: paying a bill posts a MONEY_OUT transaction
  // so Accounts + cashflow reflect it. Atomic, with a guard against re-posting.
  const becomingPaid = status === 'PAID' && existing.status !== 'PAID'

  const bill = await prisma.$transaction(async (tx) => {
    const updated = await tx.bill.update({
      where: { id },
      data: { status },
      include: { items: true },
    })
    if (becomingPaid) {
      await tx.transaction.create({
        data: {
          type: 'MONEY_OUT',
          description: `Payment sent — ${updated.billNumber} (${updated.supplierName})`,
          category: updated.category,
          amount: updated.grandTotal,
          date: new Date(),
        },
      })
    }
    return updated
  })

  res.json(bill)
}
