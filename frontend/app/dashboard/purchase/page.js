'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../lib/auth'
import Header from '../../../components/Header'
import PartySelector from '../../../components/PartySelector'
import ItemSelector from '../../../components/ItemSelector'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

export default function PurchasePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [billNumber, setBillNumber] = useState('')
  const [billDate, setBillDate] = useState(new Date().toLocaleDateString('en-GB'))
  const [stateOfSupply, setStateOfSupply] = useState('')
  const [selectedParty, setSelectedParty] = useState(null)
  const [phoneNo, setPhoneNo] = useState('')
  const [paymentType, setPaymentType] = useState('Cash')
  const [showPaymentTypeDropdown, setShowPaymentTypeDropdown] = useState(false)
  const [selectedBankAccount, setSelectedBankAccount] = useState(null)
  const [bankAccounts, setBankAccounts] = useState([])
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [roundOff, setRoundOff] = useState(true)
  const [roundOffValue, setRoundOffValue] = useState('0')
  const [total, setTotal] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [payFullAmount, setPayFullAmount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const [units, setUnits] = useState([])
  const paymentTypeDropdownRef = useRef(null)
  
  const [items, setItems] = useState([
    { id: 1, item: '', itemId: null, qty: '', unit: 'None', price: '', priceType: 'WITHOUT_TAX', discountPercent: '', discountAmount: '', taxPercent: '', taxAmount: '', amount: '' },
    { id: 2, item: '', itemId: null, qty: '', unit: 'None', price: '', priceType: 'WITHOUT_TAX', discountPercent: '', discountAmount: '', taxPercent: '', taxAmount: '', amount: '' }
  ])

  // Initialize page with authentication check
  useEffect(() => {
    const initializePage = async () => {
      try {
        console.log('Initializing Purchase page...')
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
        console.log('Purchase page: Invalid JWT structure')
        return false
      }
      
      // Try to decode the payload to check if it's a valid JWT
      const payload = JSON.parse(atob(parts[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Purchase page: Token has expired')
        return false
      }
      
      console.log('Purchase page: Token structure is valid')
      return true
    } catch (error) {
      console.log('Purchase page: Token is malformed:', error.message)
      return false
    }
  }

  // Test authentication with a simple endpoint
  const testAuthentication = async () => {
    try {
      const token = sessionStorage.getItem('token')
      console.log('Purchase page: Testing authentication...')
      console.log('Purchase page: Token exists:', token ? 'Yes' : 'No')
      
      if (!token) {
        console.log('Purchase page: No token found, skipping auth test')
        return
      }
      
      // Check if token is valid before making API call
      if (!isTokenValid(token)) {
        console.log('Purchase page: Token is invalid, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
      
      // Test with a simple endpoint that requires authentication
      const response = await api.get('/items')
      console.log('Purchase page: Auth test successful, items count:', response.data?.length)
    } catch (error) {
      console.error('Purchase page: Auth test failed:', error)
      console.error('Purchase page: Auth test error details:', error.response?.status, error.response?.data)
      
      if (error.response?.status === 401) {
        console.log('Purchase page: Authentication failed, token may be invalid or expired')
        console.log('Purchase page: Clearing authentication and redirecting to login')
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
      console.log('Purchase page: Fetching categories...')
      console.log('Purchase page: Token exists:', token ? 'Yes' : 'No')
      console.log('Purchase page: Token preview:', token ? token.substring(0, 20) + '...' : 'None')
      
      if (!token) {
        console.log('Purchase page: No token found, skipping categories fetch')
        return
      }
      
      // Check if token is valid before making API call
      if (!isTokenValid(token)) {
        console.log('Purchase page: Token is invalid, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
      
      const response = await api.get('/items/categories')
      console.log('Purchase page: Categories response:', response.data)
      setCategories(response.data)
    } catch (error) {
      console.error('Purchase page: Error fetching categories:', error)
      console.error('Purchase page: Error details:', error.response?.status, error.response?.data)
      console.error('Purchase page: Error config:', error.config)
      
      if (error.response?.status === 401) {
        console.log('Purchase page: Categories fetch failed with 401, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
    }
  }

  const fetchUnits = async () => {
    try {
      const token = sessionStorage.getItem('token')
      console.log('Purchase page: Fetching units...')
      console.log('Purchase page: Token exists:', token ? 'Yes' : 'No')
      
      if (!token) {
        console.log('Purchase page: No token found, skipping units fetch')
        return
      }
      
      // Check if token is valid before making API call
      if (!isTokenValid(token)) {
        console.log('Purchase page: Token is invalid, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
      
      const response = await api.get('/items/units')
      console.log('Purchase page: Units response:', response.data)
      setUnits(response.data)
    } catch (error) {
      console.error('Purchase page: Error fetching units:', error)
      console.error('Purchase page: Error details:', error.response?.status, error.response?.data)
      
      if (error.response?.status === 401) {
        console.log('Purchase page: Units fetch failed with 401, clearing authentication')
        authService.logout()
        router.push('/auth/login')
        return
      }
    }
  }

  // Bank account related functions
  const fetchBankAccounts = async () => {
    try {
      console.log('Fetching bank accounts...')
      const response = await api.get('/bank-accounts')
      console.log('Bank accounts response:', response.data)
      const accounts = response.data.bankAccounts || response.data || []
      setBankAccounts(accounts)
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
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
      console.log('Creating bank account with data:', formData)
      const response = await api.post('/bank-accounts', formData)
      console.log('Bank account created:', response.data)
      toast.success('Bank account added successfully')
      setShowAddBankModal(false)
      await fetchBankAccounts()
      
      // If this is the first bank account, select it
      if (response.data && response.data.id) {
        setSelectedBankAccount(response.data)
        setPaymentType(response.data.accountDisplayName || response.data.bankName)
      }
    } catch (error) {
      console.error('Error adding bank account:', error)
      toast.error(error.response?.data?.error || 'Failed to add bank account')
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

  const handleAddCategory = async (categoryName) => {
    try {
      console.log('Purchase page: Adding category:', categoryName)
      const response = await api.post('/items/categories', { name: categoryName })
      if (response.status === 200) {
        console.log('Purchase page: Category added successfully')
        await fetchCategories() // Refresh categories list
        return response.data
      }
    } catch (error) {
      console.error('Purchase page: Error adding category:', error)
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
      unit: 'None', 
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
            price: item.purchasePrice || '',
            unit: item.unit || 'None'
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

  // Handle paid amount changes
  const handlePaidAmountChange = (value) => {
    setPaidAmount(value)
    
    // Auto-check if paid amount matches total
    const totalAmount = parseFloat(total) || 0
    const paidValue = parseFloat(value) || 0
    
    if (paidValue === totalAmount && totalAmount > 0) {
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
      setPaidAmount(total)
    } else {
      // Clear paid amount
      setPaidAmount('')
    }
  }

  // Calculate balance (Total - Paid)
  const calculateBalance = () => {
    const totalAmount = parseFloat(total) || 0
    const paid = parseFloat(paidAmount) || 0
    return (totalAmount - paid).toFixed(2)
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

  // Handle adding items (same logic as items page)
  const handleAddItem = async (itemData) => {
    try {
      // Check authentication before making request
      const token = sessionStorage.getItem('token')
      console.log('Purchase page - Token exists:', token ? 'Yes' : 'No')
      console.log('Purchase page - Token preview:', token ? token.substring(0, 20) + '...' : 'None')
      
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
      
      // Map form data to backend format (same as items page)
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
      
      console.log('Adding item from purchase page:', requestData)
      const response = await api.post('/items', requestData)
      console.log('Item added successfully:', response.data)
      
      return response.data // Return the created item
    } catch (error) {
      console.error('Error adding item from purchase page:', error)
      
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
    if (!selectedParty) {
      alert('Please select a party')
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
    console.log('Making purchase request...')

    // Test authentication first
    try {
      const testResponse = await api.get('/items')
      console.log('Auth test successful:', testResponse.status)
      console.log('Items count:', testResponse.data?.length)
    } catch (authError) {
      console.error('Auth test failed:', authError)
      console.error('Auth error response:', authError.response)
      console.error('Auth error status:', authError.response?.status)
      
      if (authError.response?.status === 401) {
        alert('Authentication failed. Please log in again.')
        window.location.href = '/auth/login'
        return
      } else if (!authError.response) {
        alert('Backend server is not running. Please start the backend server.')
        return
      } else {
        alert('Connection error: ' + (authError.response?.data || authError.message))
        return
      }
    }

    // Test purchase endpoint specifically
    try {
      console.log('Testing purchase endpoint...')
      const purchaseTestResponse = await api.get('/purchases')
      console.log('Purchase endpoint test successful:', purchaseTestResponse.status)
    } catch (purchaseError) {
      console.error('Purchase endpoint test failed:', purchaseError)
      console.error('Purchase error response:', purchaseError.response)
      console.error('Purchase error status:', purchaseError.response?.status)
      
      if (purchaseError.response?.status === 401) {
        alert('Purchase endpoint authentication failed. Please log in again.')
        window.location.href = '/auth/login'
        return
      } else {
        console.log('Purchase endpoint error (might be expected for GET):', purchaseError.response?.status)
      }
    }

    setIsSubmitting(true)

    try {
      const purchaseData = {
        billNumber: billNumber || null,
        billDate: new Date(billDate.split('/').reverse().join('-')).toISOString(),
        stateOfSupply: stateOfSupply || null,
        partyId: selectedParty.id,
        phoneNo: phoneNo || null,
        paymentType: paymentType,
        roundOff: parseFloat(roundOffValue) || 0,
        paidAmount: parseFloat(paidAmount) || 0,
        description: null,
        items: validItems.map(item => ({
          itemId: item.itemId,
          itemName: item.item,
          quantity: parseFloat(item.qty),
          unit: item.unit,
          pricePerUnit: parseFloat(item.price),
          discountPercent: parseFloat(item.discountPercent) || 0,
          discountAmount: parseFloat(calculateItemAmount(item).discountAmount),
          taxPercent: parseFloat(item.taxPercent) || 0,
          taxAmount: parseFloat(calculateItemAmount(item).taxAmount)
        }))
      }

      console.log('Purchase data:', purchaseData)
      console.log('Making POST request to /purchases...')
      console.log('Request headers will include Authorization:', token ? 'Yes' : 'No')
      
      const response = await api.post('/purchases', purchaseData)
      
      console.log('Purchase response:', response)
      if (response.status === 200) {
        toast.success('Purchase created successfully!')
        // Navigate back to previous page after successful save
        router.back()
      }
    } catch (error) {
      console.error('Error creating purchase:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.')
        window.location.href = '/auth/login'
      } else {
        alert('Failed to create purchase: ' + (error.response?.data || error.message))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Note: Removed calculateItemAmounts useEffect to prevent infinite loop
  // Amounts are now calculated on-the-fly when rendering

  useEffect(() => {
    calculateTotals()
  }, [items, roundOffValue])

  const unitOptions = [
    'None',
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
              <h1 className="text-2xl font-bold text-gray-900">Purchase #1</h1>
              <h2 className="text-lg font-semibold text-gray-700">Purchase</h2>
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

          {/* Customer/Supplier and Bill Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer/Supplier Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search by Name/Phone *
                  </label>
                  <PartySelector
                    onPartySelect={handlePartySelect}
                    selectedParty={selectedParty}
                    phoneNo={phoneNo}
                    onPhoneChange={handlePhoneChange}
                  />
                </div>
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

              {/* Bill Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bill Number
                  </label>
                  <input
                    type="text"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bill Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bill Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={billDate}
                      onChange={(e) => setBillDate(e.target.value)}
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
                    <th className="text-left py-3 px-2 font-medium text-gray-700">PRICE/UNIT</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">DISCOUNT (%)</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">DISCOUNT (AMOUNT)</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">TAX (%)</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">TAX (AMOUNT)</th>
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
                        <select
                          value={item.discountPercent}
                          onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="">Select</option>
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="10">10%</option>
                          <option value="15">15%</option>
                          <option value="20">20%</option>
                          <option value="25">25%</option>
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={calculateItemAmount(item).discountAmount}
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm"
                          placeholder="Amount"
                          readOnly
                        />
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={item.taxPercent}
                          onChange={(e) => handleItemChange(item.id, 'taxPercent', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="">Select</option>
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={calculateItemAmount(item).taxAmount}
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm"
                          placeholder="Amount"
                          readOnly
                        />
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
                    <td className="py-3 px-2"></td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-700">
                      {items.filter(item => item.itemId && item.qty && item.price).reduce((sum, item) => sum + parseFloat(calculateItemAmount(item).discountAmount), 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-2"></td>
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

        {/* Payment and Attachments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment and Attachments */}
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
              </div>
              
              <div className="space-y-2">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>ADD DESCRIPTION</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>ADD IMAGE</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>ADD DOCUMENT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Totals and Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={roundOff}
                  onChange={(e) => setRoundOff(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Round Off</label>
                <input
                  type="number"
                  value={roundOffValue}
                  onChange={(e) => setRoundOffValue(e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total
                </label>
                <input
                  type="text"
                  value={total}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
                  placeholder="Total Amount"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    checked={payFullAmount}
                    onChange={(e) => handlePayFullAmountChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Pay full amount</label>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => handlePaidAmountChange(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-500 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paid Amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balance
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium">
                  {calculateBalance()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            Upload Bill
          </button>
          
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
      </div>

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <AddBankModal
          onClose={() => setShowAddBankModal(false)}
          onSubmit={handleAddBankSubmit}
        />
      )}
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
