import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiErrorMessage } from './client'
import { toast } from '../components/ui/Toast'
import type { CashflowPoint, Transaction } from '../types'

export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get<Transaction[]>('/transactions')
      return res.data
    },
  })
}

export function useCashflowSummary() {
  return useQuery<CashflowPoint[]>({
    queryKey: ['cashflow'],
    queryFn: async () => {
      const res = await api.get<CashflowPoint[]>('/transactions/summary')
      return res.data
    },
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Transaction>) => {
      const res = await api.post<Transaction>('/transactions', data)
      return res.data
    },
    onSuccess: (tx) => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['cashflow'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(
        tx.type === 'MONEY_IN' ? 'Money in recorded' : 'Money out recorded',
        tx.description,
      )
    },
    onError: (err) => toast.error('Could not record transaction', apiErrorMessage(err)),
  })
}
