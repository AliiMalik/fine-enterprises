import type { Request, Response } from 'express'
import { prisma } from '../prisma/client.js'

function nextInvoiceNumber(currentMax: number): string {
  const next = (Number.isFinite(currentMax) ? currentMax : 0) + 1
  return `INV-${String(next).padStart(4, '0')}`
}

async function computeNextInvoiceNumber(): Promise<string> {
  const invoices = await prisma.invoice.findMany({ select: { invoiceNumber: true } })
  let max = 0
  for (const inv of invoices) {
    const match = /INV-(\d+)/.exec(inv.invoiceNumber)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > max) max = n
    }
  }
  return nextInvoiceNumber(max)
}

export async function listInvoices(_req: Request, res: Response) {
  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: 'desc' },
    include: {
      customer: true,
      lineItems: true,
    },
  })
  res.json(invoices)
}

export async function getInvoice(req: Request, res: Response) {
  const { id } = req.params
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, lineItems: true },
  })
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' })
  }
  res.json(invoice)
}

export async function createInvoice(req: Request, res: Response) {
  const data = req.body ?? {}
  const lineItems: any[] = Array.isArray(data.lineItems) ? data.lineItems : []

  if (!data.crn || (!data.customer?.name && !data.customerId)) {
    return res.status(400).json({ error: 'CRN and customer are required' })
  }
  if (lineItems.length === 0) {
    return res.status(400).json({ error: 'At least one line item is required' })
  }

  const taxRate = Number(data.taxRate ?? 0)
  if (Number.isNaN(taxRate) || taxRate < 0) {
    return res.status(400).json({ error: 'Invalid tax rate' })
  }

  // Only keep productId links that reference a real product (free-text lines
  // remain allowed with productId = null).
  const requestedIds = [...new Set(lineItems.map((li) => li.productId).filter(Boolean).map(String))]
  const existingProducts = requestedIds.length
    ? await prisma.product.findMany({ where: { id: { in: requestedIds } }, select: { id: true } })
    : []
  const validIds = new Set(existingProducts.map((p) => p.id))

  const normalizedItems = lineItems.map((li) => ({
    productId: li.productId && validIds.has(String(li.productId)) ? String(li.productId) : null,
    sku: String(li.sku ?? '').trim(),
    description: String(li.description ?? '').trim(),
    quantity: Number(li.quantity ?? 0),
    unitPrice: String(li.unitPrice ?? '0'),
  }))

  const subtotal = normalizedItems.reduce(
    (sum, li) => sum + Number(li.unitPrice) * li.quantity,
    0,
  )
  const tax = subtotal * (taxRate / 100)
  const grandTotal = subtotal + tax
  const round = (n: number) => n.toFixed(2)

  const status = ['DRAFT', 'SENT', 'PAID', 'OVERDUE'].includes(data.status)
    ? data.status
    : 'DRAFT'

  const invoiceNumber = await computeNextInvoiceNumber()

  const invoice = await prisma.$transaction(async (tx) => {
    // Resolve the customer: use an explicit id if valid, else match-or-create
    // by email (the historic behaviour).
    let customerId: string | null = data.customerId ?? null
    if (customerId) {
      const exists = await tx.customer.findUnique({ where: { id: customerId } })
      if (!exists) customerId = null
    }
    if (!customerId) {
      const customerData = {
        name: String(data.customer.name).trim(),
        email: data.customer.email?.trim() || null,
        phone: data.customer.phone?.trim() || null,
        addressLine1: data.customer.addressLine1?.trim() || null,
        addressLine2: data.customer.addressLine2?.trim() || null,
        city: data.customer.city?.trim() || null,
        postcode: data.customer.postcode?.trim() || null,
        country: data.customer.country?.trim() || null,
      }
      let customer = customerData.email
        ? await tx.customer.findFirst({ where: { email: customerData.email } })
        : null
      if (!customer) customer = await tx.customer.create({ data: customerData })
      customerId = customer.id
    }

    const created = await tx.invoice.create({
      data: {
        crn: data.crn.trim(),
        invoiceNumber,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status,
        customerId,
        subtotal: round(subtotal),
        tax: round(tax),
        grandTotal: round(grandTotal),
        lineItems: {
          create: normalizedItems.map((li) => ({
            productId: li.productId,
            sku: li.sku,
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            lineTotal: round(Number(li.unitPrice) * li.quantity),
          })),
        },
      },
      include: { customer: true, lineItems: true },
    })

    // Issuing an invoice (any status other than Draft) draws down stock for
    // product-linked lines. Overselling is allowed (stock may go negative and
    // is flagged in the UI), never blocked.
    if (status !== 'DRAFT') {
      for (const li of normalizedItems) {
        if (li.productId) {
          await tx.product.update({
            where: { id: li.productId },
            data: { stockCartons: { decrement: li.quantity } },
          })
        }
      }
    }
    return created
  })

  res.status(201).json(invoice)
}

export async function updateInvoiceStatus(req: Request, res: Response) {
  const { id } = req.params
  const { status } = req.body ?? {}
  if (!['DRAFT', 'SENT', 'PAID', 'OVERDUE'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  const existing = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, lineItems: true },
  })
  if (!existing) {
    return res.status(404).json({ error: 'Invoice not found' })
  }

  // Connecting the modules: when an invoice first becomes PAID, record the
  // payment as a MONEY_IN transaction so Accounts + cashflow reflect it. The
  // update + transaction are atomic; the guard prevents double-posting if the
  // invoice is set to PAID again.
  const becomingPaid = status === 'PAID' && existing.status !== 'PAID'
  // Issuing a draft (Draft -> anything else) draws down stock for its
  // product-linked lines, so it matches an invoice created directly as Sent.
  const issuingDraft = existing.status === 'DRAFT' && status !== 'DRAFT'

  const invoice = await prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id },
      data: { status },
      include: { customer: true, lineItems: true },
    })
    if (becomingPaid) {
      await tx.transaction.create({
        data: {
          type: 'MONEY_IN',
          description: `Payment received — ${updated.invoiceNumber} (${updated.customer.name})`,
          amount: updated.grandTotal,
          date: new Date(),
        },
      })
    }
    if (issuingDraft) {
      for (const li of existing.lineItems) {
        if (li.productId) {
          await tx.product.update({
            where: { id: li.productId },
            data: { stockCartons: { decrement: li.quantity } },
          })
        }
      }
    }
    return updated
  })

  res.json(invoice)
}
