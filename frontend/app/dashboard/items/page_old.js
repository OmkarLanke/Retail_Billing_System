'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../lib/auth'
import toast from 'react-hot-toast'
import Sidebar from '../../../components/Sidebar'
import api from '../../../lib/api'

export default function ItemsPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('PRODUCTS')
  
  // Products state
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductMenu, setShowProductMenu] = useState(false)
  const [selectedProductForMenu, setSelectedProductForMenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    adjustmentType: 'ADD',
    quantity: '',
    pricePerUnit: '',
    adjustmentDate: new Date().toISOString().split('T')[0],
    details: '',
    reason: ''
  })
  
  // Services state
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [isEditServiceMode, setIsEditServiceMode] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [showServiceMenu, setShowServiceMenu] = useState(false)
  const [selectedServiceForMenu, setSelectedServiceForMenu] = useState(null)
  
  // Categories state
  const [categories, setCategories] = useState([])
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  
  // Units state
  const [units, setUnits] = useState([])
  const [showAddUnitModal, setShowAddUnitModal] = useState(false)
  const [newUnit, setNewUnit] = useState({ name: '', shortName: '' })
  
  // Common state
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const initializePage = async () => {
      try {
        console.log('Initializing Items page...')
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
        console.log('User set, fetching data...')
        
        // Fetch initial data
        await Promise.all([
          fetchItems(),
          fetchCategories(),
          fetchUnits()
        ])
        
        console.log('Items page initialized successfully')
      } catch (error) {
        console.error('Error initializing page:', error)
        // Only redirect to login if it's an authentication error
        if (error.response?.status === 401) {
          console.log('401 error - redirecting to login')
          authService.logout()
          router.push('/auth/login')
        } else {
          console.log('Non-auth error:', error.message)
          toast.error('Failed to load page data')
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [router])

  // Close item menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showItemMenu && !event.target.closest('.item-menu')) {
        setShowItemMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showItemMenu])

  // API Integration Functions
  const fetchItems = async () => {
    try {
      const response = await api.get('/items')
      console.log('Fetched items:', response.data)
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch items')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/items/categories')
      setCategories(response.data.map(cat => cat.name))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await api.get('/items/units')
      setUnits(response.data)
    } catch (error) {
      console.error('Error fetching units:', error)
    }
  }

  const fetchItemTransactions = async (itemId) => {
    try {
      const response = await api.get(`/items/${itemId}/transactions`)
      setTransactions(response.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to fetch transactions')
    }
  }

  const handleItemSelect = async (item) => {
    setSelectedItem(item)
    await fetchItemTransactions(item.id)
  }

  const handleAddItem = async (itemData) => {
    try {
      setLoading(true)
      const response = await api.post('/items', itemData)
      
      setItems(prev => [...prev, response.data])
      setShowAddItemModal(false)
      setIsEditMode(false)
      setEditingItem(null)
      toast.success('Item added successfully')
      
      // If this is the first item, select it
      if (items.length === 0) {
        await handleItemSelect(response.data)
      }
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateItem = async (itemData) => {
    try {
      setLoading(true)
      console.log('Updating item:', itemData)
      const response = await api.put(`/items/${editingItem.id}`, itemData)
      console.log('Item updated successfully:', response.data)
      console.log('Updated item currentQuantity:', response.data.currentQuantity)
      
      // Small delay to ensure backend has processed the adjustment transaction
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Refresh items list
      await fetchItems()
      
      // Update selected item if it's the same one being edited
      if (selectedItem && selectedItem.id === editingItem.id) {
        setSelectedItem(response.data)
      }
      
      // Close modal
      setShowAddItemModal(false)
      setIsEditMode(false)
      setEditingItem(null)
      
      toast.success('Item updated successfully')
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (categoryName) => {
    try {
      console.log('Adding category:', categoryName)
      const response = await api.post('/items/categories', {
        name: categoryName
      })
      console.log('Category response:', response.data)
      
      setCategories(prev => [...prev, response.data.name])
      toast.success('Category added successfully')
    } catch (error) {
      console.error('Error adding category:', error)
      console.error('Error response:', error.response?.data)
      toast.error('Failed to add category: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleAdjustStock = async () => {
    if (!selectedItem) return
    
    try {
      setLoading(true)
      const requestData = {
        itemId: selectedItem.id,
        adjustmentType: adjustmentData.adjustmentType,
        quantity: parseFloat(adjustmentData.quantity),
        pricePerUnit: parseFloat(adjustmentData.pricePerUnit),
        adjustmentDate: new Date(adjustmentData.adjustmentDate).toISOString(),
        details: adjustmentData.details,
        reason: adjustmentData.reason
      }
      
      console.log('Adjusting stock:', requestData)
      const response = await api.post('/items/adjust-stock', requestData)
      
      // Update the selected item with new data
      setSelectedItem(response.data)
      
      // Refresh the items list
      await fetchItems()
      
      // Close modal and reset form
      setShowAdjustStockModal(false)
      setAdjustmentData({
        adjustmentType: 'ADD',
        quantity: '',
        pricePerUnit: '',
        adjustmentDate: new Date().toISOString().split('T')[0],
        details: '',
        reason: ''
      })
      
      toast.success('Stock adjusted successfully')
      console.log('Stock adjustment successful:', response.data)
    } catch (error) {
      console.error('Error adjusting stock:', error)
      toast.error('Failed to adjust stock')
    } finally {
      setLoading(false)
    }
  }

  const handleItemMenuClick = (event, item) => {
    event.stopPropagation()
    setSelectedItemForMenu(item)
    setMenuPosition({ x: event.clientX, y: event.clientY })
    setShowItemMenu(true)
  }

  const handleViewEditItem = (item) => {
    setEditingItem(item)
    setIsEditMode(true)
    setShowAddItemModal(true)
    setShowItemMenu(false)
    console.log('View/Edit item:', item)
  }

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        setLoading(true)
        await api.delete(`/items/${item.id}`)
        toast.success('Item deleted successfully')
        
        // Refresh items list
        await fetchItems()
        
        // If deleted item was selected, clear selection
        if (selectedItem && selectedItem.id === item.id) {
          setSelectedItem(null)
        }
      } catch (error) {
        console.error('Error deleting item:', error)
        toast.error('Failed to delete item')
      } finally {
        setLoading(false)
        setShowItemMenu(false)
      }
    }
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/auth/login')
  }

  const filteredItems = items.filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTransactions = transactions.filter(transaction =>
    (transaction.partyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.invoiceRef || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar */}
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

        {/* Main Content Area */}
        <div className="flex-1 bg-white">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('PRODUCTS')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'PRODUCTS'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                PRODUCTS
              </button>
              <button
                onClick={() => setActiveTab('SERVICES')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'SERVICES'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                SERVICES
              </button>
              <button
                onClick={() => setActiveTab('CATEGORY')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'CATEGORY'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                CATEGORY
              </button>
              <button
                onClick={() => setActiveTab('UNITS')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'UNITS'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                UNITS
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="h-full flex">
            {activeTab === 'PRODUCTS' && (
              <>
                {/* Left Panel - Products List */}
                {!showAddProductModal && (
                  <div className="w-1/3 border-r border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">PRODUCTS</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setIsEditMode(false)
                            setEditingProduct(null)
                            setShowAddProductModal(true)
                          }}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                        >
                          <span>+ Add Item</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button className="text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Items Table Header */}
              <div className="grid grid-cols-2 gap-4 mb-2 text-sm font-medium text-gray-500">
                <div className="flex items-center space-x-1">
                  <span>ITEM</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </div>
                <div className="flex items-center space-x-1">
                  <span>QUANTITY</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedItem?.id === item.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-green-600">{item.currentQuantity || 0}</div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={(e) => handleItemMenuClick(e, item)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            )}

            {/* Right Panel - Item Details or Add Item Form */}
            <div className="flex-1 p-6">
              {showAddItemModal ? (
                // Add Item Form
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Item' : 'Add Item'}</h1>
                    <button
                      onClick={() => setShowAddItemModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Back to Items
                    </button>
                  </div>
                  
                  <AddItemModal
                    onClose={() => {
                      setShowAddItemModal(false)
                      setIsEditMode(false)
                      setEditingItem(null)
                    }}
                    onSubmit={isEditMode ? handleUpdateItem : handleAddItem}
                    loading={loading}
                    categories={categories}
                    units={units}
                    onAddCategory={handleAddCategory}
                    isEditMode={isEditMode}
                    editingItem={editingItem}
                  />
                </div>
              ) : selectedItem ? (
                <>
                  {/* Item Details Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-gray-900">{selectedItem.name?.toUpperCase()}</h2>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </div>
                    <button 
                      onClick={() => setShowAdjustStockModal(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded text-sm flex items-center space-x-2 hover:bg-blue-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      <span>ADJUST ITEM</span>
                    </button>
                  </div>

                  {/* Price Information */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">SALE PRICE: ₹{selectedItem.salePrice || 0} (excl)</div>
                      {selectedItem.itemType === 'PRODUCT' && (
                        <div className="text-sm text-gray-600">PURCHASE PRICE: ₹{selectedItem.purchasePrice || 0} (excl)</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">STOCK QUANTITY: {selectedItem.currentQuantity || 0}</div>
                      <div className="text-sm text-gray-600">STOCK VALUE: ₹{selectedItem.stockValue ? selectedItem.stockValue.toFixed(2) : '0.00'}</div>
                    </div>
                  </div>

                  {/* Transactions Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">TRANSACTIONS</h3>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search transactions..."
                            className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <svg className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <button className="text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 font-medium text-gray-500">TYPE</th>
                            <th className="text-left py-2 font-medium text-gray-500">INVOICE/REF...</th>
                            <th className="text-left py-2 font-medium text-gray-500">NAME</th>
                            <th className="text-left py-2 font-medium text-gray-500">DATE ↓</th>
                            <th className="text-left py-2 font-medium text-gray-500">QUANTITY</th>
                            <th className="text-left py-2 font-medium text-gray-500">PRICE/UNIT</th>
                            <th className="text-left py-2 font-medium text-gray-500">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b border-gray-100">
                              <td className="py-2">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    transaction.transactionType === 'SALE' ? 'bg-green-500' : 
                                    transaction.transactionType === 'PURCHASE' ? 'bg-blue-500' :
                                    transaction.transactionType === 'ADJUSTMENT' ? 
                                      (transaction.adjustmentType === 'ADD' ? 'bg-orange-500' : 
                                       transaction.adjustmentType === 'REDUCE' ? 'bg-red-500' :
                                       (transaction.quantity > 0 ? 'bg-orange-500' : 'bg-red-500')) :
                                    'bg-gray-500'
                                  }`}></div>
                                  <span className="text-sm">
                                    {transaction.transactionType === 'ADJUSTMENT' ? 
                                      (transaction.adjustmentType === 'ADD' ? 'Add Adjustment' : 
                                       transaction.adjustmentType === 'REDUCE' ? 'Reduce Adjustment' :
                                       (transaction.quantity > 0 ? 'Add Adjustment' : 'Reduce Adjustment')) :
                                      transaction.transactionType
                                    }
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 text-sm text-gray-600">{transaction.invoiceRef || '-'}</td>
                              <td className="py-2 text-sm text-gray-600">{transaction.partyName || ''}</td>
                              <td className="py-2 text-sm text-gray-600">
                                {transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleDateString('en-GB') : ''}
                              </td>
                              <td className="py-2 text-sm text-gray-600">{transaction.quantity || ''}</td>
                              <td className="py-2 text-sm text-gray-600">
                                {transaction.pricePerUnit ? `₹ ${transaction.pricePerUnit}` : ''}
                              </td>
                              <td className="py-2 text-sm text-gray-600">{transaction.status || ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No item selected</h3>
                    <p className="text-gray-500">Select an item from the list to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Stock Adjustment</h2>
              <button
                onClick={() => setShowAdjustStockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Adjustment Type Toggle */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Adjustment Type:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAdjustmentData(prev => ({ ...prev, adjustmentType: 'ADD' }))}
                    className={`px-3 py-1 rounded text-sm ${
                      adjustmentData.adjustmentType === 'ADD' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Add Stock
                  </button>
                  <button
                    onClick={() => setAdjustmentData(prev => ({ ...prev, adjustmentType: 'REDUCE' }))}
                    className={`px-3 py-1 rounded text-sm ${
                      adjustmentData.adjustmentType === 'REDUCE' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Reduce Stock
                  </button>
                </div>
              </div>

              {/* Item Name Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <div className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1">
                  {selectedItem?.name}
                </div>
              </div>

              {/* Adjustment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Date</label>
                <input
                  type="date"
                  value={adjustmentData.adjustmentDate}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, adjustmentDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quantity and Unit Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Qty</label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Total Qty"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={selectedItem?.unit || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  >
                    <option>{selectedItem?.unit || 'Select Unit'}</option>
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">At Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustmentData.pricePerUnit}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                  placeholder="At Price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <input
                  type="text"
                  value={adjustmentData.details}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAdjustStockModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustStock}
                  disabled={loading || !adjustmentData.quantity || !adjustmentData.pricePerUnit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Menu */}
      {showItemMenu && selectedItemForMenu && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 item-menu"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            transform: 'translate(-100%, 0)'
          }}
        >
          <button
            onClick={() => handleViewEditItem(selectedItemForMenu)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>View/Edit</span>
          </button>
          <button
            onClick={() => handleDeleteItem(selectedItemForMenu)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}

    </div>
  )

}

// Add Item Modal Component
function AddItemModal({ onClose, onSubmit, loading, categories, units, onAddCategory, isEditMode = false, editingItem = null }) {
  const [formData, setFormData] = useState({
    itemType: 'PRODUCT', // PRODUCT or SERVICE
    name: '',
    hsn: '',
    unit: '',
    category: '',
    code: '',
    salePrice: '',
    salePriceType: 'WITHOUT_TAX',
    discount: '',
    discountType: 'PERCENTAGE',
    purchasePrice: '',
    purchasePriceType: 'WITHOUT_TAX',
    taxRate: 'NONE',
    openingQuantity: '',
    atPrice: '',
    asOfDate: new Date().toLocaleDateString('en-GB'),
    minStock: '',
    location: ''
  })
  const [activeTab, setActiveTab] = useState('pricing')
  const [showUnitDropdown, setShowUnitDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [localCategories, setLocalCategories] = useState(categories || [])
  const [newCategory, setNewCategory] = useState('')

  // Reset form data when switching to add mode
  useEffect(() => {
    if (!isEditMode) {
      setFormData({
        itemType: 'PRODUCT',
        name: '',
        hsn: '',
        unit: '',
        category: '',
        code: '',
        salePrice: '',
        salePriceType: 'WITHOUT_TAX',
        discount: '',
        discountType: 'PERCENTAGE',
        purchasePrice: '',
        purchasePriceType: 'WITHOUT_TAX',
        taxRate: 'NONE',
        openingQuantity: '',
        atPrice: '',
        asOfDate: new Date().toLocaleDateString('en-GB'),
        minStock: '',
        location: ''
      })
    }
  }, [isEditMode])

  // Populate form data when in edit mode
  useEffect(() => {
    if (isEditMode && editingItem) {
      setFormData({
        itemType: editingItem.itemType || 'PRODUCT',
        name: editingItem.name || '',
        hsn: editingItem.hsnCode || '',
        unit: editingItem.unit || '',
        category: editingItem.category || '',
        code: editingItem.code || '',
        salePrice: editingItem.salePrice || '',
        salePriceType: editingItem.salePriceType || 'WITHOUT_TAX',
        discount: editingItem.saleDiscount || '',
        discountType: editingItem.saleDiscountType || 'PERCENTAGE',
        purchasePrice: editingItem.purchasePrice || '',
        purchasePriceType: editingItem.purchasePriceType || 'WITHOUT_TAX',
        taxRate: editingItem.taxRate || 'NONE',
        openingQuantity: editingItem.openingQuantity || '',
        atPrice: editingItem.openingPrice || '',
        asOfDate: editingItem.openingDate ? new Date(editingItem.openingDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        minStock: editingItem.minStock || '',
        location: editingItem.location || ''
      })
    }
  }, [isEditMode, editingItem])

  const unitOptions = [
    { value: 'NONE', label: 'None' },
    { value: 'BAGS', label: 'BAGS (Bag)' },
    { value: 'BOTTLES', label: 'BOTTLES (Btl)' },
    { value: 'BOX', label: 'BOX (Box)' },
    { value: 'BUNDLES', label: 'BUNDLES (Bdl)' },
    { value: 'CANS', label: 'CANS (Can)' },
    { value: 'CARTONS', label: 'CARTONS (Ctn)' },
    { value: 'DOZENS', label: 'DOZENS (Dzn)' },
    { value: 'GRAMMES', label: 'GRAMMES (Gm)' },
    { value: 'KILOGRAMS', label: 'KILOGRAMS (Kg)' },
    { value: 'LITRE', label: 'LITRE (Ltr)' },
    { value: 'METERS', label: 'METERS (Mtr)' },
    { value: 'MILILITRE', label: 'MILILITRE (Ml)' },
    { value: 'NUMBERS', label: 'NUMBERS (Nos)' },
    { value: 'PACKS', label: 'PACKS (Pac)' },
    { value: 'PAIRS', label: 'PAIRS (Prs)' },
    { value: 'PIECES', label: 'PIECES (Pcs)' },
    { value: 'QUINTAL', label: 'QUINTAL (Qtl)' },
    { value: 'ROLLS', label: 'ROLLS (Rol)' },
    { value: 'SQUARE_FEET', label: 'SQUARE FEET (Sqf)' },
    { value: 'SQUARE_METERS', label: 'SQUARE METERS (Sqm)' },
    { value: 'TABLETS', label: 'TABLETS (Tbs)' }
  ]
  
  console.log('Units from props:', units)
  console.log('Unit options:', unitOptions)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !localCategories.includes(newCategory.trim())) {
      onAddCategory(newCategory.trim())
      handleInputChange('category', newCategory.trim())
      setNewCategory('')
      setShowAddCategoryModal(false)
      setShowCategoryDropdown(false)
    }
  }

  const handleCategorySelect = (category) => {
    handleInputChange('category', category)
    setShowCategoryDropdown(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Convert form data to backend format
    const itemData = {
      name: formData.name,
      code: formData.code,
      hsnCode: formData.hsn,
      itemType: formData.itemType,
      unit: formData.unit,
      category: formData.category,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      salePriceType: formData.salePriceType,
      saleDiscount: formData.saleDiscount ? parseFloat(formData.saleDiscount) : null,
      saleDiscountType: formData.saleDiscountType,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
      purchasePriceType: formData.purchasePriceType,
      taxRate: formData.taxRate,
      openingQuantity: formData.openingQuantity ? parseFloat(formData.openingQuantity) : null,
      openingPrice: formData.openingPrice ? parseFloat(formData.openingPrice) : null,
      openingDate: formData.openingDate ? new Date(formData.openingDate.split('/').reverse().join('-')) : null,
      minStock: formData.minStock ? parseFloat(formData.minStock) : null,
      location: formData.location,
      imageUrl: formData.imageUrl
    }
    
    onSubmit(itemData)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUnitDropdown && !event.target.closest('.unit-dropdown')) {
        setShowUnitDropdown(false)
      }
      if (showCategoryDropdown && !event.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUnitDropdown, showCategoryDropdown])

  return (
    <>
    <div className="bg-white rounded-lg w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Edit Item' : 'Add Item'}</h3>
            
            {/* Product/Service Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleInputChange('itemType', 'PRODUCT')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  formData.itemType === 'PRODUCT'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Product
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('itemType', 'SERVICE')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  formData.itemType === 'SERVICE'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Service
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Item Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.itemType === 'PRODUCT' ? 'Item Name *' : 'Service Name *'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={formData.itemType === 'PRODUCT' ? 'Enter item name' : 'Enter service name'}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.itemType === 'PRODUCT' ? 'Item HSN' : 'Service HSN'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.hsn}
                    onChange={(e) => handleInputChange('hsn', e.target.value)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter HSN code"
                  />
                  <div className="absolute right-3 top-2.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Unit
                </label>
                <div className="relative unit-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                  >
                    <span>{formData.unit ? unitOptions.find(opt => opt.value === formData.unit)?.label : 'Select Unit'}</span>
                    <svg className={`w-4 h-4 transition-transform ${showUnitDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUnitDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {unitOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleInputChange('unit', option.value)
                            setShowUnitDropdown(false)
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Item Image
                </label>
                <button
                  type="button"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center space-x-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Add Item Image</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative category-dropdown">
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    onClick={() => setShowCategoryDropdown(true)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Select Category"
                    readOnly
                  />
                  <div className="absolute right-3 top-2.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {showCategoryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {localCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategorySelect(category)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          {category}
                        </button>
                      ))}
                      <div className="border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCategoryDropdown(false)
                            setShowAddCategoryModal(true)
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center space-x-2 text-blue-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Add New Category</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.itemType === 'PRODUCT' ? 'Item Code' : 'Service Code'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter code"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Assign Code
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs - Only show Stock tab for Products */}
          {formData.itemType === 'PRODUCT' && (
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('pricing')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pricing'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pricing
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stock')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'stock'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Stock
                </button>
              </nav>
            </div>
          )}

          {/* Tab Content */}
          {(activeTab === 'pricing' || formData.itemType === 'SERVICE') && (
            <div className="space-y-6">
              {/* Sale Price Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Sale Price</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => handleInputChange('salePrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Type
                    </label>
                    <select
                      value={formData.salePriceType}
                      onChange={(e) => handleInputChange('salePriceType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="WITHOUT_TAX">Without Tax</option>
                      <option value="WITH_TAX">With Tax</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disc. On Sale Price
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => handleInputChange('discount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => handleInputChange('discountType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>+ Add Wholesale Price</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Purchase Price Section - Only for Products */}
              {formData.itemType === 'PRODUCT' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Purchase Price</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Price
                      </label>
                      <input
                        type="number"
                        value={formData.purchasePrice}
                        onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Type
                      </label>
                      <select
                        value={formData.purchasePriceType}
                        onChange={(e) => handleInputChange('purchasePriceType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="WITHOUT_TAX">Without Tax</option>
                        <option value="WITH_TAX">With Tax</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Taxes Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Taxes</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate
                  </label>
                  <select
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NONE">None</option>
                    <option value="IGST_0">IGST@0%</option>
                    <option value="GST_0">GST@0%</option>
                    <option value="IGST_0_25">IGST@0.25%</option>
                    <option value="GST_0_25">GST@0.25%</option>
                    <option value="IGST_3">IGST@3%</option>
                    <option value="GST_3">GST@3%</option>
                    <option value="IGST_5">IGST@5%</option>
                    <option value="GST_5">GST@5%</option>
                    <option value="IGST_12">IGST@12%</option>
                    <option value="GST_12">GST@12%</option>
                    <option value="IGST_18">IGST@18%</option>
                    <option value="GST_18">GST@18%</option>
                    <option value="IGST_28">IGST@28%</option>
                    <option value="GST_28">GST@28%</option>
                    <option value="EXEMPT">Exempt</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && formData.itemType === 'PRODUCT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.openingQuantity}
                    onChange={(e) => handleInputChange('openingQuantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    At Price
                  </label>
                  <input
                    type="number"
                    value={formData.atPrice}
                    onChange={(e) => handleInputChange('atPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    As Of Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.asOfDate}
                      onChange={(e) => handleInputChange('asOfDate', e.target.value)}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="DD/MM/YYYY"
                    />
                    <div className="absolute right-3 top-2.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock To Maintain
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange('minStock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Save & New
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
              <button 
                onClick={() => {
                  setShowAddCategoryModal(false)
                  setNewCategory('')
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryModal(false)
                  setNewCategory('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
