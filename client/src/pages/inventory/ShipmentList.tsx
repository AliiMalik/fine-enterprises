import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useShipments } from '../../api/useShipments'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TH, TD, EmptyRow } from '../../components/ui/Table'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { InventoryTabs } from '../../components/inventory/InventoryTabs'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { listContainer, listRow } from '../../components/layout/motion'
import { formatDate, formatNumber } from '../../utils/format'

export default function ShipmentList() {
  const navigate = useNavigate()
  const { data: shipments, isLoading } = useShipments()

  return (
    <PageWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-400">Track products and incoming stock.</p>
        </div>
        <Button onClick={() => navigate('/inventory/shipments/new')}>
          <Plus size={16} /> Add Shipment
        </Button>
      </div>

      <InventoryTabs />

      <Card padded={false}>
          <Table>
            <thead>
              <tr>
                <TH>Shipment No.</TH>
                <TH>Received Date</TH>
                <TH className="text-right">Items</TH>
                <TH className="text-right">Cartons</TH>
              </tr>
            </thead>
            <motion.tbody variants={listContainer()} initial="initial" animate="animate">
              {isLoading ? (
                <SkeletonRows rows={4} cols={4} />
              ) : !shipments || shipments.length === 0 ? (
                <EmptyRow colSpan={4}>No shipments yet.</EmptyRow>
              ) : (
                shipments.map((s) => (
                  <motion.tr key={s.id} variants={listRow()} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TD className="font-medium text-teal-700">{s.shipmentNumber}</TD>
                    <TD>{formatDate(s.receivedDate)}</TD>
                    <TD className="text-right">{s.items.length}</TD>
                    <TD className="text-right font-medium">
                      {formatNumber(
                        s.items.reduce((sum, it) => sum + it.quantityCartons, 0),
                      )}
                    </TD>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </Table>
      </Card>
    </PageWrapper>
  )
}
