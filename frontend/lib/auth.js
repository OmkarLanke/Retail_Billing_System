import api from './api'
import axios from 'axios'

export const authService = {
  // Register with email/password
  register: async (userData) => {
    try {
      console.log('Attempting registration with data:', userData)
      const response = await axios.post('http://localhost:8080/api/auth/register', userData)
      console.log('Registration response:', response.data)
      if (response.data.success) {
        sessionStorage.setItem('token', response.data.token)
        sessionStorage.setItem('user', JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          role: response.data.role,
          businessName: response.data.businessName
        }))
      }
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      console.error('Error response:', error.response?.data)
      throw error.response?.data || { success: false, message: 'Registration failed' }
    }
  },

  // Login with email/password
  login: async (credentials) => {
    try {
      console.log('Attempting login with credentials:', credentials)
      const response = await axios.post('http://localhost:8080/api/auth/login', credentials)
      console.log('Login response:', response.data)
      if (response.data.success) {
        sessionStorage.setItem('token', response.data.token)
        sessionStorage.setItem('user', JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          role: response.data.role,
          businessName: response.data.businessName
        }))
      }
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      throw error.response?.data || { success: false, message: 'Login failed' }
    }
  },

  // Send OTP
  sendOtp: async (phone) => {
    try {
      const response = await api.post('/auth/send-otp', { phone })
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to send OTP' }
    }
  },

  // Verify OTP
  verifyOtp: async (phone, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp })
      if (response.data.success && response.data.token) {
        sessionStorage.setItem('token', response.data.token)
        sessionStorage.setItem('user', JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          role: response.data.role,
          businessName: response.data.businessName
        }))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'OTP verification failed' }
    }
  },

  // Register with OTP
  registerWithOtp: async (userData) => {
    try {
      const response = await api.post('/auth/register-with-otp', userData)
      if (response.data.success) {
        sessionStorage.setItem('token', response.data.token)
        sessionStorage.setItem('user', JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          role: response.data.role,
          businessName: response.data.businessName
        }))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Registration failed' }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get user' }
    }
  },

  // Logout
  logout: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!sessionStorage.getItem('token')
  },

  // Get current user from sessionStorage
  getCurrentUserFromStorage: () => {
    const user = sessionStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Get token from sessionStorage
  getToken: () => {
    return sessionStorage.getItem('token')
  },

  // Check if token is expired
  isTokenExpired: () => {
    const token = sessionStorage.getItem('token')
    if (!token) return true

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      console.error('Error checking token expiration:', error)
      return true // Consider expired if we can't parse it
    }
  },

  // Enhanced authentication check that also validates token expiration
  isValidAuthenticated: () => {
    const hasToken = !!sessionStorage.getItem('token')
    const isNotExpired = !authService.isTokenExpired()
    const result = hasToken && isNotExpired
    console.log('Auth validation:', { hasToken, isNotExpired, result })
    return result
  },

  // Force logout and clear all auth data
  forceLogout: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    console.log('Forced logout - cleared all auth data')
  }
}
