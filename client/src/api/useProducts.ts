import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiErrorMessage } from './client'
import { toast } from '../components/ui/Toast'
import type { Product } from '../types'

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/products')
      return res.data
    },
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const res = await api.post<Product>('/products', data)
      return res.data
    },
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`Product ${product.sku} added`, product.name)
    },
    onError: (err) => toast.error('Could not add product', apiErrorMessage(err)),
  })
}
