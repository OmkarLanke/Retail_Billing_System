'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../../lib/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import api from '../../../../lib/api'

export default function CashInHandPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAdjustCashModal, setShowAdjustCashModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [currentBalance, setCurrentBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    amount: '',
    description: '',
    referenceNumber: '',
    transactionType: 'ADJUSTMENT'
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isValidAuthenticated()) {
        toast.error('Session expired. Please login again.')
        authService.logout()
        router.push('/auth/login')
        return
      }

      try {
        const userData = authService.getCurrentUserFromStorage()
        setUser(userData)
        await fetchCashTransactions()
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

  const fetchCashTransactions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cash-transactions')
      setTransactions(response.data.transactions || [])
      setCurrentBalance(response.data.currentBalance || 0)
    } catch (error) {
      console.error('Error fetching cash transactions:', error)
      toast.error('Failed to fetch cash transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustCash = async (e, formData) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      // Check if user is authenticated and token is not expired
      if (!authService.isValidAuthenticated()) {
        console.log('Token validation failed - redirecting to login')
        toast.error('Session expired. Please login again.')
        authService.logout()
        router.push('/auth/login')
        return
      }
      
      console.log('Token validation passed - proceeding with request')
      
      // Convert amount to number and ensure proper format
      const requestData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        referenceNumber: formData.referenceNumber || null,
        transactionType: formData.transactionType,
        adjustmentDate: formData.adjustmentDate
      }
      
      console.log('Submitting cash adjustment:', requestData)
      
      const response = await api.post('/cash-transactions/adjust', requestData)
      console.log('Cash adjustment response:', response.data)
      toast.success('Cash adjusted successfully')
      setShowAdjustCashModal(false)
      setAdjustmentData({
        amount: '',
        description: '',
        referenceNumber: '',
        transactionType: 'IN',
        adjustmentDate: new Date().toISOString().split('T')[0]
      })
      await fetchCashTransactions()
      } catch (error) {
        console.error('Error adjusting cash:', error)
        console.error('Error response status:', error.response?.status)
        console.error('Error response data:', error.response?.data)
        if (error.response?.status === 401) {
          console.log('401 Unauthorized - forcing logout and redirect')
          toast.error('Session expired. Please login again.')
          authService.forceLogout()
          router.push('/auth/login')
        } else {
          toast.error(error.response?.data?.error || 'Failed to adjust cash')
        }
      } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    toast.success('Logged out successfully')
    router.push('/auth/login')
  }

  const filteredTransactions = transactions.filter(transaction =>
    (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.transactionType || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />
      
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {/* Search and Actions */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Transactions"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button 
              onClick={() => setShowAdjustCashModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>Adjust Cash</span>
            </button>
          </div>

          {/* Cash Balance */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cash In Hand</h2>
            <div className={`text-3xl font-bold ${currentBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>₹ {currentBalance?.toLocaleString() || '0'}</div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                      <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                      <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                      <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                      <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        Loading transactions...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr 
                        key={transaction.id} 
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedTransaction?.id === transaction.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(() => {
                            if (transaction.transactionType === 'IN') {
                              return 'Cash Increase';
                            } else if (transaction.transactionType === 'ADJUSTMENT') {
                              return 'Adjustment';
                            } else if (transaction.transactionType === 'OUT') {
                              // Check description to determine if it's a purchase or payment out
                              const description = transaction.description || '';
                              if (description.startsWith('Purchase from ')) {
                                return 'Purchase';
                              } else if (description.startsWith('Payment to ')) {
                                return 'Payment Out';
                              } else {
                                return 'Cash Decrease';
                              }
                            } else {
                              return transaction.transactionType;
                            }
                          })()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.transactionDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                          transaction.transactionType === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'IN' ? '+' : '-'}₹ {transaction.amount?.toLocaleString() || '0'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Cash Modal */}
      {showAdjustCashModal && (
        <AdjustCashModal 
          onClose={() => setShowAdjustCashModal(false)} 
          onSubmit={handleAdjustCash}
          loading={loading}
          currentBalance={currentBalance}
        />
      )}
      </div>
    </div>
  )
}

// Adjust Cash Modal Component
function AdjustCashModal({ onClose, onSubmit, loading, currentBalance }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    referenceNumber: '',
    transactionType: 'IN',
    adjustmentDate: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e, formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Adjust Cash</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transactionType"
                  value="IN"
                  checked={formData.transactionType === 'IN'}
                  onChange={(e) => setFormData({...formData, transactionType: e.target.value})}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Add Cash</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transactionType"
                  value="OUT"
                  checked={formData.transactionType === 'OUT'}
                  onChange={(e) => setFormData({...formData, transactionType: e.target.value})}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Reduce Cash</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Updated Cash Display */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm text-gray-600">Updated Cash: </span>
            <span className={`text-sm font-medium ${currentBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>₹ {currentBalance?.toLocaleString() || '0'}</span>
          </div>

          {/* Adjustment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.adjustmentDate}
                onChange={(e) => setFormData({...formData, adjustmentDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute right-3 top-2.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Description"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
