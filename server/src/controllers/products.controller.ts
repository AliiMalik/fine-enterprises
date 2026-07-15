import type { Request, Response } from 'express'
import { prisma } from '../prisma/client.js'

export async function listProducts(_req: Request, res: Response) {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(products)
}

export async function createProduct(req: Request, res: Response) {
  const data = req.body ?? {}
  const sku = (data.sku ?? '').trim()
  const name = (data.name ?? '').trim()
  if (!sku || !name) {
    return res.status(400).json({ error: 'SKU and name are required' })
  }

  const existing = await prisma.product.findUnique({ where: { sku } })
  if (existing) {
    return res.status(409).json({ error: 'A product with this SKU already exists' })
  }

  const product = await prisma.product.create({
    data: {
      sku,
      name,
      description: data.description ?? null,
      unitPrice: String(Number(data.unitPrice ?? 0).toFixed(2)),
      stockCartons: Number(data.stockCartons ?? 0),
    },
  })
  res.status(201).json(product)
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params
  const data = req.body ?? {}
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const patch: Record<string, unknown> = {}
  if (data.name != null) patch.name = String(data.name).trim()
  if (data.description !== undefined) patch.description = data.description || null
  if (data.unitPrice != null) patch.unitPrice = String(Number(data.unitPrice).toFixed(2))
  if (data.stockCartons != null) patch.stockCartons = Number(data.stockCartons)

  const product = await prisma.product.update({ where: { id }, data: patch })
  res.json(product)
}
