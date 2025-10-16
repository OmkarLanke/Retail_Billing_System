import api from './api'

export const partiesApi = {
  // Get all parties
  getAllParties: () => api.get('/parties'),
  
  // Search parties
  searchParties: (searchTerm) => api.get(`/parties/search?q=${encodeURIComponent(searchTerm)}`),
  
  // Get party by ID with transactions
  getPartyById: (id) => api.get(`/parties/${id}`),
  
  // Create new party
  createParty: (partyData) => api.post('/parties', partyData),
  
  // Update party
  updateParty: (id, partyData) => api.put(`/parties/${id}`, partyData),
  
  // Delete party
  deleteParty: (id) => api.delete(`/parties/${id}`),
  
  // Get party balance
  getPartyBalance: (id) => api.get(`/parties/${id}/balance`)
}
