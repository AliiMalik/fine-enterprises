import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BillForm } from '../../components/bills/BillForm'
import { PageWrapper } from '../../components/layout/PageWrapper'

export default function BillCreate() {
  const navigate = useNavigate()
  return (
    <PageWrapper className="space-y-6">
      <button
        onClick={() => navigate('/bills')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Back to bills
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Bill</h1>
        <p className="text-sm text-gray-400">Record a supplier bill or expense.</p>
      </div>
      <BillForm onSaved={(id) => navigate(`/bills/${id}`)} />
    </PageWrapper>
  )
}
