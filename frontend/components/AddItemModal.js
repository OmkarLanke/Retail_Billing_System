'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function AddItemModal({ onClose, onSubmit, loading, categories, units, onAddCategory, isEditMode = false, editingItem = null, defaultItemType = 'PRODUCT' }) {
  const [formData, setFormData] = useState({
    itemType: defaultItemType,
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
    taxRate: 'None',
    openingQuantity: '',
    atPrice: '',
    asOfDate: new Date().toLocaleDateString('en-GB'),
    minStock: '',
    location: ''
  })

  const [activeTab, setActiveTab] = useState('PRICING')
  const [showUnitDropdown, setShowUnitDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')

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

  const taxOptions = [
    'None',
    'IGST@0%',
    'GST@0%',
    'IGST@0.25%',
    'GST@0.25%',
    'IGST@3%',
    'GST@3%',
    'IGST@5%',
    'GST@5%',
    'IGST@12%',
    'GST@12%',
    'IGST@18%',
    'GST@18%',
    'IGST@28%',
    'GST@28%',
    'Exempt'
  ]

  // Reset form data when not in edit mode
  useEffect(() => {
    if (!isEditMode) {
      setFormData({
        itemType: defaultItemType,
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
        taxRate: 'None',
        openingQuantity: '',
        atPrice: '',
        asOfDate: new Date().toLocaleDateString('en-GB'),
        minStock: '',
        location: ''
      })
    }
  }, [isEditMode, defaultItemType])

  // Populate form data when editing
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const handleUnitSelect = (unit) => {
    setFormData(prev => ({ ...prev, unit }))
    setShowUnitDropdown(false)
  }

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }))
    setShowCategoryDropdown(false)
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    
    try {
      await onAddCategory(newCategory)
      // Auto-select the newly added category
      setFormData(prev => ({ ...prev, category: newCategory }))
      setNewCategory('')
      setShowAddCategoryModal(false)
      toast.success('Category added successfully')
    } catch (error) {
      toast.error('Failed to add category')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowUnitDropdown(false)
        setShowCategoryDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditMode ? 'Edit Item' : (defaultItemType === 'SERVICE' ? 'Add Service' : 'Add Item')}
          </h3>
          
          {/* Product/Service Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleInputChange('itemType', 'PRODUCT')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                formData.itemType === 'PRODUCT'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Product
            </button>
            <button
              onClick={() => handleInputChange('itemType', 'SERVICE')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                formData.itemType === 'SERVICE'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
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
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Item Details Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.itemType === 'SERVICE' ? 'Service Name *' : 'Item Name *'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={formData.itemType === 'SERVICE' ? 'Enter service name' : 'Enter item name'}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.itemType === 'SERVICE' ? 'Service HSN' : 'Item HSN'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.hsn}
                onChange={(e) => handleInputChange('hsn', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter HSN code"
              />
              <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="dropdown-container relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Unit</label>
            <button
              type="button"
              onClick={() => setShowUnitDropdown(!showUnitDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-500 text-white text-left flex items-center justify-between"
            >
              <span>{formData.unit || 'Select Unit'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showUnitDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {unitOptions.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => handleUnitSelect(unit)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100"
                  >
                    {unit}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="dropdown-container relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between"
            >
              <span>{formData.category || 'Category'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCategoryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.name)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100"
                  >
                    {category.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(true)}
                  className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add New Category</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.itemType === 'SERVICE' ? 'Service Code' : 'Item Code'}
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={formData.itemType === 'SERVICE' ? 'Enter service code (optional)' : 'Enter item code (optional)'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Item Image</label>
            <button
              type="button"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center space-x-2 text-gray-600 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Add Item Image</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('PRICING')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'PRICING'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pricing
            </button>
            {formData.itemType === 'PRODUCT' && (
              <button
                type="button"
                onClick={() => setActiveTab('STOCK')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'STOCK'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Stock
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'PRICING' && (
          <div className="space-y-6">
            {/* Sale Price Section */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Sale Price</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => handleInputChange('salePrice', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <select
                      value={formData.salePriceType}
                      onChange={(e) => handleInputChange('salePriceType', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="WITHOUT_TAX">Without Tax</option>
                      <option value="WITH_TAX">With Tax</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disc. On Sale Pric...</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => handleInputChange('discount', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <select
                      value={formData.discountType}
                      onChange={(e) => handleInputChange('discountType', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mt-2 text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>+ Add Wholesale Price</span>
              </button>
            </div>

            {/* Purchase Price Section - Only show for Products */}
            {formData.itemType === 'PRODUCT' && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Purchase Price</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={formData.purchasePrice}
                        onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                      <select
                        value={formData.purchasePriceType}
                        onChange={(e) => handleInputChange('purchasePriceType', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="WITHOUT_TAX">Without Tax</option>
                        <option value="WITH_TAX">With Tax</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Taxes Section */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Taxes</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate</label>
                  <select
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {taxOptions.map((tax) => (
                      <option key={tax} value={tax}>{tax}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'STOCK' && formData.itemType === 'PRODUCT' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Quantity</label>
                <input
                  type="number"
                  value={formData.openingQuantity}
                  onChange={(e) => handleInputChange('openingQuantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opening Quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">At Price</label>
                <input
                  type="number"
                  value={formData.atPrice}
                  onChange={(e) => handleInputChange('atPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At Price"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">As Of Date</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.asOfDate}
                    onChange={(e) => handleInputChange('asOfDate', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="DD/MM/YYYY"
                  />
                  <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock To Maintain</label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange('minStock', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min Stock To Maintain"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Location"
              />
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Save & New
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Enter category name"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
