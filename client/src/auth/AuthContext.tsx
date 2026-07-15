import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, TOKEN_KEY, USER_KEY } from '../api/client'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser) as User)
      } catch {
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
