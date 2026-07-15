import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, AlertCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { PageWrapper } from '../components/layout/PageWrapper'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@fineenterprises.com')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 dark:bg-gray-950">
      <PageWrapper className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-white">
            <Package size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fine Enterprises Ltd</h1>
          <p className="text-sm text-gray-400">Sign in to your workspace</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </Field>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-gray-400">
          Demo login: admin@fineenterprises.com / demo1234
        </p>
      </PageWrapper>
    </div>
  )
}
