import {
  ReactNode,
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

const normalizeUser = (payload: any): User => ({
  id: payload.id,
  name: payload.name,
  email: payload.email,
  role: typeof payload.role === 'string' ? payload.role : payload.role?.name || '',
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
  }, [])

  const getCurrentUser = useCallback(async () => {
    const storedToken = token || localStorage.getItem(STORAGE_KEY)

    if (!storedToken) {
      setUser(null)
      return
    }

    setAuthToken(storedToken)
    const response = await api.get('/auth/me')
    setUser(normalizeUser(response.data))
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
        setUser(normalizeUser(response.data))
      } catch (error) {
        console.error('Error restoring session:', error)
        localStorage.removeItem(STORAGE_KEY)
        setAuthToken(null)
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
