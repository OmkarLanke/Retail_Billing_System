import api from './api'

export const authService = {
  // Register with email/password
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify({
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

  // Login with email/password
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          role: response.data.role,
          businessName: response.data.businessName
        }))
      }
      return response.data
    } catch (error) {
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
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify({
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
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify({
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Get current user from localStorage
  getCurrentUserFromStorage: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}
