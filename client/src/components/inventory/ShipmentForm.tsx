import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { Field, Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { ErrorNote } from '../ui/ErrorNote'
import { useProducts } from '../../api/useProducts'
import { useShipments, useCreateShipment } from '../../api/useShipments'
import { toInputDate } from '../../utils/format'
import { rowEnter } from '../layout/motion'

interface ShipmentItemDraft {
  id?: string
  productId: string
  quantityCartons: number
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `si_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export function ShipmentForm({ onCreated }: { onCreated?: () => void }) {
  const { data: products } = useProducts()
  const createShipment = useCreateShipment()
  const { refetch } = useShipments()

  const [shipmentNumber, setShipmentNumber] = useState('')
  const [receivedDate, setReceivedDate] = useState(toInputDate(new Date()))
  const [items, setItems] = useState<ShipmentItemDraft[]>([
    { id: uid(), productId: '', quantityCartons: 1 },
  ])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updateItem(index: number, patch: Partial<ShipmentItemDraft>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  function addItem() {
    setItems((prev) => [...prev, { id: uid(), productId: '', quantityCartons: 1 }])
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const valid = items.filter((it) => it.productId && it.quantityCartons > 0)
    if (valid.length === 0) {
      return setError('Add at least one item with a product and quantity.')
    }

    setSubmitting(true)
    try {
      await createShipment.mutateAsync({
        shipmentNumber: shipmentNumber || undefined,
        receivedDate,
        items: valid,
      })
      await refetch()
      setShipmentNumber('')
      setItems([{ productId: '', quantityCartons: 1 }])
      onCreated?.()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to create shipment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Shipment No." hint="Auto-generated if left blank">
          <Input
            value={shipmentNumber}
            onChange={(e) => setShipmentNumber(e.target.value)}
            placeholder="SHIP-0003"
          />
        </Field>
        <Field label="Received Date">
          <Input
            type="date"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
          />
        </Field>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">Items</div>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                variants={rowEnter()}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-end gap-2"
              >
                <div className="flex-1">
                  <Select
                    value={item.productId}
                    onChange={(e) => updateItem(i, { productId: e.target.value })}
                  >
                    <option value="">Select product…</option>
                    {(products ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantityCartons}
                    onChange={(e) => updateItem(i, { quantityCartons: Number(e.target.value) })}
                    placeholder="Cartons"
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  whileTap={{ scale: 0.9 }}
                  className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:underline"
        >
          <Plus size={14} /> Add item
        </button>
      </div>

      <ErrorNote message={error} />

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Create Shipment'}
        </Button>
      </div>
    </form>
  )
}
