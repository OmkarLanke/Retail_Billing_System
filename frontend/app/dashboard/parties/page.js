'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../lib/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Sidebar from '../../../components/Sidebar'
import AddPartyModal from '../../../components/AddPartyModal'

export default function PartiesPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [parties, setParties] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddPartyModal, setShowAddPartyModal] = useState(false)
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
        // For now, using empty array - will be replaced with API call
        setParties([])
        console.log('Parties page initialized successfully')
      } catch (error) {
        console.error('Error getting user data:', error)
        authService.logout()
        router.push('/auth/login')
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
            onSubmit={() => {
              setShowAddPartyModal(false)
              toast.success('Party added successfully!')
            }}
          />
        )}
      </div>
    )
  }

  // Show parties list if parties exist
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <div key={party.id} className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{party.name}</span>
                    <span className={`text-sm font-medium ${
                      party.balance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₹ {party.balance?.toLocaleString() || '0.00'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Party Details */}
        <div className="flex-1 bg-white">
          <div className="p-6">
            <div className="text-center text-gray-500">
              <p>Select a party to view details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Party Modal */}
      {showAddPartyModal && (
        <AddPartyModal 
          onClose={() => setShowAddPartyModal(false)} 
          onSubmit={() => {
            setShowAddPartyModal(false)
            toast.success('Party added successfully!')
          }}
        />
      )}
    </div>
  )
}

