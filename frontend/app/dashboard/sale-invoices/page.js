'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../lib/auth'
import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import SalesInvoiceTemplate from '../../../components/SalesInvoiceTemplate'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

export default function SaleInvoicesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sales, setSales] = useState([])
  const [isLoadingSales, setIsLoadingSales] = useState(false)
  const [filteredSales, setFilteredSales] = useState([])
  const [dateFilter, setDateFilter] = useState('This Month')
  const [startDate, setStartDate] = useState('01/09/2025')
  const [endDate, setEndDate] = useState('30/09/2025')
  const [firmFilter, setFirmFilter] = useState('All Firms')
  const [showInvoice, setShowInvoice] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)

  // Fetch sales data from backend
  const fetchSales = async () => {
    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.log('Sale Invoices: No token found, using mock data')
        return []
      }

      setIsLoadingSales(true)
      console.log('Sale Invoices: Fetching sales data...')
      const response = await api.get('/sales')
      console.log('Sale Invoices: Sales response:', response.data)
      return response.data
    } catch (error) {
      console.error('Sale Invoices: Error fetching sales:', error)
      console.log('Sale Invoices: Error status:', error.response?.status)
      console.log('Sale Invoices: Error message:', error.message)
      
      // For now, treat any error as "endpoint not implemented" since we don't have sales backend yet
      console.log('Sale Invoices: Sales endpoint not implemented yet, using mock data')
      toast('Sales endpoint not implemented yet. Showing sample data.', {
        icon: 'ℹ️',
        duration: 3000
      })
      // Return mock data when endpoint doesn't exist
      return [
        {
          id: 6,
          date: '27/09/2025',
          invoiceNo: '6',
          partyName: 'mali',
          transaction: 'Sale',
          paymentType: 'Cash',
          amount: 20,
          balance: 10
        },
        {
          id: 5,
          date: '27/09/2025',
          invoiceNo: '5',
          partyName: 'mali',
          transaction: 'Sale',
          paymentType: 'Cash',
          amount: 20,
          balance: 0
        },
        {
          id: 4,
          date: '27/09/2025',
          invoiceNo: '4',
          partyName: 'elpro',
          transaction: 'Sale',
          paymentType: 'Cash',
          amount: 20,
          balance: 0
        },
        {
          id: 3,
          date: '26/09/2025',
          invoiceNo: '3',
          partyName: 'Dmart',
          transaction: 'Sale',
          paymentType: 'Cash',
          amount: 2,
          balance: 1
        },
        {
          id: 2,
          date: '26/09/2025',
          invoiceNo: '2',
          partyName: 'xggg',
          transaction: 'Sale',
          paymentType: 'Cash',
          amount: 100,
          balance: 0
        }
      ]
    } finally {
      setIsLoadingSales(false)
    }
  }

  // Load sales from localStorage if backend is not available
  const loadSalesFromStorage = () => {
    try {
      const storedSales = localStorage.getItem('sales')
      return storedSales ? JSON.parse(storedSales) : []
    } catch (error) {
      console.error('Error loading sales from storage:', error)
      return []
    }
  }

  // Save sales to localStorage
  const saveSalesToStorage = (salesData) => {
    try {
      localStorage.setItem('sales', JSON.stringify(salesData))
    } catch (error) {
      console.error('Error saving sales to storage:', error)
    }
  }

  // Initialize page with authentication check (simplified like other dashboard pages)
  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        console.log('Sale Invoices: Not authenticated, redirecting to login')
        router.push('/auth/login')
        return
      }

      try {
        const userData = authService.getCurrentUserFromStorage()
        setUser(userData)
        console.log('Sale Invoices: User authenticated:', userData)
      } catch (error) {
        console.error('Sale Invoices: Error getting user data:', error)
        authService.logout()
        router.push('/auth/login')
        return
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Fetch sales data after authentication is confirmed
  useEffect(() => {
    const loadSalesData = async () => {
      if (user) {
        try {
          // Try to fetch sales data from backend, fallback to localStorage
          let salesData = await fetchSales()
          
          // If no sales from backend, try localStorage
          if (salesData.length === 0) {
            const localSales = loadSalesFromStorage()
            if (localSales.length > 0) {
              salesData = localSales
              console.log('Sale Invoices: Loaded sales from localStorage:', localSales.length)
            }
          }
          
          setSales(salesData)
          setFilteredSales(salesData)
        } catch (error) {
          console.error('Sale Invoices: Error loading sales data:', error)
          // Error is already handled in fetchSales function, no need for additional toast
        }
      }
    }

    loadSalesData()
  }, [user])

  // Listen for sales updates from other pages
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sales') {
        console.log('Sale Invoices: Storage change detected, refreshing sales')
        const newSales = loadSalesFromStorage()
        setSales(newSales)
        setFilteredSales(newSales)
      }
    }

    // Also refresh data when page becomes visible (user navigates back to this page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Sale Invoices: Page became visible, refreshing sales data')
        refreshSalesData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const refreshSalesData = async () => {
    try {
      let salesData = await fetchSales()
      
      // If no sales from backend, try localStorage
      if (salesData.length === 0) {
        const localSales = loadSalesFromStorage()
        if (localSales.length > 0) {
          salesData = localSales
        }
      }
      
      setSales(salesData)
      setFilteredSales(salesData)
    } catch (error) {
      console.error('Sale Invoices: Error refreshing sales:', error)
    }
  }

  const handleLogout = () => {
    authService.logout()
    toast.success('Logged out successfully')
    router.push('/auth/login')
  }

  const handleAddSale = () => {
    router.push('/dashboard/sale')
  }

  const handlePrintInvoice = async (sale) => {
    try {
      // Fetch full sale details if not already available
      let saleDetails = sale
      if (!sale.saleItems && sale.id) {
        const response = await api.get(`/sales/${sale.id}`)
        saleDetails = response.data
      }
      
      setSelectedSale(saleDetails)
      setShowInvoice(true)
    } catch (error) {
      console.error('Error fetching sale details:', error)
      toast.error('Failed to load invoice details')
    }
  }

  const handleRefreshSales = async () => {
    try {
      let salesData = await fetchSales()
      
      // If no sales from backend, try localStorage
      if (salesData.length === 0) {
        const localSales = loadSalesFromStorage()
        if (localSales.length > 0) {
          salesData = localSales
          console.log('Sale Invoices: Refreshed with localStorage data:', localSales.length)
        }
      }
      
      setSales(salesData)
      setFilteredSales(salesData)
    } catch (error) {
      console.error('Sale Invoices: Error refreshing sales:', error)
      // Error already handled in fetchSales
    }
  }

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter)
    // Apply date filtering logic here when backend is implemented
    // For now, just keep all sales
    setFilteredSales(sales)
  }

  const totals = useMemo(() => {
    const totalReceived = filteredSales.reduce((sum, sale) => {
      const received = sale.receivedAmount || (sale.totalAmount || sale.amount || 0) - (sale.balanceAmount || sale.balance || 0)
      const numericReceived = typeof received === 'number' ? received : parseFloat(received) || 0
      return sum + numericReceived
    }, 0)
    
    const totalBalance = filteredSales.reduce((sum, sale) => {
      const balance = sale.balanceAmount || sale.balance || 0
      const numericBalance = typeof balance === 'number' ? balance : parseFloat(balance) || 0
      return sum + numericBalance
    }, 0)
    
    // Total sales amount = received + balance
    const totalSales = totalReceived + totalBalance
    
    return {
      totalSales: totalSales.toLocaleString(),
      totalReceived: totalReceived.toLocaleString(),
      totalBalance: totalBalance.toLocaleString()
    }
  }, [filteredSales])

  // Show loading spinner while checking authentication
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar user={user} onLogout={handleLogout} />
        
        <div className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={refreshSalesData}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddSale}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Sale</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by :</span>
              
              <div className="flex items-center space-x-2">
                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Year</option>
                  <option>Custom</option>
                </select>
                
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
                  placeholder="DD/MM/YYYY"
                />
                
                <span className="text-sm text-gray-500">To</span>
                
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
                  placeholder="DD/MM/YYYY"
                />
              </div>
              
              <select
                value={firmFilter}
                onChange={(e) => setFirmFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option>All Firms</option>
                <option>Main Firm</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Total Sales Amount</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded">100%</span>
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹ {totals.totalSales}</p>
                <p className="text-sm text-gray-500 mt-1">vs last month</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Received:</span> ₹ {totals.totalReceived}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Balance:</span> ₹ {totals.totalBalance}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleRefreshSales}
                    disabled={isLoadingSales}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Refresh"
                  >
                    <svg className={`w-5 h-5 ${isLoadingSales ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 00-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button className="p-2 text-green-600 hover:text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Date</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Invoice no</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Party Name</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Transaction</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Payment Type</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-end space-x-1">
                        <span>Amount</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-end space-x-1">
                        <span>Balance</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.invoiceDate ? new Date(sale.invoiceDate).toLocaleDateString('en-GB') : sale.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.invoiceNumber || sale.invoiceNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.partyName || sale.billingName || 'Walk-in Customer'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Sale
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.paymentType || 'Cash'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹ {sale.totalAmount ? sale.totalAmount.toFixed(2) : sale.amount || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹ {sale.balanceAmount ? sale.balanceAmount.toFixed(2) : sale.balance || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handlePrintInvoice(sale)}
                            className="p-1 text-blue-500 hover:text-blue-700"
                            title="Print Invoice"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Loading state */}
              {isLoadingSales && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading sales...</span>
                </div>
              )}
              
              {/* Empty state */}
              {!isLoadingSales && filteredSales.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Found</h3>
                  <p className="text-gray-500 mb-4">You haven't created any sales yet.</p>
                  <button
                    onClick={handleAddSale}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Add Your First Sale
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sales Invoice Modal */}
        {showInvoice && selectedSale && (
          <SalesInvoiceTemplate
            sale={selectedSale}
            onClose={() => {
              setShowInvoice(false)
              setSelectedSale(null)
            }}
            onPrint={() => {
              // Print functionality will be handled by the template
            }}
            onDownload={() => {
              // Download functionality will be handled by the template
            }}
          />
        )}
      </div>
    </div>
  )
}
