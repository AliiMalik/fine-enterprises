import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import type { Invoice } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'

const TEAL = '#0F766E'

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: TEAL,
    paddingBottom: 12,
    marginBottom: 20,
  },
  brand: { fontSize: 18, fontWeight: 700, color: TEAL },
  brandSub: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  invoiceTitle: { fontSize: 22, fontWeight: 700, color: '#111827' },
  invoiceLabel: { fontSize: 9, color: '#6b7280' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  metaBox: { width: '48%' },
  metaHeading: { fontSize: 9, color: '#6b7280', marginBottom: 2 },
  metaValue: { fontSize: 11, fontWeight: 700, color: '#111827' },
  billTo: { fontSize: 11, fontWeight: 700, color: TEAL, marginBottom: 4 },
  line: { fontSize: 10, color: '#374151', marginBottom: 1 },
  table: { marginTop: 10 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#f0fdfa',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccfbf1',
    paddingVertical: 6,
  },
  th: { fontSize: 9, fontWeight: 700, color: TEAL, textTransform: 'uppercase' },
  tr: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  td: { fontSize: 10, color: '#374151' },
  colSku: { width: '16%' },
  colDesc: { width: '44%' },
  colQty: { width: '12%' },
  colPrice: { width: '14%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right' },
  totalsBox: { marginTop: 16, alignSelf: 'flex-end', width: 220 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: TEAL,
  },
  grandLabel: { fontSize: 12, fontWeight: 700, color: TEAL },
  grandValue: { fontSize: 12, fontWeight: 700, color: TEAL },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
})

function InvoiceDoc({ invoice }: { invoice: Invoice }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Fine Enterprises Ltd</Text>
            <Text style={styles.brandSub}>Lightweight business management</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={[styles.invoiceLabel, { marginTop: 4 }]}>
              {invoice.invoiceNumber}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaHeading}>BILL TO</Text>
            <Text style={styles.billTo}>{invoice.customer.name}</Text>
            {invoice.customer.addressLine1 && (
              <Text style={styles.line}>{invoice.customer.addressLine1}</Text>
            )}
            {invoice.customer.addressLine2 && (
              <Text style={styles.line}>{invoice.customer.addressLine2}</Text>
            )}
            {(invoice.customer.city || invoice.customer.postcode) && (
              <Text style={styles.line}>
                {[invoice.customer.city, invoice.customer.postcode]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            )}
            {invoice.customer.country && (
              <Text style={styles.line}>{invoice.customer.country}</Text>
            )}
            {invoice.customer.email && (
              <Text style={styles.line}>{invoice.customer.email}</Text>
            )}
            {invoice.customer.phone && (
              <Text style={styles.line}>{invoice.customer.phone}</Text>
            )}
          </View>
          <View style={[styles.metaBox, { alignItems: 'flex-end' }]}>
            <Text style={styles.metaHeading}>ISSUE DATE</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
            <Text style={[styles.metaHeading, { marginTop: 8 }]}>DUE DATE</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
            <Text style={[styles.metaHeading, { marginTop: 8 }]}>CRN</Text>
            <Text style={styles.metaValue}>{invoice.crn}</Text>
            <Text style={[styles.metaHeading, { marginTop: 8 }]}>STATUS</Text>
            <Text style={styles.metaValue}>{invoice.status}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colSku]}>SKU</Text>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.th, styles.colTotal]}>Total</Text>
          </View>
          {invoice.lineItems.map((li) => (
            <View style={styles.tr} key={li.id ?? li.sku}>
              <Text style={[styles.td, styles.colSku]}>{li.sku}</Text>
              <Text style={[styles.td, styles.colDesc]}>{li.description}</Text>
              <Text style={[styles.td, styles.colQty]}>{li.quantity}</Text>
              <Text style={[styles.td, styles.colPrice]}>{formatCurrency(li.unitPrice)}</Text>
              <Text style={[styles.td, styles.colTotal]}>{formatCurrency(li.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.td}>Subtotal</Text>
            <Text style={styles.td}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.td}>Tax</Text>
            <Text style={styles.td}>{formatCurrency(invoice.tax)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={styles.grandValue}>{formatCurrency(invoice.grandTotal)}</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Fine Enterprises Ltd · Thank you for your business · Generated from Fine Enterprises
          business management tool
        </Text>
      </Page>
    </Document>
  )
}

export function InvoicePDFButton({ invoice }: { invoice: Invoice }) {
  return (
    <PDFDownloadLink
      document={<InvoiceDoc invoice={invoice} />}
      fileName={`${invoice.invoiceNumber}.pdf`}
      className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
    >
      {({ loading }) => (
        <>
          <Download size={16} />
          {loading ? 'Preparing PDF…' : 'Export PDF'}
        </>
      )}
    </PDFDownloadLink>
  )
}
