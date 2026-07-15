import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useProducts } from '../../api/useProducts'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TH, TD, EmptyRow } from '../../components/ui/Table'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { InventoryTabs } from '../../components/inventory/InventoryTabs'
import { ProductForm } from '../../components/inventory/ProductForm'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { listContainer, listRow, expand, EASE_OUT_EXPO } from '../../components/layout/motion'
import { formatCurrency, formatNumber } from '../../utils/format'
import { LOW_STOCK_THRESHOLD } from '../../utils/status'

function stockBarColor(stock: number): string {
  if (stock < LOW_STOCK_THRESHOLD) return 'bg-red-500'
  if (stock < LOW_STOCK_THRESHOLD * 2) return 'bg-amber-500'
  return 'bg-teal-500'
}

export default function ProductList() {
  const { data: products, isLoading } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const maxStock = Math.max(1, ...(products ?? []).map((p) => p.stockCartons))

  return (
    <PageWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-400">Track products and incoming stock.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <InventoryTabs />

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            key="product-form"
            variants={expand()}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ overflow: 'hidden' }}
          >
            <Card title="Add Product">
              <ProductForm onCreated={() => setShowForm(false)} />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card padded={false}>
          <Table>
            <thead>
              <tr>
                <TH>SKU</TH>
                <TH>Name</TH>
                <TH>Description</TH>
                <TH className="text-right">Unit Price</TH>
                <TH className="text-right">Stock (cartons)</TH>
              </tr>
            </thead>
            <motion.tbody variants={listContainer()} initial="initial" animate="animate">
              {isLoading ? (
                <SkeletonRows rows={5} cols={5} />
              ) : !products || products.length === 0 ? (
                <EmptyRow colSpan={5}>No products yet. Add your first product.</EmptyRow>
              ) : (
                products.map((p) => (
                  <motion.tr key={p.id} variants={listRow()} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TD className="font-medium text-teal-700">{p.sku}</TD>
                    <TD>{p.name}</TD>
                    <TD className="text-gray-500">{p.description || '—'}</TD>
                    <TD className="text-right tabular-nums">{formatCurrency(p.unitPrice)}</TD>
                    <TD className="text-right">
                      <div className="ml-auto flex w-32 flex-col items-end gap-1.5">
                        <span className="font-medium tabular-nums">
                          <AnimatedNumber value={p.stockCartons} format={formatNumber} />
                          {p.stockCartons < LOW_STOCK_THRESHOLD && (
                            <span className="ml-1.5 text-[10px] font-semibold uppercase text-red-500">Low</span>
                          )}
                        </span>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <motion.div
                            className={`h-full ${stockBarColor(p.stockCartons)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (p.stockCartons / maxStock) * 100)}%` }}
                            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                          />
                        </div>
                      </div>
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
