import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../../utils/format'
import type { CashflowPoint } from '../../types'

export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  const chartData = data.map((d) => ({
    label: d.label,
    'Money In': d.moneyIn,
    'Money Out': d.moneyOut,
  }))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} className="dark:stroke-white/10" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} className="dark:[&_text]:fill-gray-400" />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            className="dark:[&_text]:fill-gray-400"
            tickFormatter={(v) => `£${v}`}
          />
          <Tooltip
            formatter={(value: any) => formatCurrency(value)}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
              background: '#ffffff',
              color: '#111827',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Money In" fill="#0F766E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Money Out" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
