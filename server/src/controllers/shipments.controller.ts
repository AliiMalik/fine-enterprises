import type { Request, Response } from 'express'
import { prisma } from '../prisma/client.js'

function nextShipmentNumber(currentMax: number): string {
  const next = (Number.isFinite(currentMax) ? currentMax : 0) + 1
  return `SHIP-${String(next).padStart(4, '0')}`
}

async function computeNextShipmentNumber(): Promise<string> {
  const shipments = await prisma.shipment.findMany({ select: { shipmentNumber: true } })
  let max = 0
  for (const s of shipments) {
    const match = /SHIP-(\d+)/.exec(s.shipmentNumber)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > max) max = n
    }
  }
  return nextShipmentNumber(max)
}

export async function listShipments(_req: Request, res: Response) {
  const shipments = await prisma.shipment.findMany({
    orderBy: { receivedDate: 'desc' },
    include: { items: { include: { product: true } } },
  })
  res.json(shipments)
}

export async function createShipment(req: Request, res: Response) {
  const data = req.body ?? {}
  const items: any[] = Array.isArray(data.items) ? data.items : []

  if (items.length === 0) {
    return res.status(400).json({ error: 'At least one shipment item is required' })
  }

  const normalized = items
    .map((it) => ({
      productId: String(it.productId ?? '').trim(),
      quantityCartons: Number(it.quantityCartons ?? 0),
    }))
    .filter((it) => it.productId && it.quantityCartons > 0)

  if (normalized.length === 0) {
    return res.status(400).json({ error: 'Valid shipment items are required' })
  }

  // Verify all products exist before starting the transaction
  const productIds = normalized.map((it) => it.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
  if (products.length !== new Set(productIds).size) {
    return res.status(400).json({ error: 'One or more products are invalid' })
  }

  const shipmentNumber = data.shipmentNumber?.trim() || (await computeNextShipmentNumber())

  const shipment = await prisma.$transaction(async (tx) => {
    const created = await tx.shipment.create({
      data: {
        shipmentNumber,
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
        items: {
          create: normalized.map((it) => ({
            productId: it.productId,
            quantityCartons: it.quantityCartons,
          })),
        },
      },
    })

    for (const it of normalized) {
      await tx.product.update({
        where: { id: it.productId },
        data: { stockCartons: { increment: it.quantityCartons } },
      })
    }

    return tx.shipment.findUnique({
      where: { id: created.id },
      include: { items: { include: { product: true } } },
    })
  })

  res.status(201).json(shipment)
}
