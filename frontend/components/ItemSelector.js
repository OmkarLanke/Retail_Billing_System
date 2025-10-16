'use client'

import { useState, useEffect, useRef } from 'react'
import api from '../lib/api'
import AddItemModal from './AddItemModal'

export default function ItemSelector({ onItemSelect, selectedItem, rowId, onItemChange, onAddItem, categories: propCategories, units: propUnits, onAddCategory: propOnAddCategory, loading: propLoading }) {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [categories, setCategories] = useState(propCategories || [])
  const [units, setUnits] = useState(propUnits || [])
  const dropdownRef = useRef(null)

  // Fetch items on component mount (with authentication check)
  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (token) {
      fetchItems()
      // Only fetch categories and units if not provided as props
      if (!propCategories) {
        fetchCategories()
      }
      if (!propUnits) {
        fetchUnits()
      }
    } else {
      console.log('ItemSelector: No token found, skipping API calls')
    }
  }, [propCategories, propUnits])

  // Update local state when props change
  useEffect(() => {
    if (propCategories) {
      setCategories(propCategories)
    }
  }, [propCategories])

  useEffect(() => {
    if (propUnits) {
      setUnits(propUnits)
    }
  }, [propUnits])

  // Filter items based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items)
    } else {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredItems(filtered)
    }
  }, [searchTerm, items])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchItems = async () => {
    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.log('ItemSelector: No token for fetchItems, skipping')
        return
      }
      setIsLoading(true)
      const response = await api.get('/items')
      setItems(response.data)
      setFilteredItems(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem('token')
      console.log('ItemSelector: fetchCategories - Token exists:', token ? 'Yes' : 'No')
      if (!token) {
        console.log('ItemSelector: No token for fetchCategories, skipping')
        return
      }
      console.log('ItemSelector: Making API call to /categories')
      const response = await api.get('/items/categories')
      console.log('ItemSelector: Categories response:', response.data)
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      console.error('Error details:', error.response?.status, error.response?.data)
    }
  }

  const fetchUnits = async () => {
    try {
      const token = sessionStorage.getItem('token')
      console.log('ItemSelector: fetchUnits - Token exists:', token ? 'Yes' : 'No')
      if (!token) {
        console.log('ItemSelector: No token for fetchUnits, skipping')
        return
      }
      console.log('ItemSelector: Making API call to /units')
      const response = await api.get('/items/units')
      console.log('ItemSelector: Units response:', response.data)
      setUnits(response.data)
    } catch (error) {
      console.error('Error fetching units:', error)
      console.error('Error details:', error.response?.status, error.response?.data)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(true)
  }

  const handleItemSelect = (item) => {
    setSearchTerm(item.name)
    onItemSelect(item, rowId)
    setIsOpen(false)
  }

  const handleAddItem = () => {
    setShowAddItemModal(true)
  }

  const handleAddCategory = async (categoryName) => {
    try {
      // Use prop function if available, otherwise use local implementation
      if (propOnAddCategory) {
        return await propOnAddCategory(categoryName)
      }
      
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.log('ItemSelector: No token for handleAddCategory, skipping')
        throw new Error('No authentication token')
      }
      const response = await api.post('/items/categories', { name: categoryName })
      if (response.status === 200) {
        await fetchCategories() // Refresh categories list
        return response.data
      }
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  const handleAddItemSubmit = async (itemData) => {
    try {
      if (onAddItem) {
        // Use the parent's add item function (same logic as items page)
        const newItem = await onAddItem(itemData)
        if (newItem) {
          setShowAddItemModal(false)
          // Auto-select the newly added item
          handleItemSelect(newItem)
        }
      } else {
        // Fallback to direct API call if no callback provided
        const requestData = {
          name: itemData.name.trim(),
          code: itemData.code && itemData.code.trim() !== '' ? itemData.code.trim() : null,
          hsnCode: itemData.hsn || '',
          itemType: itemData.itemType,
          unit: itemData.unit || 'NONE',
          category: itemData.category || '',
          salePrice: itemData.salePrice ? parseFloat(itemData.salePrice) : null,
          salePriceType: itemData.salePriceType || 'WITHOUT_TAX',
          saleDiscount: itemData.discount ? parseFloat(itemData.discount) : null,
          saleDiscountType: itemData.discountType || 'PERCENTAGE',
          purchasePrice: itemData.purchasePrice ? parseFloat(itemData.purchasePrice) : null,
          purchasePriceType: itemData.purchasePriceType || 'WITHOUT_TAX',
          taxRate: itemData.taxRate || 'None',
          openingQuantity: itemData.openingQuantity ? parseFloat(itemData.openingQuantity) : 0,
          openingPrice: itemData.atPrice ? parseFloat(itemData.atPrice) : null,
          openingDate: itemData.asOfDate ? new Date(itemData.asOfDate.split('/').reverse().join('-')).toISOString() : null,
          minStock: itemData.minStock ? parseFloat(itemData.minStock) : null,
          location: itemData.location || ''
        }

        const response = await api.post('/items', requestData)
        
        if (response.status === 200) {
          await fetchItems()
          setShowAddItemModal(false)
          
          const newItem = response.data
          if (newItem) {
            handleItemSelect(newItem)
          }
        }
      }
    } catch (error) {
      console.error('Error adding item:', error)
      
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
    }
  }

  const getStockDisplay = (stock) => {
    if (stock === null || stock === undefined) {
      return <span className="text-gray-400">-</span>
    }
    
    const stockValue = parseFloat(stock)
    if (stockValue > 0) {
      return <span className="text-green-600 font-medium">{stockValue}</span>
    } else if (stockValue === 0) {
      return <span className="text-red-600 font-medium">0</span>
    } else {
      return <span className="text-gray-400">-</span>
    }
  }

  const getPriceDisplay = (price) => {
    if (price === null || price === undefined || price === 0) {
      return <span className="text-gray-400">-</span>
    }
    return <span className="text-gray-700">{price}</span>
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Search items..."
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-96 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Add Item Option */}
          <button
            onClick={handleAddItem}
            className="w-full px-6 py-4 text-left hover:bg-blue-50 border-b border-gray-200 flex items-center space-x-3 transition-colors"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-blue-600 font-medium">Add Item</span>
          </button>

          {/* Items List Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 sticky top-0">
            <div className="flex items-center space-x-8">
              <div className="flex-1 text-left text-sm font-semibold text-gray-700">ITEM</div>
              <div className="w-24 text-center text-sm font-semibold text-gray-700">SALE PRICE</div>
              <div className="w-24 text-center text-sm font-semibold text-gray-700">PURCHASE PRICE</div>
              <div className="w-20 text-center text-sm font-semibold text-gray-700">STOCK</div>
            </div>
          </div>

          {/* Scrollable Items List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Loading items...</span>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">
                No items found
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  className={`w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                    index !== filteredItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center space-x-8">
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                      {item.code && (
                        <div className="text-xs text-gray-500 mt-1">({item.code})</div>
                      )}
                    </div>
                    <div className="w-24 text-center text-sm">
                      {getPriceDisplay(item.salePrice)}
                    </div>
                    <div className="w-24 text-center text-sm">
                      {getPriceDisplay(item.purchasePrice)}
                    </div>
                    <div className="w-20 text-center text-sm">
                      {getStockDisplay(item.currentQuantity)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
            <AddItemModal
              onClose={() => setShowAddItemModal(false)}
              onSubmit={handleAddItemSubmit}
              loading={propLoading || isLoading}
              categories={categories}
              units={units}
              onAddCategory={handleAddCategory}
              defaultItemType="PRODUCT"
            />
      )}
    </div>
  )
}
