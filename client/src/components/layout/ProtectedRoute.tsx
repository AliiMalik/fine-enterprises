import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../auth/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Loading…
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Loading…
      </div>
    )
  }

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
