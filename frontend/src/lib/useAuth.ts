import { useEffect, useState, useCallback } from 'react'
import { api } from './api'

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

const STORAGE_KEY = 'auth_token'

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar token del localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY)
    if (storedToken) {
      setToken(storedToken)
      // Configurar header por defecto en axios
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setIsLoading(false)
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string, role = 'Cliente') => {
      try {
        setIsLoading(true)
        const response = await api.post('/auth/register', {
          name,
          email,
          password,
          role,
        })
        const { token: newToken, user: userData } = response.data
        setToken(newToken)
        setUser(userData)
        localStorage.setItem(STORAGE_KEY, newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Error al registrar')
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/login', { email, password })
      const { token: newToken, user: userData } = response.data
      setToken(newToken)
      setUser(userData)
      localStorage.setItem(STORAGE_KEY, newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    delete api.defaults.headers.common['Authorization']
  }, [])

  const getCurrentUser = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching current user:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }, [token, logout])

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    getCurrentUser,
  }
}
