import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiErrorMessage } from './client'
import { toast } from '../components/ui/Toast'
import type { Customer, Invoice } from '../types'

export interface CustomerDetail extends Customer {
  invoices: Invoice[]
  totalBilled: number
  outstanding: number
}

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.get<Customer[]>('/customers')
      return res.data
    },
  })
}

export function useCustomer(id: string | undefined) {
  return useQuery<CustomerDetail>({
    queryKey: ['customer', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get<CustomerDetail>(`/customers/${id}`)
      return res.data
    },
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Customer> & { id: string }) => {
      const res = await api.patch<Customer>(`/customers/${id}`, data)
      return res.data
    },
    onSuccess: (customer) => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customer', customer.id] })
      toast.success(`${customer.name} updated`)
    },
    onError: (err) => toast.error('Could not update customer', apiErrorMessage(err)),
  })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      const res = await api.post<Customer>('/customers', data)
      return res.data
    },
    onSuccess: (customer) => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success(`Customer ${customer.name} added`)
    },
    onError: (err) => toast.error('Could not add customer', apiErrorMessage(err)),
  })
}
