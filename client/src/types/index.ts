export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
export type TransactionType = 'MONEY_IN' | 'MONEY_OUT'

export interface User {
  id: string
  email: string
  name: string
}

export interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  postcode?: string | null
  country?: string | null
  createdAt: string
  invoices?: unknown[]
  _count?: { invoices: number }
}

export interface LineItem {
  id?: string
  invoiceId?: string
  productId?: string | null
  sku: string
  description: string
  quantity: number
  unitPrice: string | number
  lineTotal: string | number
}

export interface Invoice {
  id: string
  crn: string
  invoiceNumber: string
  issueDate: string
  dueDate?: string | null
  status: InvoiceStatus
  customerId: string
  customer: Customer
  lineItems: LineItem[]
  subtotal: string | number
  tax: string | number
  grandTotal: string | number
  createdAt: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string | null
  unitPrice: string | number
  stockCartons: number
  createdAt: string
}

export interface ShipmentItem {
  id: string
  shipmentId: string
  productId: string
  product: Product
  quantityCartons: number
}

export interface Shipment {
  id: string
  shipmentNumber: string
  receivedDate: string
  items: ShipmentItem[]
  createdAt: string
}

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  category?: string | null
  amount: string | number
  date: string
  createdAt: string
}

export interface BillItem {
  id?: string
  billId?: string
  description: string
  quantity: number
  unitPrice: string | number
  lineTotal: string | number
}

// Bills reuse the invoice status vocabulary (Draft / Awaiting Payment / Paid / Overdue).
export interface Bill {
  id: string
  billNumber: string
  supplierName: string
  issueDate: string
  dueDate?: string | null
  status: InvoiceStatus
  category?: string | null
  items: BillItem[]
  subtotal: string | number
  tax: string | number
  grandTotal: string | number
  createdAt: string
}

export interface CashflowPoint {
  key: string
  label: string
  moneyIn: number
  moneyOut: number
}
