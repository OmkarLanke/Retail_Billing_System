'use client'

import { useState, useEffect, useRef } from 'react'
import api from '../lib/api'
import AddPartyModal from './AddPartyModal'

export default function PartySelector({ onPartySelect, selectedParty, phoneNo, onPhoneChange }) {
  const [parties, setParties] = useState([])
  const [filteredParties, setFilteredParties] = useState([])
  const [partyBalances, setPartyBalances] = useState({}) // Store real-time balances
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddPartyModal, setShowAddPartyModal] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch parties on component mount (with authentication check)
  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (token) {
      fetchParties()
    } else {
      console.log('PartySelector: No token found, skipping API calls')
    }
  }, [])

  // Filter parties based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredParties(parties)
    } else {
      const filtered = parties.filter(party => 
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (party.phone && party.phone.includes(searchTerm))
      )
      setFilteredParties(filtered)
    }
  }, [searchTerm, parties])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch real-time balance for a specific party
  const fetchPartyBalance = async (partyId) => {
    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.log('PartySelector: No token for fetchPartyBalance, skipping')
        return null
      }
      const response = await api.get(`/parties/${partyId}/balance`)
      return response.data
    } catch (error) {
      console.error('Error fetching party balance:', error)
      return null
    }
  }

  // Fetch real-time balances for all parties
  const fetchAllPartyBalances = async (partyList) => {
    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.log('PartySelector: No token for fetchAllPartyBalances, skipping')
        return
      }

      const balancePromises = partyList.map(party => 
        fetchPartyBalance(party.id).then(balance => ({ partyId: party.id, balance }))
      )
      
      const balanceResults = await Promise.all(balancePromises)
      const balanceMap = {}
      
      balanceResults.forEach(result => {
        if (result.balance !== null) {
          balanceMap[result.partyId] = result.balance
        }
      })
      
      setPartyBalances(balanceMap)
    } catch (error) {
      console.error('Error fetching party balances:', error)
    }
  }

  const fetchParties = async () => {
    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.log('PartySelector: No token for fetchParties, skipping')
        return
      }
      setIsLoading(true)
      const response = await api.get('/parties')
      setParties(response.data)
      setFilteredParties(response.data)
      
      // Fetch real-time balances for all parties
      await fetchAllPartyBalances(response.data)
    } catch (error) {
      console.error('Error fetching parties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(true)
  }

  const handleFocus = () => {
    setIsOpen(true)
    // Refresh balances when dropdown opens to get most current data
    if (parties.length > 0) {
      fetchAllPartyBalances(parties)
    }
  }

  const handlePartySelect = (party) => {
    setSearchTerm(party.name)
    onPartySelect(party)
    onPhoneChange(party.phone || '')
    setIsOpen(false)
  }

  const handleAddParty = () => {
    setShowAddPartyModal(true)
  }

  const handleAddPartySubmit = async (partyData) => {
    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.log('PartySelector: No token for handleAddPartySubmit, skipping')
        throw new Error('No authentication token')
      }
      
      // Map form data to API format
      const requestData = {
        name: partyData.name.trim(),
        phone: partyData.phone || '',
        email: partyData.email || '',
        address: partyData.address || '',
        gstNumber: partyData.gstNumber || '',
        partyType: partyData.partyType || 'CUSTOMER',
        openingBalance: partyData.openingBalance ? parseFloat(partyData.openingBalance) : 0,
        balanceType: partyData.balanceType || 'DEBIT'
      }

      // Make API call to add party
      const response = await api.post('/parties', requestData)
      
      if (response.status === 200) {
        // Refresh the parties list
        await fetchParties()
        setShowAddPartyModal(false)
        
        // Auto-select the newly added party and fetch its balance
        const newParty = response.data
        if (newParty) {
          // Fetch balance for the new party
          const balance = await fetchPartyBalance(newParty.id)
          if (balance !== null) {
            setPartyBalances(prev => ({ ...prev, [newParty.id]: balance }))
          }
          handlePartySelect(newParty)
        }
      }
    } catch (error) {
      console.error('Error adding party:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      
      let errorMessage = 'Unknown error occurred'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        } else {
          errorMessage = JSON.stringify(error.response.data)
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert('Failed to add party: ' + errorMessage)
    }
  }

  const getBalanceDisplay = (party) => {
    // Use real-time balance if available, otherwise fall back to current balance from party data
    const balance = partyBalances[party.id] !== undefined ? partyBalances[party.id] : party.currentBalance || 0
    
    // Use balanceType from party data to determine color (same logic as parties page)
    const balanceType = party.balanceType
    const isAmountToPay = balanceType === 'TO_PAY'
    const isAmountToReceive = balanceType === 'TO_RECEIVE'
    
    // Format balance amount
    const formattedBalance = Math.abs(balance).toFixed(2)
    
    if (balance === 0 || (!isAmountToPay && !isAmountToReceive)) {
      return <span className="text-gray-600 font-medium">0.00</span>
    }
    
    return (
      <div className="flex items-center space-x-1">
        <span className={`font-medium ${isAmountToPay ? 'text-red-600' : 'text-green-600'}`}>
          {formattedBalance}
        </span>
        <svg className={`w-4 h-4 ${isAmountToPay ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAmountToPay ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search by Name/Phone"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Add Party Option */}
          <button
            onClick={handleAddParty}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 flex items-center space-x-3"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-blue-600 font-medium">Add Party</span>
          </button>

          {/* Party Balance Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Party Balance</span>
            </div>
          </div>

          {/* Parties List */}
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              Loading parties...
            </div>
          ) : filteredParties.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              No parties found
            </div>
          ) : (
            filteredParties.map((party) => (
              <button
                key={party.id}
                onClick={() => handlePartySelect(party)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{party.name}</div>
                    {party.phone && (
                      <div className="text-sm text-gray-500 mt-1">{party.phone}</div>
                    )}
                  </div>
                  <div className="ml-4">
                    {getBalanceDisplay(party)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Add Party Modal */}
      {showAddPartyModal && (
        <AddPartyModal
          onClose={() => setShowAddPartyModal(false)}
          onSubmit={handleAddPartySubmit}
        />
      )}
    </div>
  )
}
