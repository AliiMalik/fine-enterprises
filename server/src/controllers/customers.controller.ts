import type { Request, Response } from 'express'
import { prisma } from '../prisma/client.js'

export async function listCustomers(_req: Request, res: Response) {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { invoices: true } } },
  })
  res.json(customers)
}

export async function getCustomer(req: Request, res: Response) {
  const { id } = req.params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { invoices: { orderBy: { issueDate: 'desc' } } },
  })
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' })
  }
  const totalBilled = customer.invoices.reduce((s, i) => s + Number(i.grandTotal), 0)
  const outstanding = customer.invoices
    .filter((i) => i.status !== 'PAID')
    .reduce((s, i) => s + Number(i.grandTotal), 0)
  res.json({
    ...customer,
    totalBilled: Math.round(totalBilled * 100) / 100,
    outstanding: Math.round(outstanding * 100) / 100,
  })
}

export async function updateCustomer(req: Request, res: Response) {
  const { id } = req.params
  const data = req.body ?? {}
  const existing = await prisma.customer.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Customer not found' })
  }
  if (data.name != null && !String(data.name).trim()) {
    return res.status(400).json({ error: 'Customer name is required' })
  }
  const fields = ['name', 'email', 'phone', 'addressLine1', 'addressLine2', 'city', 'postcode', 'country'] as const
  const patch: Record<string, unknown> = {}
  for (const f of fields) {
    if (data[f] !== undefined) patch[f] = data[f] === '' ? null : data[f]
  }
  if (patch.name != null) patch.name = String(patch.name).trim()
  const customer = await prisma.customer.update({ where: { id }, data: patch })
  res.json(customer)
}

export async function createCustomer(req: Request, res: Response) {
  const data = req.body ?? {}
  const name = (data.name ?? '').trim()
  if (!name) {
    return res.status(400).json({ error: 'Customer name is required' })
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      addressLine1: data.addressLine1 ?? null,
      addressLine2: data.addressLine2 ?? null,
      city: data.city ?? null,
      postcode: data.postcode ?? null,
      country: data.country ?? null,
    },
  })
  res.status(201).json(customer)
}
