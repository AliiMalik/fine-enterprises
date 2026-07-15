import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { ShipmentForm } from '../../components/inventory/ShipmentForm'
import { InventoryTabs } from '../../components/inventory/InventoryTabs'
import { PageWrapper } from '../../components/layout/PageWrapper'

export default function ShipmentCreate() {
  const navigate = useNavigate()

  return (
    <PageWrapper className="space-y-6">
      <button
        onClick={() => navigate('/inventory/shipments')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Back to shipments
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Shipment</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Receiving stock will automatically increase the matching product stock.
        </p>
      </div>

      <InventoryTabs />

      <Card title="Add Shipment">
        <ShipmentForm onCreated={() => navigate('/inventory/shipments')} />
      </Card>
    </PageWrapper>
  )
}
