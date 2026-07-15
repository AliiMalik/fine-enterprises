import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma/client.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') })

const ADMIN_EMAIL = 'admin@fineenterprises.com'
const ADMIN_PASSWORD = 'demo1234'
const ADMIN_NAME = 'Admin Fine'

function monthsAgo(n: number, day = 15): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - n, day)
  return d
}

async function main() {
  console.log('Resetting database...')
  await prisma.invoice.deleteMany()
  await prisma.bill.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creating admin user...')
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashed,
      name: ADMIN_NAME,
    },
  })

  console.log('Creating customers...')
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Acme Traders Ltd',
        email: 'accounts@acme.example',
        phone: '+44 20 7946 0111',
        addressLine1: '12 Bowring Street',
        addressLine2: 'Suite 4',
        city: 'London',
        postcode: 'EC1A 1BB',
        country: 'United Kingdom',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Northwind Logistics',
        email: 'billing@northwind.example',
        phone: '+44 161 496 0112',
        addressLine1: '88 Deansgate',
        city: 'Manchester',
        postcode: 'M3 2FW',
        country: 'United Kingdom',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Globex Corporation',
        email: 'ap@globex.example',
        phone: '+1 415 555 0133',
        addressLine1: '500 Market Street',
        addressLine2: 'Floor 9',
        city: 'San Francisco',
        postcode: 'CA 94105',
        country: 'United States',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Soylent Foods',
        email: 'pay@soylent.example',
        phone: '+44 29 2046 0114',
        addressLine1: '3 Churchill Way',
        city: 'Cardiff',
        postcode: 'CF10 2HD',
        country: 'United Kingdom',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Initech Supplies',
        email: 'finance@initech.example',
        phone: '+44 113 496 0115',
        addressLine1: '21 The Headrow',
        city: 'Leeds',
        postcode: 'LS1 6PU',
        country: 'United Kingdom',
      },
    }),
  ])

  console.log('Creating products...')
  const productData = [
    { sku: 'TEA-001', name: 'Earl Grey Tea (Carton)', description: '40 bags per carton', unitPrice: '18.50', stockCartons: 120 },
    { sku: 'COF-002', name: 'Arabica Coffee (Carton)', description: '1kg bags, 12 per carton', unitPrice: '42.00', stockCartons: 80 },
    { sku: 'SUG-003', name: 'Cane Sugar (Carton)', description: '1kg packets, 24 per carton', unitPrice: '8.25', stockCartons: 200 },
    { sku: 'BNK-004', name: 'Digestive Biscuits (Carton)', description: '24 packs per carton', unitPrice: '11.25', stockCartons: 60 },
    { sku: 'CHC-005', name: 'Dark Chocolate (Carton)', description: '100g bars, 48 per carton', unitPrice: '33.75', stockCartons: 45 },
    { sku: 'JAM-006', name: 'Strawberry Jam (Carton)', description: '340g jars, 12 per carton', unitPrice: '21.40', stockCartons: 90 },
    { sku: 'OIL-007', name: 'Olive Oil (Carton)', description: '1L tins, 6 per carton', unitPrice: '29.99', stockCartons: 12 },
    { sku: 'PST-008', name: 'Pasta Penne (Carton)', description: '500g, 20 per carton', unitPrice: '9.50', stockCartons: 150 },
  ]
  const products = await Promise.all(
    productData.map((p) => prisma.product.create({ data: p })),
  )
  const bySku = Object.fromEntries(products.map((p) => [p.sku, p]))

  console.log('Creating invoices...')
  const buildInvoice = (items: any[]) => {
    const subtotal = items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
    const tax = subtotal * 0.2
    const grandTotal = subtotal + tax
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      lineItems: {
        create: items.map((i) => ({
          productId: bySku[i.sku]?.id ?? null,
          sku: i.sku,
          description: i.description,
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
          lineTotal: (Number(i.unitPrice) * i.quantity).toFixed(2),
        })),
      },
    }
  }

  const inv1 = [
    { sku: 'TEA-001', description: 'Earl Grey Tea (Carton)', quantity: 20, unitPrice: 18.5 },
    { sku: 'COF-002', description: 'Arabica Coffee (Carton)', quantity: 10, unitPrice: 42.0 },
  ]
  const inv2 = [
    { sku: 'BNK-004', description: 'Digestive Biscuits (Carton)', quantity: 15, unitPrice: 11.25 },
    { sku: 'CHC-005', description: 'Dark Chocolate (Carton)', quantity: 8, unitPrice: 33.75 },
    { sku: 'JAM-006', description: 'Strawberry Jam (Carton)', quantity: 6, unitPrice: 21.4 },
  ]
  const inv3 = [
    { sku: 'OIL-007', description: 'Olive Oil (Carton)', quantity: 12, unitPrice: 29.99 },
    { sku: 'PST-008', description: 'Pasta Penne (Carton)', quantity: 25, unitPrice: 9.5 },
  ]

  await prisma.invoice.create({
    data: {
      crn: 'CRN-77123',
      invoiceNumber: 'INV-0001',
      issueDate: monthsAgo(4, 3),
      dueDate: monthsAgo(3, 3),
      status: 'PAID',
      customerId: customers[0].id,
      ...buildInvoice(inv1),
    },
  })
  await prisma.invoice.create({
    data: {
      crn: 'CRN-77124',
      invoiceNumber: 'INV-0002',
      issueDate: monthsAgo(2, 10),
      dueDate: monthsAgo(1, 10),
      status: 'SENT',
      customerId: customers[1].id,
      ...buildInvoice(inv2),
    },
  })
  await prisma.invoice.create({
    data: {
      crn: 'CRN-77125',
      invoiceNumber: 'INV-0003',
      issueDate: monthsAgo(1, 20),
      dueDate: monthsAgo(0, 20),
      status: 'DRAFT',
      customerId: customers[2].id,
      ...buildInvoice(inv3),
    },
  })

  // Issued invoices (Sent/Paid) draw down stock for their linked products
  // (drafts do not). INV-0001 + INV-0002 are issued; INV-0003 is a draft.
  for (const item of [...inv1, ...inv2]) {
    const p = bySku[item.sku]
    if (p) {
      await prisma.product.update({
        where: { id: p.id },
        data: { stockCartons: { decrement: item.quantity } },
      })
    }
  }

  console.log('Creating bills...')
  const buildBill = (items: { description: string; quantity: number; unitPrice: number }[]) => {
    const subtotal = items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
    const tax = subtotal * 0.2
    const grandTotal = subtotal + tax
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      items: {
        create: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
          lineTotal: (Number(i.unitPrice) * i.quantity).toFixed(2),
        })),
      },
    }
  }

  await prisma.bill.create({
    data: {
      billNumber: 'BILL-0001',
      supplierName: 'Riverside Packaging Co',
      issueDate: monthsAgo(2, 2),
      dueDate: monthsAgo(1, 2),
      status: 'PAID',
      category: 'Packaging',
      ...buildBill([{ description: 'Cardboard shipping cartons (bulk)', quantity: 500, unitPrice: 0.85 }]),
    },
  })
  await prisma.bill.create({
    data: {
      billNumber: 'BILL-0002',
      supplierName: 'Metro Utilities',
      issueDate: monthsAgo(1, 6),
      dueDate: monthsAgo(0, 6),
      status: 'PAID',
      category: 'Utilities',
      ...buildBill([{ description: 'Electricity — quarterly', quantity: 1, unitPrice: 640 }]),
    },
  })
  await prisma.bill.create({
    data: {
      billNumber: 'BILL-0003',
      supplierName: 'Crown Wholesale',
      issueDate: monthsAgo(0, 8),
      dueDate: monthsAgo(-1, 8),
      status: 'SENT',
      category: 'Stock',
      ...buildBill([{ description: 'Restock — assorted goods', quantity: 1, unitPrice: 1200 }]),
    },
  })
  await prisma.bill.create({
    data: {
      billNumber: 'BILL-0004',
      supplierName: 'FleetFuel Ltd',
      issueDate: monthsAgo(1, 12),
      dueDate: monthsAgo(0, 12),
      status: 'SENT',
      category: 'Fuel',
      ...buildBill([{ description: 'Diesel — delivery fleet', quantity: 1, unitPrice: 410 }]),
    },
  })

  console.log('Creating shipments...')
  await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHIP-0001',
      receivedDate: monthsAgo(3, 5),
      items: {
        create: [
          { productId: products[0].id, quantityCartons: 50 },
          { productId: products[1].id, quantityCartons: 30 },
          { productId: products[3].id, quantityCartons: 20 },
        ],
      },
    },
  })
  await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHIP-0002',
      receivedDate: monthsAgo(1, 8),
      items: {
        create: [
          { productId: products[4].id, quantityCartons: 15 },
          { productId: products[5].id, quantityCartons: 40 },
          { productId: products[6].id, quantityCartons: 10 },
          { productId: products[7].id, quantityCartons: 60 },
        ],
      },
    },
  })

  console.log('Creating transactions...')
  const tx = [
    { type: 'MONEY_IN', description: 'Invoice INV-0001 payment', category: 'Sales', amount: 566.4, date: monthsAgo(3, 6) },
    { type: 'MONEY_IN', description: 'Invoice INV-0002 payment', category: 'Sales', amount: 412.13, date: monthsAgo(1, 12) },
    { type: 'MONEY_OUT', description: 'Warehouse rent', category: 'Rent', amount: 1800, date: monthsAgo(5, 1) },
    { type: 'MONEY_OUT', description: 'Warehouse rent', category: 'Rent', amount: 1800, date: monthsAgo(4, 1) },
    { type: 'MONEY_OUT', description: 'Warehouse rent', category: 'Rent', amount: 1800, date: monthsAgo(3, 1) },
    { type: 'MONEY_OUT', description: 'Warehouse rent', category: 'Rent', amount: 1800, date: monthsAgo(2, 1) },
    { type: 'MONEY_OUT', description: 'Warehouse rent', category: 'Rent', amount: 1800, date: monthsAgo(1, 1) },
    { type: 'MONEY_OUT', description: 'Warehouse rent', category: 'Rent', amount: 1800, date: monthsAgo(0, 1) },
    { type: 'MONEY_OUT', description: 'Delivery fuel', category: 'Fuel', amount: 320.5, date: monthsAgo(4, 18) },
    { type: 'MONEY_OUT', description: 'Payment sent — BILL-0002 (Metro Utilities)', category: 'Utilities', amount: 768, date: monthsAgo(0, 7) },
    { type: 'MONEY_OUT', description: 'Payment sent — BILL-0001 (Riverside Packaging Co)', category: 'Packaging', amount: 510, date: monthsAgo(1, 3) },
    { type: 'MONEY_IN', description: 'Bulk wholesale order', category: 'Sales', amount: 2300, date: monthsAgo(4, 12) },
    { type: 'MONEY_IN', description: 'Retail partner payout', category: 'Sales', amount: 1450.25, date: monthsAgo(2, 15) },
    { type: 'MONEY_OUT', description: 'Staff wages', category: 'Wages', amount: 2600, date: monthsAgo(2, 28) },
    { type: 'MONEY_OUT', description: 'Staff wages', category: 'Wages', amount: 2600, date: monthsAgo(1, 28) },
    { type: 'MONEY_IN', description: 'Online store sales', category: 'Sales', amount: 980.4, date: monthsAgo(0, 5) },
  ]
  await Promise.all(
    tx.map((t) =>
      prisma.transaction.create({
        data: {
          type: t.type as any,
          description: t.description,
          category: t.category,
          amount: t.amount.toFixed(2),
          date: t.date,
        },
      }),
    ),
  )

  console.log('Seed complete.')
  console.log(`Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
