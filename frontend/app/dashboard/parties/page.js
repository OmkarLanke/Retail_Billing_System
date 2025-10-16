'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../lib/auth'
import { partiesApi } from '../../../lib/partiesApi'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Sidebar from '../../../components/Sidebar'
import AddPartyModal from '../../../components/AddPartyModal'
import Header from '../../../components/Header'

export default function PartiesPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [parties, setParties] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddPartyModal, setShowAddPartyModal] = useState(false)
  const [selectedParty, setSelectedParty] = useState(null)
  const [selectedPartyDetails, setSelectedPartyDetails] = useState(null)
  const router = useRouter()

  useEffect(() => {
    console.log('Parties page loaded')
    const checkAuth = async () => {
      console.log('Checking authentication...')
      if (!authService.isAuthenticated()) {
        console.log('Not authenticated, redirecting to login')
        router.push('/auth/login')
        return
      }

      try {
        console.log('Getting user data...')
        const userData = authService.getCurrentUserFromStorage()
        setUser(userData)
        
        // Fetch parties from API
        console.log('Fetching parties from API...')
        const response = await partiesApi.getAllParties()
        console.log('Parties API response:', response.data)
        setParties(response.data)
        console.log('Parties fetched successfully')
      } catch (error) {
        console.error('Error getting user data or fetching parties:', error)
        if (error.response?.status === 401) {
          console.log('401 error - logging out and redirecting')
          authService.logout()
          router.push('/auth/login')
        } else {
          toast.error('Failed to load parties')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    authService.logout()
    toast.success('Logged out successfully')
    router.push('/auth/login')
  }

  const handleSearch = async (searchTerm) => {
    if (searchTerm.trim() === '') {
      // If search is empty, fetch all parties
      try {
        const response = await partiesApi.getAllParties()
        setParties(response.data)
      } catch (error) {
        console.error('Error fetching parties:', error)
        toast.error('Failed to fetch parties')
      }
    } else {
      // Search parties
      try {
        const response = await partiesApi.searchParties(searchTerm)
        setParties(response.data)
      } catch (error) {
        console.error('Error searching parties:', error)
        toast.error('Failed to search parties')
      }
    }
  }

  const handlePartySelect = async (party) => {
    setSelectedParty(party)
    try {
      const response = await partiesApi.getPartyById(party.id)
      setSelectedPartyDetails(response.data)
    } catch (error) {
      console.error('Error fetching party details:', error)
      toast.error('Failed to load party details')
    }
  }

  const filteredParties = parties.filter(party =>
    (party.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show empty state if no parties
  if (parties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-slate-800 text-white flex flex-col">
          {/* Top Section */}
          <div className="p-4 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white">GST App</h1>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Open Anything (Ctrl+F)"
                className="w-full bg-slate-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute right-3 top-2.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 space-y-2">
            <Link href="/dashboard" className="block">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
                <span className="text-lg">🏠</span>
                <span className="text-sm">Home</span>
              </div>
            </Link>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700 cursor-pointer">
              <span className="text-lg">👥</span>
              <span className="text-sm">Parties</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">📦</span>
              <span className="text-sm">Items</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">🧾</span>
              <span className="text-sm">Sale</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">🛒</span>
              <span className="text-sm">Purchase & Expense</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">📈</span>
              <span className="text-sm">Grow Your Business</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">🏦</span>
              <span className="text-sm">Cash & Bank</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">📊</span>
              <span className="text-sm">Reports</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">🔄</span>
              <span className="text-sm">Sync, Share & Backup</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">🔧</span>
              <span className="text-sm">Utilities</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">⚙️</span>
              <span className="text-sm">Settings</span>
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-slate-700 space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">🔍</span>
              <span className="text-sm">Plans & Pricing</span>
            </div>
            
            <div className="bg-red-600 rounded-lg p-3">
              <div className="text-sm font-medium">1 days Free Trial left</div>
              <div className="w-full bg-red-800 rounded-full h-2 mt-2">
                <div className="bg-white h-2 rounded-full" style={{width: '95%'}}></div>
              </div>
            </div>
            
            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-3 rounded-lg text-sm flex items-center justify-center">
              Get GST App Premium →
            </button>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer">
              <span className="text-lg">📱</span>
              <span className="text-sm">Mobile</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Company</span>
                <span className="text-sm text-gray-500">Help</span>
                <span className="text-sm text-gray-500">Shortcuts</span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Customer Support: <span className="font-medium text-blue-600">(+91) 9333 911 911</span>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:underline">Get Instant Online Support</a>
              </div>
            </div>
          </div>

          {/* Main Content Area - Empty State */}
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center max-w-md">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Party Details</h1>
              <p className="text-gray-600 mb-2">Add your customers and suppliers to manage your business easily.</p>
              <p className="text-gray-600 mb-8">Track payments and grow your business without any hassle!</p>
              
              {/* Illustration */}
              <div className="relative mb-8">
                <div className="w-64 h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center relative">
                  {/* Window mockup */}
                  <div className="w-48 h-32 bg-gray-800 rounded-lg relative">
                    <div className="flex items-center p-2 border-b border-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="p-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <div className="w-16 h-2 bg-yellow-400 rounded"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <div className="w-20 h-2 bg-yellow-400 rounded"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <div className="w-14 h-2 bg-yellow-400 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Person figure */}
                  <div className="absolute -right-8 top-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-yellow-100 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Plus icon */}
                  <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowAddPartyModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Your First Party</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add Party Modal */}
        {showAddPartyModal && (
          <AddPartyModal 
            onClose={() => setShowAddPartyModal(false)} 
            onSubmit={async (newParty) => {
              setShowAddPartyModal(false)
              // Refresh the parties list
              try {
                const response = await partiesApi.getAllParties()
                setParties(response.data)
              } catch (error) {
                console.error('Error refreshing parties:', error)
              }
            }}
          />
        )}
      </div>
    )
  }

  // Show parties list if parties exist
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />
      
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header with Action Buttons */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Search */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Transactions"
                  className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Right side - Action Buttons */}
            <div className="flex items-center space-x-3">
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
              
              <button 
                onClick={() => setShowAddPartyModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Party</span>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Parties */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Parties Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Parties</h2>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* Search Parties */}
            <div className="relative">
              <input
                type="text"
                placeholder="Q Search Party Name"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleSearch(e.target.value)
                }}
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Parties List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span>Party Name</span>
                <span>Amount</span>
              </div>
            </div>
            
            {filteredParties.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No parties found
              </div>
            ) : (
              filteredParties.map((party) => (
                <div 
                  key={party.id} 
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                    selectedParty?.id === party.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handlePartySelect(party)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{party.name}</span>
                    <span className={`text-sm font-medium ${
                      (() => {
                        console.log(`Party ${party.name}: balanceType = ${party.balanceType}, currentBalance = ${party.currentBalance}`);
                        if (party.balanceType === 'TO_PAY') {
                          return 'text-red-600';
                        } else if (party.balanceType === 'TO_RECEIVE') {
                          return 'text-green-600';
                        } else {
                          return 'text-gray-600'; // Zero balance - neutral color
                        }
                      })()
                    }`}>
                      ₹ {Math.abs(party.currentBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Party Details */}
        <div className="flex-1 bg-white">
          {selectedPartyDetails ? (
            <div className="p-6">
              {/* Party Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedPartyDetails.name}</h2>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-orange-500 hover:text-orange-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </button>
                  <button className="p-2 text-green-500 hover:text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </button>
                  <button className="p-2 text-red-500 hover:text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Party Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{selectedPartyDetails.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{selectedPartyDetails.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">GST Number</p>
                  <p className="text-sm font-medium">{selectedPartyDetails.gstNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className={`text-sm font-medium ${
                    selectedPartyDetails.balanceType === 'TO_PAY' ? 'text-red-600' : 
                    selectedPartyDetails.balanceType === 'TO_RECEIVE' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    ₹ {Math.abs(selectedPartyDetails.currentBalance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Transactions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Transaction Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedPartyDetails.transactions && selectedPartyDetails.transactions.length > 0 ? (
                        selectedPartyDetails.transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {transaction.transactionType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.transactionNumber || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.transactionDate).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹ {transaction.amount?.toLocaleString() || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹ {transaction.transactionType === 'SALE' 
                                ? (transaction.saleBalance ? Math.abs(transaction.saleBalance).toLocaleString() : '0.00')
                                : (transaction.purchaseBalance ? Math.abs(transaction.purchaseBalance).toLocaleString() : '0.00')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions to show</h3>
                              <p className="text-gray-500">You haven't added any transactions yet.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center text-gray-500">
                <p>Select a party to view details</p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Add Party Modal */}
      {showAddPartyModal && (
        <AddPartyModal 
          onClose={() => setShowAddPartyModal(false)} 
          onSubmit={async (newParty) => {
            setShowAddPartyModal(false)
            // Refresh the parties list
            try {
              const response = await partiesApi.getAllParties()
              setParties(response.data)
            } catch (error) {
              console.error('Error refreshing parties:', error)
            }
          }}
        />
      )}
      </div>
    </div>
  )
}
