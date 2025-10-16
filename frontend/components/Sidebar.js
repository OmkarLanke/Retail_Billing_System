'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Sidebar({ user, onLogout }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPurchaseExpanded, setIsPurchaseExpanded] = useState(() => {
    // Try to get from localStorage, default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('purchaseDropdownExpanded')
      return saved !== null ? saved === 'true' : true
    }
    return true
  })

  const [isSaleExpanded, setIsSaleExpanded] = useState(() => {
    // Try to get from localStorage, default to false
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saleDropdownExpanded')
      return saved !== null ? saved === 'true' : false
    }
    return false
  })

  const [isCashBankExpanded, setIsCashBankExpanded] = useState(() => {
    // Try to get from localStorage, default to false
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cashBankDropdownExpanded')
      return saved !== null ? saved === 'true' : false
    }
    return false
  })

  // Auto-expand purchase dropdown only when on purchase-related pages (not home page)
  useEffect(() => {
    const purchasePaths = [
      '/dashboard/purchase-bills',
      '/dashboard/payment-out', 
      '/dashboard/expenses',
      '/dashboard/purchase-order',
      '/dashboard/purchase-return'
    ]
    
    const salePaths = [
      '/dashboard/sale-invoices',
      '/dashboard/payment-in'
    ]
    
    const cashBankPaths = [
      '/dashboard/cash-bank/bank-accounts',
      '/dashboard/cash-bank/cash-in-hand',
      '/dashboard/cheques',
      '/dashboard/loan-accounts'
    ]
    
    // Only auto-expand if on actual purchase-related pages (not home page)
    if (purchasePaths.some(path => pathname === path || pathname.startsWith(path))) {
      setIsPurchaseExpanded(true)
      localStorage.setItem('purchaseDropdownExpanded', 'true')
    }
    
    // Auto-expand sale dropdown when on sale-related pages
    if (salePaths.some(path => pathname === path || pathname.startsWith(path))) {
      setIsSaleExpanded(true)
      localStorage.setItem('saleDropdownExpanded', 'true')
    }
    
    // Auto-expand cash & bank dropdown when on cash/bank-related pages
    if (cashBankPaths.some(path => pathname === path || pathname.startsWith(path))) {
      setIsCashBankExpanded(true)
      localStorage.setItem('cashBankDropdownExpanded', 'true')
    }
  }, [pathname])

  const handleNavigation = (path, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    console.log('Sidebar: Current pathname:', pathname)
    console.log('Sidebar: Navigating to:', path)
    if (pathname !== path) {
      console.log('Sidebar: Executing router.push...')
      router.push(path)
    } else {
      console.log('Sidebar: Already on target path, skipping navigation')
    }
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (path === '/dashboard/parties') {
      return pathname === '/dashboard/parties' || pathname.startsWith('/dashboard/parties/')
    }
    if (path === '/dashboard/cash-bank/bank-accounts') {
      return pathname === '/dashboard/cash-bank/bank-accounts'
    }
    if (path === '/dashboard/cash-bank/cash-in-hand') {
      return pathname === '/dashboard/cash-bank/cash-in-hand'
    }
    if (path === '/dashboard/purchase-bills') {
      return pathname === '/dashboard/purchase-bills'
    }
    if (path === '/dashboard/payment-out') {
      return pathname === '/dashboard/payment-out'
    }
    if (path === '/dashboard/expenses') {
      return pathname === '/dashboard/expenses'
    }
    if (path === '/dashboard/purchase-order') {
      return pathname === '/dashboard/purchase-order'
    }
    if (path === '/dashboard/purchase-return') {
      return pathname === '/dashboard/purchase-return'
    }
    if (path === '/dashboard/my-company') {
      return pathname === '/dashboard/my-company'
    }
    return pathname === path
  }

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      {/* Top Section */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">TTI Retail Billing</h1>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Open Anything (Ctrl+F)"
            className="w-full bg-slate-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-2.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-2">
        <div 
          className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
          onClick={(e) => handleNavigation('/dashboard', e)}
        >
          <span className="text-lg">🏠</span>
          <span className="text-sm">Home</span>
        </div>

        <div 
          className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard/parties') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
          onClick={(e) => handleNavigation('/dashboard/parties', e)}
        >
          <span className="text-lg">👥</span>
          <span className="text-sm">Parties</span>
        </div>

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/items', e)}
        >
          <span className="text-lg">📦</span>
          <span className="text-sm">Items</span>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
        </div>

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={() => {
            const newState = !isSaleExpanded
            setIsSaleExpanded(newState)
            localStorage.setItem('saleDropdownExpanded', newState.toString())
          }}
        >
          <span className="text-lg">🧾</span>
          <span className="text-sm">Sale</span>
          <svg className={`w-4 h-4 transition-transform ${isSaleExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isSaleExpanded && (
          <div className="ml-6 space-y-1">
            <div 
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer relative ${isActive('/dashboard/sale-invoices') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              onClick={(e) => handleNavigation('/dashboard/sale-invoices', e)}
            >
              {isActive('/dashboard/sale-invoices') && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-r"></div>
              )}
              <span className="text-sm">Sale Invoices</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer relative ${isActive('/dashboard/payment-in') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              onClick={(e) => handleNavigation('/dashboard/payment-in', e)}
            >
              {isActive('/dashboard/payment-in') && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-r"></div>
              )}
              <span className="text-sm">Payment In</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
          </div>
        )}

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={() => {
            const newState = !isPurchaseExpanded
            setIsPurchaseExpanded(newState)
            localStorage.setItem('purchaseDropdownExpanded', newState.toString())
          }}
        >
          <span className="text-lg">🛒</span>
          <span className="text-sm">Purchase & Expense</span>
          <svg className={`w-4 h-4 transition-transform ${isPurchaseExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isPurchaseExpanded && (
          <div className="ml-6 space-y-1">
            <div 
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer relative ${isActive('/dashboard/purchase-bills') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              onClick={(e) => handleNavigation('/dashboard/purchase-bills', e)}
            >
              {isActive('/dashboard/purchase-bills') && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-r"></div>
              )}
              <span className="text-sm">Purchase Bills</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard/payment-out') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              onClick={(e) => handleNavigation('/dashboard/payment-out', e)}
            >
              <span className="text-sm">Payment-Out</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard/expenses') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              onClick={(e) => handleNavigation('/dashboard/expenses', e)}
            >
              <span className="text-sm">Expenses</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard/purchase-order') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              onClick={(e) => handleNavigation('/dashboard/purchase-order', e)}
            >
              <span className="text-sm">Purchase Order</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard/purchase-return') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              onClick={(e) => handleNavigation('/dashboard/purchase-return', e)}
            >
              <span className="text-sm">Purchase Return/ Dr. Note</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
          </div>
        )}

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/grow', e)}
        >
          <span className="text-lg">📈</span>
          <span className="text-sm">Grow Your Business</span>
        </div>

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={() => {
            const newState = !isCashBankExpanded
            setIsCashBankExpanded(newState)
            localStorage.setItem('cashBankDropdownExpanded', newState.toString())
          }}
        >
          <span className="text-lg">🏦</span>
          <span className="text-sm">Cash & Bank</span>
          <svg className={`w-4 h-4 transition-transform ${isCashBankExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isCashBankExpanded && (
          <div className="ml-6 space-y-1">
            <div 
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard/cash-bank/bank-accounts') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              onClick={(e) => handleNavigation('/dashboard/cash-bank/bank-accounts', e)}
            >
              <span className="text-sm">Bank Accounts</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard/cash-bank/cash-in-hand') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              onClick={(e) => handleNavigation('/dashboard/cash-bank/cash-in-hand', e)}
            >
              <span className="text-sm">Cash In Hand</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
            <div 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
              onClick={(e) => handleNavigation('/dashboard/cheques', e)}
            >
              <span className="text-sm">Cheques</span>
            </div>
            <div 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
              onClick={(e) => handleNavigation('/dashboard/loan-accounts', e)}
            >
              <span className="text-sm">Loan Accounts</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
            </div>
          </div>
        )}

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/reports', e)}
        >
          <span className="text-lg">📊</span>
          <span className="text-sm">Reports</span>
        </div>

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/sync', e)}
        >
          <span className="text-lg">🔄</span>
          <span className="text-sm">Sync, Share & Backup</span>
        </div>

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/utilities', e)}
        >
          <span className="text-lg">🔧</span>
          <span className="text-sm">Utilities</span>
        </div>

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/settings', e)}
        >
          <span className="text-lg">⚙️</span>
          <span className="text-sm">Settings</span>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-700 space-y-3">
        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/pricing', e)}
        >
          <span className="text-lg">🔍</span>
          <span className="text-sm">Plans & Pricing</span>
        </div>

        <div className="bg-red-600 rounded-lg p-3">
          <div className="text-sm font-medium">1 days Free Trial left</div>
          <div className="w-full bg-red-800 rounded-full h-2 mt-2">
            <div className="bg-white h-2 rounded-full" style={{ width: '95%' }}></div>
          </div>
        </div>

        <button 
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-3 rounded-lg text-sm flex items-center justify-center"
          onClick={(e) => handleNavigation('/dashboard/premium', e)}
        >
          Get TTI Retail Billing Premium →
        </button>

        <div 
          className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard/my-company') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
          onClick={(e) => handleNavigation('/dashboard/my-company', e)}
        >
          <span className="text-lg">🏢</span>
          <span className="text-sm">My Company</span>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
        </div>
      </div>
    </div>
  )
}
