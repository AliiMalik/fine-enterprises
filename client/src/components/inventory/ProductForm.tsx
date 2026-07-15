import { useState } from 'react'
import { Field, Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ErrorNote } from '../ui/ErrorNote'
import { useCreateProduct } from '../../api/useProducts'

export function ProductForm({ onCreated }: { onCreated?: () => void }) {
  const createProduct = useCreateProduct()
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [stockCartons, setStockCartons] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!sku.trim() || !name.trim()) {
      return setError('SKU and name are required.')
    }
    setSubmitting(true)
    try {
      await createProduct.mutateAsync({
        sku,
        name,
        description,
        unitPrice: Number(unitPrice) || 0,
        stockCartons: Number(stockCartons) || 0,
      })
      setSku('')
      setName('')
      setDescription('')
      setUnitPrice('')
      setStockCartons('')
      onCreated?.()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to create product.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="SKU">
          <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="TEA-001" />
        </Field>
        <Field label="Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
          />
        </Field>
        <Field label="Description">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field label="Unit price (£)">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Opening stock (cartons)">
          <Input
            type="number"
            min={0}
            value={stockCartons}
            onChange={(e) => setStockCartons(e.target.value)}
            placeholder="0"
          />
        </Field>
      </div>
      <ErrorNote message={error} />
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Add Product'}
        </Button>
      </div>
    </form>
  )
}
