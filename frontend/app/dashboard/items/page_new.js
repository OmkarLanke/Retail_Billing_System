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
        
        // Load data based on active tab
        if (activeTab === 'PRODUCTS') {
          await fetchProducts()
        } else if (activeTab === 'SERVICES') {
          await fetchServices()
        } else if (activeTab === 'CATEGORY') {
          await fetchCategories()
        } else if (activeTab === 'UNITS') {
          await fetchUnits()
        }
        
      } catch (error) {
        console.error('Error initializing page:', error)
        toast.error('Failed to initialize page')
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [activeTab, router])

  // API Functions
  const fetchProducts = async () => {
    try {
      const response = await api.get('/items?type=PRODUCT')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    }
  }

  const fetchServices = async () => {
    try {
      const response = await api.get('/items?type=SERVICE')
      setServices(response.data)
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Failed to fetch services')
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

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
  }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
  }

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
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Products Table Header */}
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

                    {/* Products List */}
                    <div className="space-y-1">
                      {products.filter(product => 
                        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            selectedProduct?.id === product.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.code}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-green-600">
                                {product.currentQuantity || 0}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedProductForMenu(product)
                                  setMenuPosition({ x: e.clientX, y: e.clientY })
                                  setShowProductMenu(true)
                                }}
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

                {/* Right Panel - Product Details */}
                {!showAddProductModal && selectedProduct && (
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name?.toUpperCase()}</h2>
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
                        <div className="text-sm text-gray-600 mb-1">SALE PRICE: ₹{selectedProduct.salePrice || '0.00'} (excl)</div>
                        <div className="text-sm text-gray-600">PURCHASE PRICE: ₹{selectedProduct.purchasePrice || '0.00'} (excl)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">STOCK QUANTITY: {selectedProduct.currentQuantity || 0}</div>
                        <div className="text-sm text-green-600 font-medium">STOCK VALUE: ₹{selectedProduct.stockValue ? selectedProduct.stockValue.toFixed(2) : '0.00'}</div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">TRANSACTIONS</h3>
                      <div className="space-y-2">
                        {selectedProduct.transactions?.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                transaction.transactionType === 'SALE' ? 'bg-green-500' : 
                                transaction.transactionType === 'PURCHASE' ? 'bg-blue-500' :
                                transaction.transactionType === 'ADJUSTMENT' ? 
                                  (transaction.adjustmentType === 'ADD' ? 'bg-orange-500' : 'bg-red-500') :
                                'bg-gray-500'
                              }`}></div>
                              <span className="text-sm">
                                {transaction.transactionType === 'ADJUSTMENT' ? 
                                  (transaction.adjustmentType === 'ADD' ? 'Add Adjustment' : 'Reduce Adjustment') :
                                  transaction.transactionType
                                }
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {transaction.quantity} {selectedProduct.unit} - ₹{transaction.pricePerUnit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Product Modal */}
                {showAddProductModal && (
                  <div className="flex-1 p-6">
                    <div className="bg-white rounded-lg w-full max-w-4xl mx-auto">
                      <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isEditMode ? 'Edit Product' : 'Add Product'}
                        </h3>
                        <button
                          onClick={() => {
                            setShowAddProductModal(false)
                            setIsEditMode(false)
                            setEditingProduct(null)
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-600">Product form will be implemented here...</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'SERVICES' && (
              <>
                {/* Left Panel - Services List */}
                {!showAddServiceModal && (
                  <div className="w-1/3 border-r border-gray-200 p-4">
                    {/* Bulk Items Update Card */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Bulk Items Update</h4>
                            <p className="text-sm text-gray-600">Update/Edit multiple items at a time.</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">SERVICES</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setIsEditServiceMode(false)
                            setEditingService(null)
                            setShowAddServiceModal(true)
                          }}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                        >
                          <span>+ Add Service</span>
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
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Services Table Header */}
                    <div className="mb-2 text-sm font-medium text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span>ITEM</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                        </svg>
                      </div>
                    </div>

                    {/* Services List */}
                    <div className="space-y-1">
                      {services.filter(service => 
                        service.name?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((service) => (
                        <div
                          key={service.id}
                          onClick={() => handleServiceSelect(service)}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            selectedService?.id === service.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{service.name}</div>
                              <div className="text-xs text-gray-500">{service.code}</div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedServiceForMenu(service)
                                setMenuPosition({ x: e.clientX, y: e.clientY })
                                setShowServiceMenu(true)
                              }}
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

                {/* Right Panel - Service Details */}
                {!showAddServiceModal && selectedService && (
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedService.name?.toUpperCase()}</h2>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-sm text-gray-600">SALE PRICE: ₹{selectedService.salePrice || '0.00'}</div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">TRANSACTIONS</h3>
                      <div className="space-y-2">
                        {selectedService.transactions?.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">{transaction.transactionType}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {transaction.quantity} - ₹{transaction.pricePerUnit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Service Modal */}
                {showAddServiceModal && (
                  <div className="flex-1 p-6">
                    <div className="bg-white rounded-lg w-full max-w-4xl mx-auto">
                      <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isEditServiceMode ? 'Edit Service' : 'Add Service'}
                        </h3>
                        <button
                          onClick={() => {
                            setShowAddServiceModal(false)
                            setIsEditServiceMode(false)
                            setEditingService(null)
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-600">Service form will be implemented here...</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'CATEGORY' && (
              <div className="flex-1 p-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">CATEGORIES</h3>
                  <p className="text-gray-600">Category management will be implemented here...</p>
                </div>
              </div>
            )}

            {activeTab === 'UNITS' && (
              <div className="flex-1 p-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">UNITS</h3>
                  <p className="text-gray-600">Units management will be implemented here...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
