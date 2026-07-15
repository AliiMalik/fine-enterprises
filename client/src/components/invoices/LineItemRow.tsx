import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Input, Select } from '../ui/Input'
import { formatCurrency } from '../../utils/format'
import { rowEnter } from '../layout/motion'
import type { Product } from '../../types'

export interface LineItemDraft {
  id?: string
  productId?: string | null
  sku: string
  description: string
  quantity: number
  unitPrice: number
}

export function LineItemRow({
  item,
  products,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number
  item: LineItemDraft
  products: Product[]
  onChange: (patch: Partial<LineItemDraft>) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
  const picked = item.productId ? products.find((p) => p.id === item.productId) : null
  const overStock = picked ? Number(item.quantity) > picked.stockCartons : false

  function selectProduct(value: string) {
    if (!value) {
      onChange({ productId: null })
      return
    }
    const p = products.find((x) => x.id === value)
    if (p) {
      // Picking a product fills the line and links it so issuing draws down stock.
      onChange({ productId: p.id, sku: p.sku, description: p.name, unitPrice: Number(p.unitPrice) })
    }
  }

  return (
    <motion.tr layout variants={rowEnter()} initial="initial" animate="animate" exit="exit" className="align-top">
      <td className="px-2 py-2">
        <Select aria-label="Product" value={item.productId ?? ''} onChange={(e) => selectProduct(e.target.value)}>
          <option value="">Custom item…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name}
            </option>
          ))}
        </Select>
        {!item.productId && (
          <Input
            aria-label="SKU"
            value={item.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
            placeholder="SKU"
            className="mt-2"
          />
        )}
        {picked && (
          <div className={`mt-1 text-[11px] ${overStock ? 'font-semibold text-red-500' : 'text-gray-400'}`}>
            {picked.stockCartons} in stock{overStock ? ' — not enough' : ''}
          </div>
        )}
      </td>
      <td className="px-2 py-2">
        <Input
          aria-label="Description"
          value={item.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Description"
        />
      </td>
      <td className="px-2 py-2">
        <Input
          type="number"
          min={1}
          aria-label="Quantity"
          value={item.quantity}
          onChange={(e) => onChange({ quantity: Number(e.target.value) })}
        />
      </td>
      <td className="px-2 py-2">
        <Input
          type="number"
          min={0}
          step="0.01"
          aria-label="Unit price"
          value={item.unitPrice}
          onChange={(e) => onChange({ unitPrice: Number(e.target.value) })}
        />
      </td>
      <td className="px-2 py-2 text-right align-middle font-medium text-gray-800 dark:text-gray-200">
        {formatCurrency(lineTotal)}
      </td>
      <td className="px-2 py-2 text-right align-middle">
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-950/40"
          aria-label="Remove line item"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </motion.tr>
  )
}
