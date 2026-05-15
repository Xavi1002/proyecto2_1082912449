import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

type ToastEventDetail = {
  message: string
  tone?: 'info' | 'success' | 'warning' | 'error'
}

const apiWithFlags = api as typeof api & { __hmInterceptorsInstalled?: boolean }

const emitToast = (detail: ToastEventDetail) => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent<ToastEventDetail>('hm:toast', { detail }))
}

const handleAuthExpiry = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event('hm:auth-expired'))
  window.dispatchEvent(
    new CustomEvent<ToastEventDetail>('hm:toast', {
      detail: { message: 'Tu sesión expiró. Vuelve a iniciar sesión.', tone: 'warning' },
    })
  )

  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

if (typeof window !== 'undefined' && !apiWithFlags.__hmInterceptorsInstalled) {
  apiWithFlags.__hmInterceptorsInstalled = true

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      const requestUrl = String(error?.config?.url || '')

      if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
        handleAuthExpiry()
      } else if (status === 500) {
        emitToast({ message: 'Ocurrió un error interno. Intenta de nuevo.', tone: 'error' })
      }

      return Promise.reject(error)
    }
  )
}

export default api
export { api }
