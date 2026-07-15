import { useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { useTransactions, useCashflowSummary } from '../../api/useTransactions'
import { Card } from '../../components/ui/Card'
import { Table, TH, TD, EmptyRow, TypeBadge } from '../../components/ui/Table'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { FlashOnChange } from '../../components/ui/FlashOnChange'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { TransactionForm } from '../../components/accounts/TransactionForm'
import { CashflowChart } from '../../components/accounts/CashflowChart'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { formatCurrency, formatDate } from '../../utils/format'

export default function Ledger() {
  const { data: transactions, isLoading } = useTransactions()
  const { data: cashflow } = useCashflowSummary()

  const { balance, totalIn, totalOut } = useMemo(() => {
    const list = transactions ?? []
    let b = 0
    let tin = 0
    let tout = 0
    for (const t of list) {
      const amt = Number(t.amount)
      if (t.type === 'MONEY_IN') {
        b += amt
        tin += amt
      } else {
        b -= amt
        tout += amt
      }
    }
    return {
      balance: Math.round(b * 100) / 100,
      totalIn: Math.round(tin * 100) / 100,
      totalOut: Math.round(tout * 100) / 100,
    }
  }, [transactions])

  const positive = balance >= 0

  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
        <p className="text-sm text-gray-400">Ledger, running balance and cashflow.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <Wallet size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Running Balance</div>
              <FlashOnChange
                value={balance}
                className={`text-2xl font-bold ${positive ? 'text-gray-900 dark:text-white' : 'text-red-700 dark:text-red-400'}`}
              >
                <AnimatedNumber value={balance} format={formatCurrency} />
              </FlashOnChange>
            </div>
          </div>
        </Card>
        <Card className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Money In</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedNumber value={totalIn} format={formatCurrency} />
              </div>
            </div>
          </div>
        </Card>
        <Card className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <TrendingDown size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Money Out</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedNumber value={totalOut} format={formatCurrency} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Ledger" padded={false}>
            <Table>
              <thead>
                <tr>
                  <TH>Date</TH>
                  <TH>Description</TH>
                  <TH>Type</TH>
                  <TH className="text-right">Amount</TH>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows rows={6} cols={4} />
                ) : !transactions || transactions.length === 0 ? (
                  <EmptyRow colSpan={4}>No transactions yet.</EmptyRow>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TD>{formatDate(t.date)}</TD>
                      <TD>{t.description}</TD>
                      <TD>
                        <TypeBadge type={t.type} />
                      </TD>
                      <TD
                        className={`text-right font-medium ${
                          t.type === 'MONEY_IN' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}
                      >
                        {t.type === 'MONEY_IN' ? '+' : '−'}
                        {formatCurrency(t.amount)}
                      </TD>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
        </Card>

        <Card title="Add Transaction">
          <TransactionForm />
        </Card>
      </div>

      <Card title="Cashflow — last 6 months">
        {cashflow ? <CashflowChart data={cashflow} /> : <div className="py-10 text-center text-gray-400">Loading chart…</div>}
      </Card>
    </PageWrapper>
  )
}
