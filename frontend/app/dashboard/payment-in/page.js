'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '../../../lib/auth'
import { partiesApi } from '../../../lib/partiesApi'
import api from '../../../lib/api'
import Header from '../../../components/Header'
import Sidebar from '../../../components/Sidebar'
import AddPartyModal from '../../../components/AddPartyModal'
import toast from 'react-hot-toast'

export default function PaymentInPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('This Month')
  const [selectedFirm, setSelectedFirm] = useState('All Firms')
  const [dateRange, setDateRange] = useState('01/09/2025 To 30/09/2025')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showFirmDropdown, setShowFirmDropdown] = useState(false)

  // State for form modal
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    partyName: '',
    paymentType: 'Cash',
    receiptNo: '1',
    date: '29/09/2025',
    receivedAmount: '',
    description: ''
  })

  // State for party selector
  const [parties, setParties] = useState([])
  const [filteredParties, setFilteredParties] = useState([])
  const [showPartyDropdown, setShowPartyDropdown] = useState(false)
  const [selectedParty, setSelectedParty] = useState(null)
  const [partyBalance, setPartyBalance] = useState(0)
  const [showAddPartyModal, setShowAddPartyModal] = useState(false)
  const partyInputRef = useRef(null)
  const partyDropdownRef = useRef(null)

  // State for payment type selector
  const [bankAccounts, setBankAccounts] = useState([])
  const [showPaymentTypeDropdown, setShowPaymentTypeDropdown] = useState(false)
  const [selectedBankAccount, setSelectedBankAccount] = useState(null)
  const [selectedBankBalance, setSelectedBankBalance] = useState(0)
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const paymentTypeDropdownRef = useRef(null)

  // State for transactions
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser()
        if (!userData) {
          router.push('/auth/login')
          return
        }
        setUser(userData)
        await loadData()
      } catch (error) {
        console.error('Payment In: Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Close dropdowns when clicking outside (same as payment-out)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (partyDropdownRef.current && !partyDropdownRef.current.contains(event.target)) {
        setShowPartyDropdown(false)
      }
      if (paymentTypeDropdownRef.current && !paymentTypeDropdownRef.current.contains(event.target)) {
        setShowPaymentTypeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter parties based on search term (same as payment-out)
  useEffect(() => {
    if (formData.partyName.trim() === '') {
      setFilteredParties(parties)
    } else {
      const filtered = parties.filter(party => 
        party.name.toLowerCase().includes(formData.partyName.toLowerCase()) ||
        (party.phone && party.phone.includes(formData.partyName))
      )
      setFilteredParties(filtered)
    }
  }, [formData.partyName, parties])

  const loadData = async () => {
    try {
      // Fetch parties, bank accounts, and payment-in transactions
      await Promise.all([fetchParties(), fetchBankAccounts(), fetchPaymentIns()])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // Party-related functions (same as payment-out)
  const fetchParties = async () => {
    try {
      const response = await partiesApi.getAllParties()
      const partiesData = response.data
      
      // Use the same data structure as parties page
      setParties(partiesData)
      setFilteredParties(partiesData)
    } catch (error) {
      console.error('Error fetching parties:', error)
      toast.error('Failed to load parties')
    }
  }

  // Bank account related functions (same as payment-out)
  const fetchBankAccounts = async () => {
    try {
      console.log('Fetching bank accounts...')
      const response = await api.get('/bank-accounts')
      console.log('Bank accounts response:', response.data)
      const accounts = response.data.bankAccounts || response.data || []
      console.log('Setting bank accounts:', accounts)
      setBankAccounts(accounts)
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
      toast.error('Failed to load bank accounts')
    }
  }

  // Fetch payment-in transactions from backend
  const fetchPaymentIns = async () => {
    try {
      setLoading(true)
      const response = await api.get('/payment-in')
      console.log('Payment ins response:', response.data)
      
      // The backend returns {success: true, data: [transactions]}
      const transactionsData = response.data.data || []
      console.log('Transactions data:', transactionsData)
      
      // Transform the response data to match our frontend format
      const transformedTransactions = transactionsData.map(transaction => ({
        id: transaction.id,
        date: new Date(transaction.paymentDate).toLocaleDateString('en-GB'), // DD/MM/YYYY format
        refNo: transaction.receiptNumber || '',
        partyName: transaction.partyName,
        totalAmount: transaction.amount,
        received: transaction.amount, // For payment-in, received amount equals total amount
        paymentType: transaction.paymentType,
        description: transaction.description
      }))
      
      setTransactions(transformedTransactions)
    } catch (error) {
      console.error('Error fetching payment ins:', error)
      toast.error('Failed to load payment-in transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    toast.success('Logged out successfully')
    router.push('/auth/login')
  }

  const handleAddPaymentIn = () => {
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setFormData({
      partyName: '',
      paymentType: 'Cash',
      receiptNo: '1',
      date: '29/09/2025',
      receivedAmount: '',
      description: ''
    })
    setSelectedParty(null)
    setPartyBalance(0)
    setShowPartyDropdown(false)
    setSelectedBankAccount(null)
    setSelectedBankBalance(0)
    setShowPaymentTypeDropdown(false)
  }

  const handleSave = async () => {
    try {
      if (!formData.partyName || !formData.receivedAmount) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!selectedParty) {
        toast.error('Please select a party')
        return
      }

      // Prepare the request data
      const requestData = {
        partyId: selectedParty.id,
        paymentType: formData.paymentType,
        bankAccountId: selectedBankAccount ? selectedBankAccount.id : null,
        amount: parseFloat(formData.receivedAmount),
        receiptNumber: formData.receiptNo,
        paymentDate: new Date(formData.date.split('/').reverse().join('-')).toISOString(),
        description: formData.description
      }

      console.log('Saving payment in:', requestData)
      
      // Make API call to save payment in
      const response = await api.post('/payment-in', requestData)
      console.log('Payment in saved:', response.data)
      
      toast.success('Payment in saved successfully')
      handleCloseForm()
      // Refresh transactions after saving
      await fetchPaymentIns()
    } catch (error) {
      console.error('Error saving payment in:', error)
      toast.error('Failed to save payment in: ' + (error.response?.data?.message || error.message))
    }
  }

  // Party handling functions (same as payment-out)
  const handlePartyInputChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, partyName: value }))
    setShowPartyDropdown(true)
    
    // Clear selected party if input doesn't match
    if (selectedParty && selectedParty.name !== value) {
      setSelectedParty(null)
      setPartyBalance(0)
    }
  }

  const handlePartyInputFocus = () => {
    setShowPartyDropdown(true)
  }

  const handlePartySelect = async (party) => {
    setFormData(prev => ({ ...prev, partyName: party.name }))
    setSelectedParty(party)
    setShowPartyDropdown(false)
    
    // Use the same balance field as parties page
    setPartyBalance(party.currentBalance || 0)
  }

  // Get party balance with type for display (using same logic as parties page)
  const getPartyBalanceInfo = (party) => {
    const currentBalance = party.currentBalance || 0
    const balanceType = party.balanceType || 'TO_PAY'
    
    // Same logic as parties page:
    // - TO_PAY = red color (money to be paid to party)
    // - TO_RECEIVE = green color (money to be received from party)
    
    if (balanceType === 'TO_PAY') {
      return {
        amount: Math.abs(currentBalance),
        type: 'to-pay',
        color: 'red'
      }
    } else {
      return {
        amount: Math.abs(currentBalance),
        type: 'to-receive',
        color: 'green'
      }
    }
  }

  const handleAddParty = () => {
    setShowAddPartyModal(true)
  }

  const handleAddPartySubmit = async (newParty) => {
    try {
      // Add the new party to the list (balance should come with party data)
      setParties(prev => [...prev, newParty])
      setFilteredParties(prev => [...prev, newParty])
      
      // Select the newly created party
      setSelectedParty(newParty)
      setFormData(prev => ({ ...prev, partyName: newParty.name }))
      setPartyBalance(newParty.currentBalance || 0)
      
      setShowAddPartyModal(false)
      toast.success('Party created successfully!')
    } catch (error) {
      console.error('Error handling new party:', error)
      toast.error('Failed to add new party')
    }
  }

  // Payment type handling functions (same as payment-out)
  const handlePaymentTypeFocus = () => {
    setShowPaymentTypeDropdown(true)
  }

  const handlePaymentTypeSelect = (paymentType, bankAccount = null) => {
    setFormData(prev => ({ ...prev, paymentType }))
    setSelectedBankAccount(bankAccount)
    setShowPaymentTypeDropdown(false)
    
    if (bankAccount) {
      setSelectedBankBalance(bankAccount.currentBalance || 0)
    } else {
      setSelectedBankBalance(0)
    }
  }

  const handleAddBank = () => {
    setShowAddBankModal(true)
  }

  const handleAddPaymentType = () => {
    handleAddBank()
  }

  const handleAddBankSubmit = async (e, formData) => {
    try {
      setLoading(true)
      console.log('Creating bank account with data:', formData)
      const response = await api.post('/bank-accounts', formData)
      console.log('Bank account created:', response.data)
      toast.success('Bank account added successfully')
      setShowAddBankModal(false)
      
      // Refresh bank accounts list
      await fetchBankAccounts()
      
      // Select the newly created bank account
      if (response.data && response.data.id) {
        setSelectedBankAccount(response.data)
        setFormData(prev => ({ ...prev, paymentType: response.data.accountDisplayName }))
      }
    } catch (error) {
      console.error('Error adding bank account:', error)
      toast.error(error.response?.data?.error || 'Failed to add bank account')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={handleLogout} />
        
        <div className="p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-gray-900">Payment-In</h1>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddPaymentIn}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Payment-In</span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by :</span>
            
            {/* Period Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1"
              >
                <span>{selectedPeriod}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showPeriodDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                  <button
                    onClick={() => {
                      setSelectedPeriod('This Month')
                      setShowPeriodDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPeriod('Last Month')
                      setShowPeriodDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPeriod('This Year')
                      setShowPeriodDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    This Year
                  </button>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dateRange}</span>
            </div>

            {/* Firm Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFirmDropdown(!showFirmDropdown)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1"
              >
                <span>{selectedFirm}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showFirmDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                  <button
                    onClick={() => {
                      setSelectedFirm('All Firms')
                      setShowFirmDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    All Firms
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFirm('Firm 1')
                      setShowFirmDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Firm 1
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFirm('Firm 2')
                      setShowFirmDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Firm 2
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Amount</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹ 0</p>
                <p className="text-sm text-gray-500 mt-1">0% ↑ vs last month</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Received:</span> ₹ 0
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area - Transactions Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
              <div className="flex items-center space-x-3">
                {/* Search Icon */}
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {/* Export Icon */}
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                {/* Print Icon */}
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Ref. no.</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Party Name</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Total Amount</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Received</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Payment Type</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No payment-in transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{transaction.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{transaction.refNo || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{transaction.partyName}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">₹ {transaction.totalAmount?.toLocaleString() || '0.00'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">₹ {transaction.received?.toLocaleString() || '0.00'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{transaction.paymentType}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {/* Print Icon */}
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </button>
                          {/* Share Icon */}
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </button>
                          {/* More Options Icon */}
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
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

      {/* Payment-In Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Form Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Payment-In</h2>
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
                <button 
                  onClick={handleCloseForm}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Section */}
                <div className="space-y-4">
                  {/* Party Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party *
                    </label>
                    <div className="relative" ref={partyDropdownRef}>
                      <input
                        ref={partyInputRef}
                        type="text"
                        value={formData.partyName}
                        onChange={handlePartyInputChange}
                        onFocus={handlePartyInputFocus}
                        className="w-full px-3 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        placeholder="Search by name or phone"
                      />
                      <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      
                      {/* Party Dropdown */}
                      {showPartyDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {/* Add Party Option */}
                          <div
                            onClick={handleAddParty}
                            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                          >
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span className="text-blue-600 font-medium">Add Party</span>
                          </div>
                          
                          {/* Party List */}
                          {filteredParties.length > 0 ? (
                            filteredParties.map((party) => {
                              const balanceInfo = getPartyBalanceInfo(party)
                              return (
                                <div
                                  key={party.id}
                                  onClick={() => handlePartySelect(party)}
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                >
                                  <div className="text-sm text-gray-900">{party.name}</div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm text-gray-900">{balanceInfo.amount}</span>
                                    <div className={`w-3 h-3 rounded-sm flex items-center justify-center ${
                                      balanceInfo.color === 'red' ? 'bg-red-500' : 'bg-green-500'
                                    }`}>
                                      <svg 
                                        className={`w-2 h-2 ${balanceInfo.color === 'red' ? 'text-white' : 'text-white'}`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                      >
                                        {balanceInfo.type === 'to-pay' ? (
                                          // Red arrow pointing up (money going out)
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l3-3m0 0l3-3m-3 3v12" />
                                        ) : (
                                          // Green arrow pointing down (money coming in)
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 10l-3 3m0 0l-3 3m3-3V1" />
                                        )}
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No parties found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Party Balance Display */}
                    {selectedParty && (
                      <div className="mt-2 text-right">
                        <div className="text-sm text-gray-500">Party Balance</div>
                        <div className={`text-sm font-medium ${
                          selectedParty.balanceType === 'TO_PAY' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ₹ {Math.abs(selectedParty.currentBalance || 0).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <div className="relative" ref={paymentTypeDropdownRef}>
                      <input
                        type="text"
                        value={formData.paymentType}
                        onFocus={handlePaymentTypeFocus}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer pr-10"
                        placeholder="Select payment type"
                      />
                      <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      
                      {/* Payment Type Dropdown */}
                      {showPaymentTypeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {/* Add Bank A/C Option */}
                          <div
                            onClick={handleAddBank}
                            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                          >
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span className="text-blue-600 font-medium">Add Bank A/C</span>
                          </div>
                          
                          {/* Cash Option */}
                          <div
                            onClick={() => handlePaymentTypeSelect('Cash')}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="text-sm text-gray-900">Cash</div>
                          </div>
                          
                          {/* Cheque Option */}
                          <div
                            onClick={() => handlePaymentTypeSelect('Cheque')}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="text-sm text-gray-900">Cheque</div>
                          </div>
                          
                          {/* Dynamic Bank Accounts */}
                          {bankAccounts.length > 0 ? (
                            bankAccounts.map((bankAccount, index) => (
                              <div
                                key={bankAccount.id || index}
                                onClick={() => handlePaymentTypeSelect(bankAccount.accountDisplayName || bankAccount.bankName, bankAccount)}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <div className="text-sm text-gray-900">
                                  {bankAccount.accountDisplayName || bankAccount.bankName || `Bank Account ${index + 1}`}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No bank accounts found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Payment Type Link */}
                  <div>
                    <button
                      onClick={handleAddPaymentType}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Payment type
                    </button>
                  </div>

                  {/* Add Description Button */}
                  <div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>ADD DESCRIPTION</span>
                    </button>
                  </div>

                  {/* Add Image Button */}
                  <div>
                    <button className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Right Section */}
                <div className="space-y-4">
                  {/* Receipt No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt No
                    </label>
                    <input
                      type="text"
                      value={formData.receiptNo}
                      onChange={(e) => setFormData({...formData, receiptNo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter receipt number"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        placeholder="DD/MM/YYYY"
                      />
                      <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Received Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Received
                    </label>
                    <input
                      type="number"
                      value={formData.receivedAmount}
                      onChange={(e) => setFormData({...formData, receivedAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount received"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                  <span>Share</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Party Modal */}
      {showAddPartyModal && (
        <AddPartyModal
          onClose={() => setShowAddPartyModal(false)}
          onSubmit={handleAddPartySubmit}
        />
      )}

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <AddBankModal
          onClose={() => setShowAddBankModal(false)}
          onSubmit={handleAddBankSubmit}
          loading={loading}
        />
      )}
    </div>
  )
}

// Add Bank Modal Component (same as payment-out)
function AddBankModal({ onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    accountDisplayName: '',
    openingBalance: '',
    asOfDate: '',
    printUpiQr: false,
    printBankDetails: false,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    branchName: '',
    accountType: 'SAVINGS'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e, formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add Bank Account</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Fields - Always Visible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Display Name *
            </label>
            <input
              type="text"
              value={formData.accountDisplayName}
              onChange={(e) => setFormData({...formData, accountDisplayName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account display name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opening Balance
            </label>
            <input
              type="number"
              value={formData.openingBalance}
              onChange={(e) => setFormData({...formData, openingBalance: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              As of Date
            </label>
            <input
              type="date"
              value={formData.asOfDate}
              onChange={(e) => setFormData({...formData, asOfDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Print Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.printUpiQr}
                onChange={(e) => setFormData({...formData, printUpiQr: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Print UPI QR Code on Invoices</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.printBankDetails}
                onChange={(e) => setFormData({...formData, printBankDetails: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Print Bank Details on Invoices</span>
            </label>
          </div>

          {/* Additional Fields - Only show if print options are selected */}
          {(formData.printUpiQr || formData.printBankDetails) && (
            <>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Bank Details</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bank name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter IFSC code"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account holder name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter branch name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SAVINGS">Savings</option>
                  <option value="CURRENT">Current</option>
                  <option value="FIXED">Fixed</option>
                </select>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Bank Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
