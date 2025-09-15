'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Sidebar({ user, onLogout }) {
  const router = useRouter()
  const pathname = usePathname()

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
    return pathname === path
  }

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      {/* Top Section */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">GST App</h1>
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
          onClick={(e) => handleNavigation('/dashboard/sale', e)}
        >
          <span className="text-lg">🧾</span>
          <span className="text-sm">Sale</span>
        </div>

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/purchase', e)}
        >
          <span className="text-lg">🛒</span>
          <span className="text-sm">Purchase & Expense</span>
        </div>

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/grow', e)}
        >
          <span className="text-lg">📈</span>
          <span className="text-sm">Grow Your Business</span>
        </div>

        <div 
          className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${isActive('/dashboard/cash-bank/bank-accounts') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
          onClick={(e) => handleNavigation('/dashboard/cash-bank/bank-accounts', e)}
        >
          <span className="text-lg">🏦</span>
          <span className="text-sm">Cash & Bank</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

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
          Get GST App Premium →
        </button>

        <div 
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={(e) => handleNavigation('/dashboard/mobile', e)}
        >
          <span className="text-lg">📱</span>
          <span className="text-sm">Mobile</span>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded">+</span>
        </div>
      </div>
    </div>
  )
}
