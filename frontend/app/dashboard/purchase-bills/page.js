'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../lib/auth'
import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import api from '../../../lib/api'

export default function PurchaseBillsPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  // Initialize with current month dates
  const getCurrentMonthDates = () => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    return {
      from: formatDate(startOfMonth),
      to: formatDate(endOfMonth)
    }
  }

  const currentMonthDates = getCurrentMonthDates()
  const [dateFrom, setDateFrom] = useState(currentMonthDates.from)
  const [dateTo, setDateTo] = useState(currentMonthDates.to)
  const [selectedPeriod, setSelectedPeriod] = useState('All Purchase Invoices')
  const [selectedFirm, setSelectedFirm] = useState('ALL FIRMS')
  const [purchases, setPurchases] = useState([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)
  const [summaryData, setSummaryData] = useState({
    paid: 0,
    unpaid: 0,
    total: 0
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/auth/login')
        return
      }

      try {
        const userData = authService.getCurrentUserFromStorage()
        setUser(userData)
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

  useEffect(() => {
    if (user) {
      fetchPurchases()
    }
  }, [user])

  // Handle period selection
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
    
    if (period === 'All Purchase Invoices') {
      // Fetch all purchases without date filter
      fetchPurchases()
      return
    }
    
    const today = new Date()
    let startDate, endDate
    
    switch (period) {
      case 'This Month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'Last Month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        endDate = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      case 'This Quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3)
        startDate = new Date(today.getFullYear(), currentQuarter * 3, 1)
        endDate = new Date(today.getFullYear(), (currentQuarter * 3) + 3, 0)
        break
      case 'This Year':
        startDate = new Date(today.getFullYear(), 0, 1)
        endDate = new Date(today.getFullYear(), 11, 31)
        break
      case 'Last Year':
        startDate = new Date(today.getFullYear() - 1, 0, 1)
        endDate = new Date(today.getFullYear() - 1, 11, 31)
        break
      case 'Custom':
        // Keep current dates when switching to Custom
        return
      default:
        return
    }
    
    // Format dates as DD/MM/YYYY
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    const newStartDate = formatDate(startDate)
    const newEndDate = formatDate(endDate)
    
    setDateFrom(newStartDate)
    setDateTo(newEndDate)
    
    // Fetch purchases with new date range
    fetchPurchases(newStartDate, newEndDate)
  }

  // Handle manual date changes
  const handleDateChange = () => {
    // Automatically change to Custom when dates are manually changed
    if (selectedPeriod !== 'Custom') {
      setSelectedPeriod('Custom')
    }
    fetchPurchases()
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/auth/login')
  }

  const fetchPurchases = async (customStartDate = null, customEndDate = null) => {
    try {
      setLoadingPurchases(true)
      
      // Use custom dates if provided, otherwise use current filter values
      const startDate = customStartDate || dateFrom
      const endDate = customEndDate || dateTo
      
      // Convert DD/MM/YYYY format to YYYY-MM-DD for API
      const formatDateForAPI = (dateStr) => {
        if (!dateStr) return null
        const [day, month, year] = dateStr.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
      
      // Build API URL with date parameters
      let apiUrl = '/purchases/bills'
      const params = new URLSearchParams()
      
      // Only add date filters if not "All Purchase Invoices"
      if (selectedPeriod !== 'All Purchase Invoices') {
        const apiStartDate = formatDateForAPI(startDate)
        const apiEndDate = formatDateForAPI(endDate)
        
        console.log('Frontend: Original dates - From:', startDate, 'To:', endDate)
        console.log('Frontend: API dates - From:', apiStartDate, 'To:', apiEndDate)
        console.log('Frontend: Same date scenario:', apiStartDate === apiEndDate)
        
        if (apiStartDate && apiEndDate) {
          params.append('startDate', apiStartDate)
          params.append('endDate', apiEndDate)
        }
      } else {
        console.log('Frontend: Fetching all purchase invoices (no date filter)')
      }
      
      if (params.toString()) {
        apiUrl += '?' + params.toString()
      }
      
      console.log('Frontend: Making API call to:', apiUrl)
      
      const response = await api.get(apiUrl)
      const purchasesData = response.data
      console.log('Frontend: Received', purchasesData.length, 'purchases')
      console.log('Frontend: Purchase data:', purchasesData)
      setPurchases(purchasesData)
      
      // Calculate summary data
      const summary = purchasesData.reduce((acc, purchase) => {
        const paid = parseFloat(purchase.paidAmount) || 0
        const unpaid = parseFloat(purchase.balanceAmount) || 0
        const total = parseFloat(purchase.totalAmount) || 0
        
        return {
          paid: acc.paid + paid,
          unpaid: acc.unpaid + unpaid,
          total: acc.total + total
        }
      }, { paid: 0, unpaid: 0, total: 0 })
      
      setSummaryData(summary)
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoadingPurchases(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar user={user} onLogout={handleLogout} />

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


          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Purchase Bills</h1>
              <div className="flex items-center space-x-3">
                <button className="border border-red-600 text-red-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Upload Bill</span>
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Purchase</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All Purchase Invoices">All Purchase Invoices</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="This Year">This Year</option>
                    <option value="Last Year">Last Year</option>
                    <option value="Custom">Custom</option>
                  </select>
                  
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Between
                  </button>
                  
                  <input
                    type="text"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value)
                      handleDateChange()
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="DD/MM/YYYY"
                  />
                  
                  <input
                    type="text"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value)
                      handleDateChange()
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="DD/MM/YYYY"
                  />
                  
                  <select
                    value={selectedFirm}
                    onChange={(e) => setSelectedFirm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>ALL FIRMS</option>
                    <option>Firm 1</option>
                    <option>Firm 2</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Excel Report</span>
                  </div>
                  
                  <div className="flex flex-col items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Print</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="bg-green-100 px-4 py-3 rounded-lg">
                  <div className="text-lg font-semibold text-green-800">Paid</div>
                  <div className="text-2xl font-bold text-green-900">₹ {summaryData.paid.toFixed(2)}</div>
                </div>
                
                <div className="text-2xl font-bold text-gray-400">+</div>
                
                <div className="bg-blue-100 px-4 py-3 rounded-lg">
                  <div className="text-lg font-semibold text-blue-800">Unpaid</div>
                  <div className="text-2xl font-bold text-blue-900">₹ {summaryData.unpaid.toFixed(2)}</div>
                </div>
                
                <div className="text-2xl font-bold text-gray-400">=</div>
                
                <div className="bg-orange-100 px-4 py-3 rounded-lg">
                  <div className="text-lg font-semibold text-orange-800">Total</div>
                  <div className="text-2xl font-bold text-orange-900">₹ {summaryData.total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">TRANSACTIONS</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                    <div className="absolute left-2 top-2.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          <div className="flex items-center space-x-1">
                            <span>DATE</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          <div className="flex items-center space-x-1">
                            <span>INVOICE NO.</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          <div className="flex items-center space-x-1">
                            <span>PARTY NAME</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          <div className="flex items-center space-x-1">
                            <span>PAYMENT TYPE</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          <div className="flex items-center space-x-1">
                            <span>AMOUNT</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          <div className="flex items-center space-x-1">
                            <span>BALANCE DUE</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingPurchases ? (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-gray-500">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span>Loading purchases...</span>
                            </div>
                          </td>
                        </tr>
                      ) : purchases.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-gray-500">
                            No purchases found
                          </td>
                        </tr>
                      ) : (
                        purchases.map((purchase) => {
                          const billDate = new Date(purchase.billDate)
                          const formattedDate = billDate.toLocaleDateString('en-GB')
                          
                          return (
                            <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900">{formattedDate}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{purchase.billNumber || ''}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{purchase.partyName || 'Unknown Party'}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{purchase.paymentType || 'Cash'}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{purchase.totalAmount || 0}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{purchase.balanceAmount || 0}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <button className="p-1 hover:bg-gray-100 rounded">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                  </button>
                                  <button className="p-1 hover:bg-gray-100 rounded">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                    </svg>
                                  </button>
                                  <button className="p-1 hover:bg-gray-100 rounded">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
