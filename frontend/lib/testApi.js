import api from './api'

export const testApi = {
  // Test if backend is reachable
  ping: () => api.get('/test/ping'),
}
