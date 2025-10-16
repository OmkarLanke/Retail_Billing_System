import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function AddCategoryModal({ onClose, onSubmit, loading, isEditMode = false, editingCategory = null }) {
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    if (isEditMode && editingCategory) {
      setCategoryName(editingCategory.name || '')
    } else {
      setCategoryName('')
    }
  }, [isEditMode, editingCategory])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!categoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    onSubmit({ name: categoryName, description: '' })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditMode ? 'Edit Category' : 'Add New Category'}
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Category Name Input */}
          <div className="mb-6">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
