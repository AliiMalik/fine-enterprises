import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiErrorMessage } from './client'
import { toast } from '../components/ui/Toast'
import type { Shipment } from '../types'

export function useShipments() {
  return useQuery<Shipment[]>({
    queryKey: ['shipments'],
    queryFn: async () => {
      const res = await api.get<Shipment[]>('/shipments')
      return res.data
    },
  })
}

export function useCreateShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post<Shipment>('/shipments', data)
      return res.data
    },
    onSuccess: (shipment) => {
      qc.invalidateQueries({ queryKey: ['shipments'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      const cartons = shipment.items.reduce((sum, it) => sum + it.quantityCartons, 0)
      toast.success(
        `Shipment ${shipment.shipmentNumber} received`,
        `Stock updated — +${cartons} cartons across ${shipment.items.length} products`,
      )
    },
    onError: (err) => toast.error('Could not record shipment', apiErrorMessage(err)),
  })
}
