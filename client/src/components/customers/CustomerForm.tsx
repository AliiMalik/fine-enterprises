import { useState } from 'react'
import { Field, Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ErrorNote } from '../ui/ErrorNote'
import { useCreateCustomer, useUpdateCustomer } from '../../api/useCustomers'
import type { Customer } from '../../types'

type Draft = {
  name: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  postcode: string
  country: string
}

function toDraft(c?: Customer): Draft {
  return {
    name: c?.name ?? '',
    email: c?.email ?? '',
    phone: c?.phone ?? '',
    addressLine1: c?.addressLine1 ?? '',
    addressLine2: c?.addressLine2 ?? '',
    city: c?.city ?? '',
    postcode: c?.postcode ?? '',
    country: c?.country ?? 'United Kingdom',
  }
}

/** Create a new customer, or edit an existing one when `customer` is passed. */
export function CustomerForm({
  customer,
  onSaved,
}: {
  customer?: Customer
  onSaved?: (id: string) => void
}) {
  const create = useCreateCustomer()
  const update = useUpdateCustomer()
  const [draft, setDraft] = useState<Draft>(toDraft(customer))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const editing = !!customer
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!draft.name.trim()) return setError('Customer name is required.')
    setSubmitting(true)
    try {
      const saved = editing
        ? await update.mutateAsync({ id: customer!.id, ...draft })
        : await create.mutateAsync(draft)
      if (!editing) setDraft(toDraft())
      onSaved?.(saved.id)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to save customer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" className="sm:col-span-2">
          <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Customer name" />
        </Field>
        <Field label="Email">
          <Input type="email" value={draft.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={draft.phone} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="Address Line 1" className="sm:col-span-2">
          <Input value={draft.addressLine1} onChange={(e) => set({ addressLine1: e.target.value })} />
        </Field>
        <Field label="Address Line 2" className="sm:col-span-2">
          <Input value={draft.addressLine2} onChange={(e) => set({ addressLine2: e.target.value })} />
        </Field>
        <Field label="City">
          <Input value={draft.city} onChange={(e) => set({ city: e.target.value })} />
        </Field>
        <Field label="Postcode">
          <Input value={draft.postcode} onChange={(e) => set({ postcode: e.target.value })} />
        </Field>
        <Field label="Country" className="sm:col-span-2">
          <Input value={draft.country} onChange={(e) => set({ country: e.target.value })} />
        </Field>
      </div>
      <ErrorNote message={error} />
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add Customer'}
        </Button>
      </div>
    </form>
  )
}
