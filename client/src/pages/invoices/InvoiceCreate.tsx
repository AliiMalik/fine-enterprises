import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { InvoiceForm } from '../../components/invoices/InvoiceForm'
import { PageWrapper } from '../../components/layout/PageWrapper'

export default function InvoiceCreate() {
  const navigate = useNavigate()

  return (
    <PageWrapper className="space-y-6">
      <button
        onClick={() => navigate('/invoices')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Back to invoices
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Invoice</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">Fill in the details below and save as draft or sent.</p>
      </div>

      <InvoiceForm onSaved={(id) => navigate(`/invoices/${id}`)} />
    </PageWrapper>
  )
}
