import axios from 'axios'

export const TOKEN_KEY = 'fe_token'
export const USER_KEY = 'fe_user'

/** Extract a human-readable message from an API/axios error for toasts. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { error?: string } | undefined)?.error ?? err.message ?? fallback
  }
  return err instanceof Error ? err.message : fallback
}

export const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)
