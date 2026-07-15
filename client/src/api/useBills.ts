import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiErrorMessage } from './client'
import { toast } from '../components/ui/Toast'
import type { Bill, InvoiceStatus } from '../types'

export function useBills() {
  return useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      const res = await api.get<Bill[]>('/bills')
      return res.data
    },
  })
}

export function useBill(id: string | undefined) {
  return useQuery<Bill>({
    queryKey: ['bill', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get<Bill>(`/bills/${id}`)
      return res.data
    },
  })
}

export function useCreateBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post<Bill>('/bills', data)
      return res.data
    },
    onSuccess: (bill) => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`Bill ${bill.billNumber} created`, `From ${bill.supplierName}`)
    },
    onError: (err) => toast.error('Could not create bill', apiErrorMessage(err)),
  })
}

export function useUpdateBillStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) => {
      const res = await api.patch<Bill>(`/bills/${id}/status`, { status })
      return res.data
    },
    // Paying a bill posts a MONEY_OUT transaction, so refresh Accounts + cashflow.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['bill'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['cashflow'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err) => toast.error('Could not update bill', apiErrorMessage(err)),
  })
}
