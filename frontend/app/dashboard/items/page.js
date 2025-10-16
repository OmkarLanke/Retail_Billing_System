'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../lib/auth'
import toast from 'react-hot-toast'
import Sidebar from '../../../components/Sidebar'
import AddItemModal from '../../../components/AddItemModal'
import AddCategoryModal from '../../../components/AddCategoryModal'
import Header from '../../../components/Header'
import api from '../../../lib/api'

export default function ItemsPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState([])
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [categories, setCategories] = useState([])
  const [units, setUnits] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    adjustmentType: 'ADD',
    quantity: '',
    pricePerUnit: '',
    adjustmentDate: new Date().toISOString().split('T')[0],
    details: ''
  })
  const [showItemMenu, setShowItemMenu] = useState(false)
  const [selectedItemForMenu, setSelectedItemForMenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeTab, setActiveTab] = useState('PRODUCTS')
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [serviceTransactions, setServiceTransactions] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [uncategorizedItems, setUncategorizedItems] = useState([])
  const [categorySearchTerm, setCategorySearchTerm] = useState('')
  const [itemSearchTerm, setItemSearchTerm] = useState('')
  const [isMoveMode, setIsMoveMode] = useState(false)
  const [selectedItemsToMove, setSelectedItemsToMove] = useState([])
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [isEditCategoryMode, setIsEditCategoryMode] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
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
          fetchServices(),
          fetchCategories(),
          fetchUnits(),
          fetchUncategorizedItems()
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

  // API Integration Functions
  const fetchItems = async () => {
    try {
      const response = await api.get('/items')
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch items')
    }
  }

  const fetchServices = async () => {
    try {
      const response = await api.get('/items')
      const services = response.data.filter(item => item.itemType === 'SERVICE')
      setServices(services)
      console.log('Services fetched:', services)
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Failed to fetch services')
    }
  }

  const fetchUncategorizedItems = async () => {
    try {
      const response = await api.get('/items')
      const uncategorized = response.data.filter(item => !item.category || item.category.trim() === '')
      setUncategorizedItems(uncategorized)
      console.log('Uncategorized items fetched:', uncategorized)
    } catch (error) {
      console.error('Error fetching uncategorized items:', error)
      toast.error('Failed to fetch uncategorized items')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/items/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories')
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await api.get('/items/units')
      setUnits(response.data)
    } catch (error) {
      console.error('Error fetching units:', error)
      toast.error('Failed to fetch units')
    }
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/auth/login')
  }

  // Original item functions
  const handleItemSelect = async (item) => {
    setSelectedItem(item)
    try {
      const response = await api.get(`/items/${item.id}/transactions`)
      setTransactions(response.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to fetch transactions')
    }
  }

  const handleAddItem = async (itemData) => {
    try {
      setLoading(true)
      
      // Validate required fields
      if (!itemData.name || itemData.name.trim() === '') {
        toast.error('Item name is required')
        return
      }
      
      if (!itemData.itemType) {
        toast.error('Item type is required')
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
      
      console.log('Adding item:', requestData)
      const response = await api.post('/items', requestData)
      console.log('Item added successfully:', response.data)
      
      // Refresh appropriate list based on item type
      await fetchItems()
      if (requestData.itemType === 'SERVICE') {
        await fetchServices()
      }
      await fetchUncategorizedItems()
      
      // Close modal
      setShowAddItemModal(false)
      setIsEditMode(false)
      setEditingItem(null)
      
      toast.success('Item added successfully')
    } catch (error) {
      console.error('Error adding item:', error)
      console.error('Error response:', error.response?.data)
      toast.error('Failed to add item: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateItem = async (itemData) => {
    try {
      setLoading(true)
      
      // Map form data to backend format
      const requestData = {
        name: itemData.name || '',
        code: itemData.code && itemData.code.trim() !== '' ? itemData.code.trim() : null,
        hsnCode: itemData.hsn || '',
        itemType: itemData.itemType || 'PRODUCT',
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
      
      console.log('Updating item:', requestData)
      const response = await api.put(`/items/${editingItem.id}`, requestData)
      console.log('Item updated successfully:', response.data)
      console.log('Updated item currentQuantity:', response.data.currentQuantity)
      
      // Small delay to ensure backend has processed the adjustment transaction
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Refresh appropriate list based on item type
      await fetchItems()
      if (requestData.itemType === 'SERVICE') {
        await fetchServices()
      }
      await fetchUncategorizedItems()
      
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
      console.error('Error response:', error.response?.data)
      toast.error('Failed to update item: ' + (error.response?.data?.message || error.message))
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
      
      // Refresh categories list to get the updated list with the new category
      await fetchCategories()
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
          pricePerUnit: adjustmentData.pricePerUnit ? parseFloat(adjustmentData.pricePerUnit) : null,
          adjustmentDate: new Date(adjustmentData.adjustmentDate).toISOString(),
          details: adjustmentData.details
        }
      
      console.log('Adjusting stock:', requestData)
      const response = await api.post('/items/adjust-stock', requestData)
      console.log('Stock adjusted successfully:', response.data)
      
      // Update selected item
      setSelectedItem(response.data)
      
      // Refresh items list
      await fetchItems()
      
      // Close modal and reset form
      setShowAdjustStockModal(false)
      setAdjustmentData({
        adjustmentType: 'ADD',
        quantity: '',
        pricePerUnit: '',
        adjustmentDate: new Date().toISOString().split('T')[0],
        details: ''
      })
      
      toast.success('Stock adjusted successfully')
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
        await fetchItems()
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


  const handleServiceSelect = (service) => {
    setSelectedService(service)
    // Filter transactions for selected service
    const serviceTrans = serviceTransactions.filter(t => t.serviceId === service.id)
    setServiceTransactions(serviceTrans)
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  const getItemsByCategory = (categoryName) => {
    if (!categoryName || categoryName === 'Items not in any Category') {
      return uncategorizedItems
    }
    return items.filter(item => item.category === categoryName)
  }

  const getCategoryItemCount = (categoryName) => {
    if (!categoryName || categoryName === 'Items not in any Category') {
      return uncategorizedItems.length
    }
    return items.filter(item => item.category === categoryName).length
  }

  const handleMoveToCategory = () => {
    if (!selectedCategory || selectedCategory === 'Items not in any Category') {
      toast.error('Please select a valid category')
      return
    }
    setIsMoveMode(true)
    setSelectedItemsToMove([])
  }

  const handleItemSelection = (itemId) => {
    setSelectedItemsToMove(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  const handleConfirmMove = async () => {
    if (selectedItemsToMove.length === 0) {
      toast.error('Please select at least one item to move')
      return
    }

    try {
      setLoading(true)
      
      // Update each selected item's category
      const updatePromises = selectedItemsToMove.map(itemId => {
        const item = uncategorizedItems.find(item => item.id === itemId)
        if (!item) return Promise.resolve()
        
        return api.put(`/items/${itemId}`, {
          ...item,
          category: selectedCategory
        })
      })

      await Promise.all(updatePromises)
      
      // Refresh all data
      await Promise.all([
        fetchItems(),
        fetchUncategorizedItems()
      ])
      
      // Reset move mode
      setIsMoveMode(false)
      setSelectedItemsToMove([])
      
      toast.success(`${selectedItemsToMove.length} item(s) moved to ${selectedCategory} successfully`)
    } catch (error) {
      console.error('Error moving items:', error)
      toast.error('Failed to move items: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCancelMove = () => {
    setIsMoveMode(false)
    setSelectedItemsToMove([])
  }

  const handleOpenAddCategoryModal = () => {
    setIsEditCategoryMode(false)
    setEditingCategory(null)
    setShowAddCategoryModal(true)
  }

  const handleEditCategory = (category) => {
    setIsEditCategoryMode(true)
    setEditingCategory(category)
    setShowAddCategoryModal(true)
  }

  const handleCategorySubmit = async (categoryData) => {
    try {
      setLoading(true)
      
      if (isEditCategoryMode && editingCategory) {
        // Update existing category
        const response = await api.put(`/items/categories/${editingCategory.id}`, {
          name: categoryData.name,
          description: categoryData.description
        })
        console.log('Category updated successfully:', response.data)
        toast.success('Category updated successfully')
      } else {
        // Add new category
        const response = await api.post('/items/categories', {
          name: categoryData.name,
          description: categoryData.description
        })
        console.log('Category added successfully:', response.data)
        toast.success('Category added successfully')
      }
      
      // Refresh categories list
      await fetchCategories()
      
      // Close modal
      setShowAddCategoryModal(false)
      setIsEditCategoryMode(false)
      setEditingCategory(null)
      
    } catch (error) {
      console.error('Error saving category:', error)
      console.error('Error response:', error.response?.data)
      toast.error('Failed to save category: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      await api.delete(`/items/categories/${categoryId}`)
      
      // Refresh categories list
      await fetchCategories()
      
      // If the deleted category was selected, clear selection
      if (selectedCategory && categories.find(cat => cat.id === categoryId)?.name === selectedCategory) {
        setSelectedCategory(null)
      }
      
      toast.success('Category deleted successfully')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }


  // Filter functions
  const filteredItems = items.filter(item =>
    item.itemType === 'PRODUCT' &&
    ((item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredServices = services.filter(service =>
    (service.name || '').toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
    (service.code || '').toLowerCase().includes(serviceSearchTerm.toLowerCase())
  )

  const filteredCategories = categories.filter(category =>
    (category.name || '').toLowerCase().includes(categorySearchTerm.toLowerCase())
  )

  const filteredUncategorizedItems = uncategorizedItems.filter(item =>
    (item.name || '').toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
    (item.code || '').toLowerCase().includes(itemSearchTerm.toLowerCase())
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
        <div className="flex-1 bg-white">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('PRODUCTS')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'PRODUCTS'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                PRODUCTS
              </button>
              <button
                onClick={() => setActiveTab('SERVICES')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'SERVICES'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                SERVICES
              </button>
              <button
                onClick={() => setActiveTab('CATEGORY')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'CATEGORY'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                CATEGORY
              </button>
              <button
                onClick={() => setActiveTab('UNITS')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'UNITS'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                UNITS
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'PRODUCTS' && (
            <div className="h-full flex">
              {/* Left Panel - Items List (hidden when adding item) */}
              {!showAddItemModal && (
              <div className="flex-shrink-0 border-r border-gray-200 p-4" style={{width: '24%'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">PRODUCTS</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsEditMode(false)
                      setEditingItem(null)
                      setShowAddItemModal(true)
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
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.code}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-green-600">
                          {item.currentQuantity || 0}
                        </div>
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
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Right Panel - Item Details (hidden when adding item) */}
            {!showAddItemModal && selectedItem && (
              <div className="flex-1 min-w-0 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name?.toUpperCase()}</h2>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
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

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">SALE PRICE: ₹{selectedItem.salePrice || '0.00'} (excl)</div>
                    <div className="text-sm text-gray-600">PURCHASE PRICE: ₹{selectedItem.purchasePrice || '0.00'} (excl)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">STOCK QUANTITY: {selectedItem.currentQuantity || 0}</div>
                    <div className="text-sm text-green-600 font-medium">STOCK VALUE: ₹{selectedItem.stockValue ? selectedItem.stockValue.toFixed(2) : '0.00'}</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">TRANSACTIONS</h3>
                  
                  {/* Search and Export */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        className="w-full pl-8 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <button className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Transaction Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <span>TYPE</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                              </svg>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <span>INVOICE/REF...</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                              </svg>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <span>NAME</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                              </svg>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <span>DATE</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                              </svg>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <span>QUANTITY</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                              </svg>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <span>PRICE/UNIT</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                              </svg>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <span>STATUS</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                              </svg>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {/* Actions column */}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  transaction.transactionType === 'SALE' ? 'bg-green-500' : 
                                  transaction.transactionType === 'PURCHASE' ? 'bg-pink-500' :
                                  transaction.transactionType === 'ADJUSTMENT' ? 
                                    (transaction.adjustmentType === 'ADD' ? 'bg-green-500' : 
                                     transaction.adjustmentType === 'REDUCE' ? 'bg-red-500' :
                                     (transaction.quantity > 0 ? 'bg-green-500' : 'bg-red-500')) :
                                  transaction.transactionType === 'OPENING_STOCK' ? 'bg-green-500' :
                                  'bg-gray-500'
                                }`}></div>
                                <span className="text-sm text-gray-900">
                                  {transaction.transactionType === 'ADJUSTMENT' ? 
                                    (transaction.adjustmentType === 'ADD' ? 'Add Adjustment' : 'Reduce Adjustm...') :
                                    transaction.transactionType === 'OPENING_STOCK' ? 'Opening Stock' :
                                    transaction.transactionType
                                  }
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {transaction.invoiceRef || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {transaction.partyName || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {transaction.transactionDate ? 
                                new Date(transaction.transactionDate).toLocaleDateString('en-GB') : 
                                '-'
                              }
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {transaction.quantity} {selectedItem.unit || ''}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {transaction.pricePerUnit ? `₹ ${transaction.pricePerUnit.toFixed(2)}` : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {transaction.status || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Right Panel - Placeholder when no item selected */}
            {!showAddItemModal && !selectedItem && (
              <div className="flex-1 min-w-0 p-6 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-lg mb-2">📦</div>
                  <div className="text-sm">Select an item to view details</div>
                </div>
              </div>
            )}

            {/* Add Item Modal */}
            {showAddItemModal && (
              <div className="flex-1 p-6">
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
                  defaultItemType={activeTab === 'SERVICES' ? 'SERVICE' : 'PRODUCT'}
                />
              </div>
            )}
            </div>
          )}

          {/* SERVICES Tab Content */}
          {activeTab === 'SERVICES' && (
            <div className="h-full flex">
              {/* Left Panel - Services List */}
              <div className="flex-shrink-0 border-r border-gray-200 p-4" style={{width: '24%'}}>
                {/* Bulk Items Update Card */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Bulk Items Update</h4>
                      <p className="text-xs text-gray-600">Update/Edit multiple items at a time.</p>
                    </div>
                  </div>
                </div>

                {/* Search and Add Service */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditMode(false)
                      setEditingItem(null)
                      setShowAddItemModal(true)
                    }}
                    className="bg-orange-500 text-white px-3 py-2 rounded text-sm flex items-center space-x-1"
                  >
                    <span>+ Add Service</span>
                  </button>
                  <button className="text-gray-500 p-2 hover:bg-gray-100 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                {/* Services List Header */}
                <div className="flex items-center space-x-1 mb-2 text-sm font-medium text-gray-500">
                  <span>SERVICE</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </div>

                {/* Services List */}
                <div className="space-y-1">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${
                        selectedService?.id === service.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">₹ {service.salePrice ? service.salePrice.toFixed(2) : '0.00'}</div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel - Service Details and Transactions */}
              {!showAddItemModal && selectedService && (
                <div className="flex-1 min-w-0 p-6">
                  {/* Service Header */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedService.name.toUpperCase()}</h2>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-green-600 font-medium">
                      SALE PRICE: ₹ {selectedService.salePrice ? selectedService.salePrice.toFixed(2) : '0.00'}
                    </div>
                  </div>

                  {/* Transactions Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">TRANSACTIONS</h3>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-64 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>TYPE</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>INVOICE/RE...</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>NAME</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>DATE</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>QUANTITY</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>PRICE/UNIT</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>STATUS</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {serviceTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span className="text-sm text-gray-900">Lite Sale</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {transaction.invoiceRef}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {transaction.partyName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {new Date(transaction.date).toLocaleDateString('en-GB')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {transaction.quantity}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                ₹ {transaction.pricePerUnit ? transaction.pricePerUnit.toFixed(2) : '0.00'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {transaction.status}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                <button className="text-gray-400 hover:text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Service Modal */}
              {showAddItemModal && (
                <div className="flex-1 p-6">
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
                    defaultItemType="SERVICE"
                  />
                </div>
              )}
            </div>
          )}

          {/* CATEGORY Tab Content */}
          {activeTab === 'CATEGORY' && (
            <div className="h-full flex">
              {/* Left Panel - Categories List */}
              <div className="flex-shrink-0 border-r border-gray-200 p-4" style={{width: '24%'}}>
                {/* Search and Add Category */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={handleOpenAddCategoryModal}
                    className="bg-orange-500 text-white px-3 py-2 rounded text-sm flex items-center space-x-1"
                  >
                    <span>+ Add Category</span>
                  </button>
                </div>

                {/* Categories List Header */}
                <div className="grid grid-cols-2 gap-4 mb-2 text-sm font-medium text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>CATEGORY</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>ITEM</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                  </div>
                </div>

                {/* Categories List */}
                <div className="space-y-1">
                  {/* Items not in any category */}
                  <div
                    onClick={() => handleCategorySelect('Items not in any Category')}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${
                      selectedCategory === 'Items not in any Category'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Items not in any Category</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{getCategoryItemCount('Items not in any Category')}</span>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Regular categories */}
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category.name)}
                      className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group ${
                        selectedCategory === category.name
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{category.name}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{getCategoryItemCount(category.name)}</span>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              // Toggle context menu for this category
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          {/* Simple dropdown menu */}
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditCategory(category)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteCategory(category.id)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel - Items in Selected Category */}
              <div className="flex-1 min-w-0 p-6">
                {selectedCategory && (
                  <>
                    {/* Category Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.toUpperCase()}</h2>
                          <div className="text-sm text-gray-500">{getCategoryItemCount(selectedCategory)} items</div>
                        </div>
                        {selectedCategory !== 'Items not in any Category' && !isMoveMode && (
                          <button 
                            onClick={handleMoveToCategory}
                            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                          >
                            Move To This Category
                          </button>
                        )}
                        {isMoveMode && (
                          <div className="flex space-x-2">
                            <button 
                              onClick={handleConfirmMove}
                              disabled={selectedItemsToMove.length === 0 || loading}
                              className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Moving...' : `Move ${selectedItemsToMove.length} Item(s)`}
                            </button>
                            <button 
                              onClick={handleCancelMove}
                              className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={itemSearchTerm}
                          onChange={(e) => setItemSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isMoveMode ? 'SELECT ITEMS TO MOVE TO THIS CATEGORY' : 'ITEMS'}
                        </h3>
                        {isMoveMode && (
                          <p className="text-sm text-gray-600 mt-1">
                            Click on items below to select them for moving to {selectedCategory}
                          </p>
                        )}
                      </div>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {isMoveMode && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                  type="checkbox"
                                  checked={selectedItemsToMove.length === uncategorizedItems.length && uncategorizedItems.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedItemsToMove(uncategorizedItems.map(item => item.id))
                                    } else {
                                      setSelectedItemsToMove([])
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </th>
                            )}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>NAME</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>QUANTITY</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>STOCK VALUE</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(isMoveMode ? uncategorizedItems : getItemsByCategory(selectedCategory))
                            .filter(item => 
                              (item.name || '').toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                              (item.code || '').toLowerCase().includes(itemSearchTerm.toLowerCase())
                            )
                            .map((item) => (
                            <tr 
                              key={item.id} 
                              className={`hover:bg-gray-50 ${isMoveMode ? 'cursor-pointer' : ''} ${
                                isMoveMode && selectedItemsToMove.includes(item.id) ? 'bg-blue-50' : ''
                              }`}
                              onClick={isMoveMode ? () => handleItemSelection(item.id) : undefined}
                            >
                              {isMoveMode && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={selectedItemsToMove.includes(item.id)}
                                    onChange={() => handleItemSelection(item.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </td>
                              )}
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {item.currentQuantity || 0}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                ₹ {item.stockValue ? item.stockValue.toFixed(2) : '0.00'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* UNITS Tab Content */}
          {activeTab === 'UNITS' && (
            <div className="p-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Units</h3>
                <p className="text-gray-500">Units management coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Stock Adjustment Modal */}
      {showAdjustStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Stock Adjustment</h3>
              <button 
                onClick={() => setShowAdjustStockModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Stock Adjustment Type Toggle */}
              <div className="mb-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${adjustmentData.adjustmentType === 'ADD' ? 'text-gray-900' : 'text-gray-500'}`}>
                      Add Stock
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAdjustmentData({...adjustmentData, adjustmentType: 'ADD'})}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          adjustmentData.adjustmentType === 'ADD' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          adjustmentData.adjustmentType === 'ADD' ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${adjustmentData.adjustmentType === 'REDUCE' ? 'text-gray-900' : 'text-gray-500'}`}>
                      Reduce Stock
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAdjustmentData({...adjustmentData, adjustmentType: 'REDUCE'})}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          adjustmentData.adjustmentType === 'REDUCE' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          adjustmentData.adjustmentType === 'REDUCE' ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Name and Adjustment Date */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={selectedItem?.name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={adjustmentData.adjustmentDate ? new Date(adjustmentData.adjustmentDate).toLocaleDateString('en-GB') : ''}
                      onChange={(e) => {
                        const date = new Date(e.target.value.split('/').reverse().join('-'))
                        setAdjustmentData({...adjustmentData, adjustmentDate: date.toISOString().split('T')[0]})
                      }}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="DD/MM/YYYY"
                    />
                    <svg className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quantity, Unit, and At Price */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Qty</label>
                  <input
                    type="number"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({...adjustmentData, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Total Qty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={selectedItem?.unit || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    <option value={selectedItem?.unit || ''}>{selectedItem?.unit || 'Unit'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">At Price</label>
                  <input
                    type="number"
                    value={adjustmentData.pricePerUnit}
                    onChange={(e) => setAdjustmentData({...adjustmentData, pricePerUnit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="At Price"
                  />
                </div>
              </div>

              {/* Details field - full width textarea */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea
                  value={adjustmentData.details}
                  onChange={(e) => setAdjustmentData({...adjustmentData, details: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter details or description for this adjustment..."
                  rows={3}
                />
              </div>


              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleAdjustStock}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
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
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
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

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <AddCategoryModal
          onClose={() => {
            setShowAddCategoryModal(false)
            setIsEditCategoryMode(false)
            setEditingCategory(null)
          }}
          onSubmit={handleCategorySubmit}
          loading={loading}
          isEditMode={isEditCategoryMode}
          editingCategory={editingCategory}
        />
      )}
      </div>
    </div>
  )
}
