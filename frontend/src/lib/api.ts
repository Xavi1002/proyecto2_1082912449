import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

export const api = {
  get: (url: string) => apiClient.get(url),
  post: (url: string, data: any) => apiClient.post(url, data),
  put: (url: string, data: any) => apiClient.put(url, data),
  delete: (url: string) => apiClient.delete(url),
}

export default apiClient
