import { useState } from 'react'
import { Field, Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { ErrorNote } from '../ui/ErrorNote'
import { useCreateTransaction } from '../../api/useTransactions'
import { toInputDate } from '../../utils/format'
import type { TransactionType } from '../../types'

export function TransactionForm({ onCreated }: { onCreated?: () => void }) {
  const createTransaction = useCreateTransaction()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('MONEY_IN')
  const [date, setDate] = useState(toInputDate(new Date()))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const amt = Number(amount)
    if (!description.trim()) return setError('Description is required.')
    if (!Number.isFinite(amt) || amt <= 0) return setError('Enter an amount greater than zero.')

    setSubmitting(true)
    try {
      await createTransaction.mutateAsync({ description, amount: amt, type, date })
      setDescription('')
      setAmount('')
      setType('MONEY_IN')
      setDate(toInputDate(new Date()))
      onCreated?.()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to add transaction.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Description">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Client payment"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Amount">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <Field label="Type">
        <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
          <option value="MONEY_IN">Money In</option>
          <option value="MONEY_OUT">Money Out</option>
        </Select>
      </Field>
      <ErrorNote message={error} />
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  )
}
