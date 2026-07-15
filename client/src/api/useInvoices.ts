import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { toast } from '../components/ui/Toast'
import { apiErrorMessage } from './client'
import type { Invoice, InvoiceStatus } from '../types'

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get<Invoice[]>('/invoices')
      return res.data
    },
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery<Invoice>({
    queryKey: ['invoice', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get<Invoice>(`/invoices/${id}`)
      return res.data
    },
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post<Invoice>('/invoices', data)
      return res.data
    },
    onSuccess: (invoice) => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`Invoice ${invoice.invoiceNumber} created`, `Billed to ${invoice.customer.name}`)
    },
    onError: (err) => toast.error('Could not create invoice', apiErrorMessage(err)),
  })
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) => {
      const res = await api.patch<Invoice>(`/invoices/${id}/status`, { status })
      return res.data
    },
    // Marking an invoice Paid posts a MONEY_IN transaction server-side, so
    // refresh Accounts + cashflow + dashboard alongside invoices.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoice'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['cashflow'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err) => toast.error('Could not update status', apiErrorMessage(err)),
  })
}
