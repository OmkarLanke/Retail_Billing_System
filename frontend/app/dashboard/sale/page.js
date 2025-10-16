'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../lib/auth'
import Header from '../../../components/Header'
import PartySelector from '../../../components/PartySelector'
import ItemSelector from '../../../components/ItemSelector'
import SalesInvoiceTemplate from '../../../components/SalesInvoiceTemplate'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

export default function SalePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saleType, setSaleType] = useState('Credit')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('en-GB'))
  const [stateOfSupply, setStateOfSupply] = useState('')
  const [selectedParty, setSelectedParty] = useState(null)
  const [phoneNo, setPhoneNo] = useState('')
  const [billingName, setBillingName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [paymentType, setPaymentType] = useState('Cash')
  const [showPaymentTypeDropdown, setShowPaymentTypeDropdown] = useState(false)
  const [selectedBankAccount, setSelectedBankAccount] = useState(null)
  const [bankAccounts, setBankAccounts] = useState([])
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [roundOff, setRoundOff] = useState(true)
  const [roundOffValue, setRoundOffValue] = useState('0')
  const [total, setTotal] = useState('')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [payFullAmount, setPayFullAmount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const [units, setUnits] = useState([])
  const paymentTypeDropdownRef = useRef(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [createdSale, setCreatedSale] = useState(null)
  
  const [items, setItems] = useState([
    { id: 1, item: '', itemId: null, qty: '', unit: 'NONE', price: '', priceType: 'WITHOUT_TAX', discountPercent: '', discountAmount: '', taxPercent: '', taxAmount: '', amount: '' },
    { id: 2, item: '', itemId: null, qty: '', unit: 'NONE', price: '', priceType: 'WITHOUT_TAX', discountPercent: '', discountAmount: '', taxPercent: '', taxAmount: '', amount: '' }
  ])

  // Initialize page with authentication check
  useEffect(() => {
    const initializePage = async () => {
      try {
        console.log('Initializing Sale page...')
        const userData = authService.getCurrentUserFromStorage()
        console.log('User data from storage:', userData)
        console.log('Is authenticated:', authService.isAuthenticated())
        
        // Check if user is authenticated
        if (!userData || !authService.isAuthenticated()) {
          console.log('User not authenticated, redirecting to login')
          router.push('/auth/login')
          return
        }

        setUser(userData)
        setIsLoading(false)
        
        // Test authentication with a simple endpoint first
        await testAuthentication()
        
        // Fetch categories and units after authentication is confirmed
        await fetchCategories()
        await fetchUnits()
      } catch (error) {
        console.error('Error initializing page:', error)
        // Only redirect to login if it's an authentication error
        if (error.response?.status === 401) {
          console.log('401 error - redirecting to login')
          authService.logout()
          router.push('/auth/login')
        } else {
          console.log('Non-auth error:', error.message)
          setIsLoading(false)
        }
      }
    }

    initializePage()
  }, [router])

  // Check if token is valid (basic JWT structure check)
  const isTokenValid = (token) => {
    if (!token) return false
    
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.log('Sale page: Invalid JWT structure')
        return false
      }
      
      // Try to decode the payload to check if it's a valid JWT
      const payload = JSON.parse(atob(parts[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Sale page: Token has expired')
        return false
      }
      
      console.log('Sale page: Token structure is valid')
      return true
    } catch (error) {
      console.log('Sale page: Token is malformed:', error.message)
      return false
    }
  }

  // Test authentication with a simple endpoint
  const testAuthentication = async () => {
    try {
      const token = sessionStorage.getItem('token')
      console.log('Sale page: Testing authentication...')
      console.log('Sale page: Token exists:', token ? 'Yes' : 'No')
      
      if (!token) {
        console.log('Sale page: No token found, skipping auth test')
        return
      }
      
      // Check if token is valid before making API call
      if (!isTokenValid(token)) {
        console.log('Sale page: Token is invalid, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
      
      // Test with a simple endpoint that requires authentication
      const response = await api.get('/items')
      console.log('Sale page: Auth test successful, items count:', response.data?.length)
    } catch (error) {
      console.error('Sale page: Auth test failed:', error)
      console.error('Sale page: Auth test error details:', error.response?.status, error.response?.data)
      
      if (error.response?.status === 401) {
        console.log('Sale page: Authentication failed, token may be invalid or expired')
        console.log('Sale page: Clearing authentication and redirecting to login')
        // Clear authentication and redirect to login
        authService.logout()
        router.push('/auth/login')
        return
      }
    }
  }

  // Fetch categories and units
  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem('token')
      console.log('Sale page: Fetching categories...')
      
      if (!token) {
        console.log('Sale page: No token found, skipping categories fetch')
        return
      }
      
      // Check if token is valid before making API call
      if (!isTokenValid(token)) {
        console.log('Sale page: Token is invalid, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
      
      const response = await api.get('/items/categories')
      console.log('Sale page: Categories response:', response.data)
      setCategories(response.data)
    } catch (error) {
      console.error('Sale page: Error fetching categories:', error)
      
      if (error.response?.status === 401) {
        console.log('Sale page: Categories fetch failed with 401, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
    }
  }

  const fetchUnits = async () => {
    try {
      const token = sessionStorage.getItem('token')
      console.log('Sale page: Fetching units...')
      
      if (!token) {
        console.log('Sale page: No token found, skipping units fetch')
        return
      }
      
      // Check if token is valid before making API call
      if (!isTokenValid(token)) {
        console.log('Sale page: Token is invalid, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
      
      const response = await api.get('/items/units')
      console.log('Sale page: Units response:', response.data)
      setUnits(response.data)
    } catch (error) {
      console.error('Sale page: Error fetching units:', error)
      
      if (error.response?.status === 401) {
        console.log('Sale page: Units fetch failed with 401, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
    }
  }

  // Bank account related functions
  const fetchBankAccounts = async () => {
    try {
      console.log('Sale page: Fetching bank accounts...')
      const response = await api.get('/bank-accounts')
      console.log('Sale page: Bank accounts response:', response.data)
      const accounts = response.data.bankAccounts || response.data || []
      setBankAccounts(accounts)
    } catch (error) {
      console.error('Sale page: Error fetching bank accounts:', error)
      toast.error('Failed to load bank accounts')
    }
  }

  const handlePaymentTypeFocus = () => {
    setShowPaymentTypeDropdown(true)
  }

  const handlePaymentTypeSelect = (paymentType, bankAccount = null) => {
    setPaymentType(paymentType)
    setSelectedBankAccount(bankAccount)
    setShowPaymentTypeDropdown(false)
  }

  const handleAddBank = () => {
    setShowAddBankModal(true)
  }

  const handleAddBankSubmit = async (e, formData) => {
    try {
      console.log('Sale page: Creating bank account with data:', formData)
      const response = await api.post('/bank-accounts', formData)
      console.log('Sale page: Bank account created:', response.data)
      toast.success('Bank account added successfully')
      setShowAddBankModal(false)
      await fetchBankAccounts()
      
      // If this is the first bank account, select it
      if (response.data && response.data.id) {
        setSelectedBankAccount(response.data)
        setPaymentType(response.data.accountDisplayName || response.data.bankName)
      }
    } catch (error) {
      console.error('Sale page: Error adding bank account:', error)
      toast.error(error.response?.data?.error || 'Failed to add bank account')
    }
  }

  const handleAddCategory = async (categoryName) => {
    try {
      console.log('Sale page: Adding category:', categoryName)
      const response = await api.post('/items/categories', { name: categoryName })
      if (response.status === 200) {
        console.log('Sale page: Category added successfully')
        await fetchCategories() // Refresh categories list
        return response.data
      }
    } catch (error) {
      console.error('Sale page: Error adding category:', error)
      throw error
    }
  }

  const handleAddRow = () => {
    const newId = items.length + 1
    setItems([...items, { 
      id: newId, 
      item: '', 
      itemId: null, 
      qty: '', 
      unit: 'NONE', 
      price: '', 
      priceType: 'WITHOUT_TAX',
      discountPercent: '', 
      discountAmount: '', 
      taxPercent: '', 
      taxAmount: '', 
      amount: '' 
    }])
  }

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handlePartySelect = (party) => {
    setSelectedParty(party)
    // Set billing name and address from party data
    setBillingName(party.name || '')
    setBillingAddress(party.address || '')
  }

  const handlePhoneChange = (phone) => {
    setPhoneNo(phone)
  }

  const handleItemSelect = (item, rowId) => {
    setItems(items.map(row => 
      row.id === rowId 
        ? { 
            ...row, 
            item: item.name,
            itemId: item.id,
            price: item.salePrice || '',
            unit: item.unit || 'NONE',
            hsnCode: item.hsnCode || ''
          } 
        : row
    ))
  }

  // Calculate amounts for a single item (helper function)
  const calculateItemAmount = (item) => {
    const qty = parseFloat(item.qty) || 0
    const price = parseFloat(item.price) || 0
    const discountPercent = parseFloat(item.discountPercent) || 0
    const taxPercent = parseFloat(item.taxPercent) || 0
    const priceType = item.priceType || 'WITHOUT_TAX'

    let basePrice = price
    let taxAmount = 0
    let discountAmount = 0
    let amount = 0

    if (priceType === 'WITH_TAX') {
      // If price includes tax, we need to extract the tax amount first
      const taxRate = taxPercent / 100
      const priceWithoutTax = price / (1 + taxRate)
      basePrice = priceWithoutTax
      
      const subtotal = qty * basePrice
      discountAmount = (subtotal * discountPercent) / 100
      const taxableAmount = subtotal - discountAmount
      taxAmount = (taxableAmount * taxPercent) / 100
      amount = taxableAmount + taxAmount
    } else {
      // WITHOUT_TAX - original logic
      const subtotal = qty * basePrice
      discountAmount = (subtotal * discountPercent) / 100
      const taxableAmount = subtotal - discountAmount
      taxAmount = (taxableAmount * taxPercent) / 100
      amount = taxableAmount + taxAmount
    }

    return {
      discountAmount: discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      amount: amount.toFixed(2)
    }
  }

  // Handle received amount changes
  const handleReceivedAmountChange = (value) => {
    setReceivedAmount(value)
    
    // Auto-check if received amount matches total
    const totalAmount = parseFloat(total) || 0
    const receivedValue = parseFloat(value) || 0
    
    if (receivedValue === totalAmount && totalAmount > 0) {
      setPayFullAmount(true)
    } else {
      setPayFullAmount(false)
    }
  }

  // Handle checkbox change
  const handlePayFullAmountChange = (checked) => {
    setPayFullAmount(checked)
    
    if (checked) {
      // Auto-fill with total amount
      setReceivedAmount(total)
    } else {
      // Clear received amount
      setReceivedAmount('')
    }
  }

  // Calculate balance (Total - Received)
  const calculateBalance = () => {
    const totalAmount = parseFloat(total) || 0
    const received = parseFloat(receivedAmount) || 0
    return (totalAmount - received).toFixed(2)
  }

  // Calculate totals
  const calculateTotals = () => {
    const validItems = items.filter(item => item.itemId && item.qty && item.price)
    
    const subtotal = validItems.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0
      const price = parseFloat(item.price) || 0
      return sum + (qty * price)
    }, 0)

    const totalDiscount = validItems.reduce((sum, item) => {
      return sum + parseFloat(calculateItemAmount(item).discountAmount)
    }, 0)

    const totalTax = validItems.reduce((sum, item) => {
      return sum + parseFloat(calculateItemAmount(item).taxAmount)
    }, 0)

    const roundOffAmount = parseFloat(roundOffValue) || 0
    const totalAmount = subtotal - totalDiscount + totalTax + roundOffAmount

    setTotal(totalAmount.toFixed(2))
  }

  // Handle adding items
  const handleAddItem = async (itemData) => {
    try {
      // Check authentication before making request
      const token = sessionStorage.getItem('token')
      console.log('Sale page - Token exists:', token ? 'Yes' : 'No')
      
      if (!token) {
        alert('Please log in to add items')
        window.location.href = '/auth/login'
        return
      }

      // Validate required fields
      if (!itemData.name || itemData.name.trim() === '') {
        alert('Item name is required')
        return
      }
      
      if (!itemData.itemType) {
        alert('Item type is required')
        return
      }
      
      // Map form data to backend format
      const requestData = {
        name: itemData.name.trim(),
        code: itemData.code && itemData.code.trim() !== '' ? itemData.code.trim() : null,
        hsnCode: itemData.hsn || '',
        itemType: itemData.itemType,
        unit: itemData.unit || '',
        category: itemData.category || '',
        salePrice: itemData.salePrice && itemData.salePrice !== '' ? parseFloat(itemData.salePrice) : null,
        salePriceType: itemData.salePriceType || 'WITHOUT_TAX',
        saleDiscount: itemData.discount && itemData.discount !== '' ? parseFloat(itemData.discount) : null,
        saleDiscountType: itemData.discountType || 'PERCENTAGE',
        purchasePrice: itemData.purchasePrice && itemData.purchasePrice !== '' ? parseFloat(itemData.purchasePrice) : null,
        purchasePriceType: itemData.purchasePriceType || 'WITHOUT_TAX',
        taxRate: itemData.taxRate || 'None',
        openingQuantity: itemData.openingQuantity && itemData.openingQuantity !== '' ? parseFloat(itemData.openingQuantity) : null,
        openingPrice: itemData.atPrice && itemData.atPrice !== '' ? parseFloat(itemData.atPrice) : null,
        openingDate: itemData.asOfDate && itemData.asOfDate !== '' ? new Date(itemData.asOfDate.split('/').reverse().join('-')).toISOString() : null,
        minStock: itemData.minStock && itemData.minStock !== '' ? parseFloat(itemData.minStock) : null,
        location: itemData.location || '',
        imageUrl: null
      }
      
      console.log('Adding item from sale page:', requestData)
      const response = await api.post('/items', requestData)
      console.log('Item added successfully:', response.data)
      
      return response.data // Return the created item
    } catch (error) {
      console.error('Error adding item from sale page:', error)
      
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
      
      alert('Failed to add item: ' + errorMessage)
      throw error
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate customer selection based on sale type
    if (saleType === 'Credit' && !selectedParty) {
      alert('Please select a customer for credit transactions')
      return
    }

    const validItems = items.filter(item => item.itemId && item.qty && item.price)
    if (validItems.length === 0) {
      alert('Please add at least one item')
      return
    }

    // Check if user is authenticated
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('Please log in to continue')
      window.location.href = '/auth/login'
      return
    }

    console.log('Token found:', token ? 'Yes' : 'No')
    console.log('Making sale request...')

    setIsSubmitting(true)

    try {
      const saleData = {
        invoiceNumber: invoiceNumber || null, // Let backend generate if empty
        invoiceDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        partyId: selectedParty ? selectedParty.id : null,
        billingName: billingName || (selectedParty ? selectedParty.name : ''),
        billingAddress: billingAddress || (selectedParty ? selectedParty.address : ''),
        phoneNumber: phoneNo || (selectedParty ? selectedParty.phone : ''),
        saleType: saleType,
        paymentType: paymentType,
        bankAccountId: selectedBankAccount ? selectedBankAccount.id : null,
        roundOff: parseFloat(roundOffValue) || 0,
        totalAmount: parseFloat(total) || 0,
        receivedAmount: saleType === 'Credit' ? parseFloat(receivedAmount) || 0 : parseFloat(total) || 0,
        description: '',
        attachmentUrl: null,
        items: validItems.map(item => ({
          itemId: item.itemId,
          quantity: parseInt(item.qty),
          unit: item.unit || '',
          price: parseFloat(item.price),
          discountPercentage: parseFloat(item.discountPercent) || 0,
          discountAmount: parseFloat(calculateItemAmount(item).discountAmount),
          taxPercentage: parseFloat(item.taxPercent) || 0,
          taxAmount: parseFloat(calculateItemAmount(item).taxAmount),
          totalAmount: parseFloat(calculateItemAmount(item).amount),
          itemName: item.item || '',
          hsnCode: item.hsnCode || ''
        }))
      }

      console.log('Sale data:', saleData)
      console.log('Making POST request to /sales...')
      
      // Debug: Check token before making request
      const token = sessionStorage.getItem('token')
      console.log('Token exists:', token ? 'Yes' : 'No')
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token')
      
      // Call the actual backend API
      const response = await api.post('/sales', saleData)
      console.log('Sale created successfully:', response.data)
      
      toast.success('Sale saved successfully!')
      
      // Store the created sale and show invoice
      setCreatedSale(response.data)
      setShowInvoice(true)
    } catch (error) {
      console.error('Error creating sale:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      
      if (error.response?.status === 401) {
        console.log('401 Unauthorized - Token might be invalid or expired')
        toast.error('Session expired. Please log in again.')
        authService.logout()
        router.push('/auth/login')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to save sale. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add click outside handler for payment type dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paymentTypeDropdownRef.current && !paymentTypeDropdownRef.current.contains(event.target)) {
        setShowPaymentTypeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch bank accounts on component mount
  useEffect(() => {
    if (user) {
      fetchBankAccounts()
    }
  }, [user])

  useEffect(() => {
    calculateTotals()
  }, [items, roundOffValue])

  const unitOptions = [
    'NONE',
    'BAGS (Bag)',
    'BOTTLES (Btl)',
    'BOX (Box)',
    'BUNDLES (Bdl)',
    'CANS (Can)',
    'CARTONS (Ctn)',
    'DOZENS (Dzn)',
    'GRAMMES (Gm)',
    'KILOGRAMS (Kg)',
    'LITRE (Ltr)',
    'METERS (Mtr)',
    'MILILITRE (Ml)',
    'NUMBERS (Nos)',
    'PACKS (Pac)',
    'PAIRS (Prs)',
    'PIECES (Pcs)',
    'QUINTAL (Qtl)',
    'ROLLS (Rol)',
    'SQUARE FEET (Sqf)',
    'SQUARE METERS (Sqm)',
    'TABLETS (Tbs)'
  ]

  const taxOptions = [
    '',
    '0',
    '5',
    '12',
    '18',
    '28'
  ]

  const discountOptions = [
    '',
    '0',
    '5',
    '10',
    '15',
    '20',
    '25'
  ]

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
      
      <div className="p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Sale #1</h1>
              
              {/* Credit/Cash Toggle */}
              <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => setSaleType('Credit')}
                  className={`px-4 py-2 rounded-l-lg font-medium transition-colors ${
                    saleType === 'Credit'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Credit
                </button>
                <button
                  onClick={() => setSaleType('Cash')}
                  className={`px-4 py-2 rounded-r-lg font-medium transition-colors ${
                    saleType === 'Cash'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cash
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-gray-600"
                onClick={() => router.back()}
                title="Exit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Customer and Invoice Details */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                {/* First Row: Customer, Billing Name, Phone No. */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Customer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {saleType === 'Credit' ? 'Customer *' : 'Customer(Optional)'}
                    </label>
                    <PartySelector
                      onPartySelect={handlePartySelect}
                      selectedParty={selectedParty}
                      phoneNo={phoneNo}
                      onPhoneChange={handlePhoneChange}
                    />
                    {/* Show selected party balance under Customer field */}
                    {selectedParty && (
                      <div className="mt-1">
                        <span className={`text-xs font-medium ${
                          selectedParty.balanceType === 'TO_PAY' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          BAL: {Math.abs(selectedParty.currentBalance || 0).toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Billing Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Name(Optional)
                    </label>
                    <input
                      type="text"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Billing Name"
                    />
                  </div>

                  {/* Phone No. */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone No.
                    </label>
                    <input
                      type="text"
                      value={phoneNo}
                      onChange={(e) => setPhoneNo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Phone No."
                    />
                  </div>
                </div>

                {/* Second Row: Billing Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Address
                  </label>
                  <textarea
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Billing Address"
                    rows={3}
                  />
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="DD/MM/YYYY"
                    />
                    <svg className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State of supply
                  </label>
                  <select
                    value={stateOfSupply}
                    onChange={(e) => setStateOfSupply(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Odisha">Odisha</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Assam">Assam</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Goa">Goa</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
                    <option value="Daman and Diu">Daman and Diu</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Puducherry">Puducherry</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">#</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">ITEM</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">QTY</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">UNIT</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">
                      <div>PRICE/UNIT</div>
                      <div className="text-xs font-normal text-gray-400">Without Tax</div>
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">
                      <div>DISCOUNT</div>
                      <div className="flex justify-center space-x-2 text-xs font-normal text-gray-400">
                        <span>AMOUNT</span>
                        <span>%</span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">
                      <div>TAX</div>
                      <div className="flex justify-center space-x-2 text-xs font-normal text-gray-400">
                        <span>AMOUNT</span>
                        <span>%</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <span className="text-sm text-gray-600">{item.id}</span>
                      </td>
                      <td className="py-3 px-2">
                        <ItemSelector
                          onItemSelect={handleItemSelect}
                          selectedItem={item.itemId ? { id: item.itemId, name: item.item } : null}
                          rowId={item.id}
                          onItemChange={handleItemChange}
                          onAddItem={handleAddItem}
                          categories={categories}
                          units={units}
                          onAddCategory={handleAddCategory}
                          loading={isLoading}
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Qty"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {unitOptions.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-1">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Price"
                          />
                          <select
                            value={item.priceType}
                            onChange={(e) => handleItemChange(item.id, 'priceType', e.target.value)}
                            className="px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-white"
                          >
                            <option value="WITHOUT_TAX">W/O Tax</option>
                            <option value="WITH_TAX">W/ Tax</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-1">
                          <input
                            type="number"
                            value={calculateItemAmount(item).discountAmount}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm"
                            placeholder="Amount"
                            readOnly
                          />
                          <select
                            value={item.discountPercent}
                            onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)}
                            className="flex-1 px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                          >
                            <option value="">%</option>
                            {discountOptions.map(option => (
                              <option key={option} value={option}>{option}%</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-1">
                          <input
                            type="number"
                            value={calculateItemAmount(item).taxAmount}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm"
                            placeholder="Amount"
                            readOnly
                          />
                          <select
                            value={item.taxPercent}
                            onChange={(e) => handleItemChange(item.id, 'taxPercent', e.target.value)}
                            className="flex-1 px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                          >
                            <option value="">%</option>
                            {taxOptions.map(option => (
                              <option key={option} value={option}>{option}%</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={calculateItemAmount(item).amount}
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm"
                          placeholder="Amount"
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="2" className="py-3 px-2">
                      <button
                        onClick={handleAddRow}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        ADD ROW
                      </button>
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-700">
                      {items.filter(item => item.itemId && item.qty).reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)}
                    </td>
                    <td className="py-3 px-2"></td>
                    <td className="py-3 px-2"></td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-700">
                      {items.filter(item => item.itemId && item.qty && item.price).reduce((sum, item) => sum + parseFloat(calculateItemAmount(item).discountAmount), 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-700">
                      {items.filter(item => item.itemId && item.qty && item.price).reduce((sum, item) => sum + parseFloat(calculateItemAmount(item).taxAmount), 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-700">
                      {items.filter(item => item.itemId && item.qty && item.price).reduce((sum, item) => sum + parseFloat(calculateItemAmount(item).amount), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Additional Options and Total Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment and Additional Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type
                </label>
                <div className="relative" ref={paymentTypeDropdownRef}>
                  <input
                    type="text"
                    value={paymentType}
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
                      
                      {/* Bank Accounts */}
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
                <button
                  onClick={() => setShowAddBankModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Payment type</span>
                </button>
              </div>
              
              <div className="space-y-2">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>ADD DESCRIPTION</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>ADD IMAGE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Totals and Payment Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={roundOff}
                    onChange={(e) => setRoundOff(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Round Off</label>
                </div>
                <input
                  type="number"
                  value={roundOffValue}
                  onChange={(e) => setRoundOffValue(e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <label className="text-lg font-semibold text-gray-700">Total</label>
                <div className="text-xl font-bold text-gray-900">{total || '0'}</div>
              </div>

              {/* Show payment section only for Credit sales and when there are valid items */}
              {saleType === 'Credit' && items.filter(item => item.itemId && item.qty && item.price).length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={payFullAmount}
                        onChange={(e) => handlePayFullAmountChange(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">Received</label>
                    </div>
                    <input
                      type="number"
                      value={receivedAmount}
                      onChange={(e) => handleReceivedAmountChange(e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-200">
                    <label className="text-lg font-semibold text-gray-700">Balance</label>
                    <div className="text-xl font-bold text-gray-900">{calculateBalance()}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div></div>
          
          <div className="flex items-center space-x-3">
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center space-x-2">
              <span>Share</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>

        {/* Add Bank Modal */}
        {showAddBankModal && (
          <AddBankModal
            onClose={() => setShowAddBankModal(false)}
            onSubmit={handleAddBankSubmit}
          />
        )}

        {/* Sales Invoice Modal */}
        {showInvoice && createdSale && (
          <SalesInvoiceTemplate
            sale={createdSale}
            onClose={() => {
              setShowInvoice(false)
              setCreatedSale(null)
              router.back()
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

// Add Bank Modal Component
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
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account holder name"
                  required
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
                  <option value="FIXED">Fixed Deposit</option>
                </select>
              </div>
            </>
          )}

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
              {loading ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
