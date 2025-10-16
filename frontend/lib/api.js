import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    console.log('API Interceptor: Request to', config.url)
    console.log('API Interceptor: Token exists:', token ? 'Yes' : 'No')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('API Interceptor: Authorization header set')
    } else {
      console.log('API Interceptor: No token found, request will be sent without auth')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data)
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - not clearing token automatically, let components handle it')
      // Don't automatically clear token - let components handle authentication errors
      // This prevents cascading authentication failures
    }
    return Promise.reject(error)
  }
)

export default api
