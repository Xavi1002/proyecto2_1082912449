import {
  ReactNode,
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import api, { setAuthToken } from './api'

export interface User {
  id: number
  name: string
  email: string
  role: string
  mustChangePassword?: boolean
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  getCurrentUser: () => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'auth_token'
const AuthContext = createContext<AuthContextType | undefined>(undefined)

const setRoleCookie = (role: string | null) => {
  if (typeof document === 'undefined') return

  if (!role) {
    document.cookie = 'auth_role=; path=/; max-age=0; SameSite=Lax'
    return
  }

  document.cookie = `auth_role=${encodeURIComponent(role)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

const normalizeUser = (payload: any): User => ({
  id: payload.id,
  name: payload.name,
  email: payload.email,
  role: typeof payload.role === 'string' ? payload.role : payload.role?.name || '',
  mustChangePassword: Boolean(payload.mustChangePassword),
})

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
    setRoleCookie(null)
  }, [])

  const getCurrentUser = useCallback(async () => {
    const storedToken = token || localStorage.getItem(STORAGE_KEY)

    if (!storedToken) {
      setUser(null)
      return
    }

    setAuthToken(storedToken)
    const response = await api.get('/auth/me')
    const normalized = normalizeUser(response.data)
    setUser(normalized)
    setRoleCookie(normalized.role)
  }, [token])

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEY)

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        setToken(storedToken)
        setAuthToken(storedToken)
        const response = await api.get('/auth/me')
        const normalized = normalizeUser(response.data)
        setUser(normalized)
        setRoleCookie(normalized.role)
      } catch (error) {
        console.error('Error restoring session:', error)
        localStorage.removeItem(STORAGE_KEY)
        setAuthToken(null)
        setToken(null)
        setUser(null)
        setRoleCookie(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleSessionExpired = () => {
      logout()
      setIsLoading(false)
    }

    window.addEventListener('hm:auth-expired', handleSessionExpired)

    return () => {
      window.removeEventListener('hm:auth-expired', handleSessionExpired)
    }
  }, [logout])

  const register = useCallback(
    async (name: string, email: string, password: string, role = 'Cliente') => {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      })

      const newToken = response.data.token as string
      const userData = normalizeUser(response.data.user)

      setToken(newToken)
      setUser(userData)
      localStorage.setItem(STORAGE_KEY, newToken)
      setAuthToken(newToken)
      setRoleCookie(userData.role)
    },
    []
  )

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const newToken = response.data.token as string
    const userData = normalizeUser(response.data.user)

    setToken(newToken)
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, newToken)
    setAuthToken(newToken)
    setRoleCookie(userData.role)
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token,
      register,
      login,
      logout,
      getCurrentUser,
    }),
    [getCurrentUser, isLoading, login, logout, register, token, user]
  )

  return createElement(AuthContext.Provider, { value }, children)
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
