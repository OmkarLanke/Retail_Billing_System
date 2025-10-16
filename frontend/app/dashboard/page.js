'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../lib/auth'
import toast from 'react-hot-toast'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/auth/login')
        return
      }

      try {
        const userData = authService.getCurrentUserFromStorage()
        setUser(userData)
      } catch (error) {
        console.error('Error getting user data:', error)
        authService.logout()
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    authService.logout()
    toast.success('Logged out successfully')
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
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

        {/* Main Dashboard Content */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Actions */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Q Search Transactions"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Receivable */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">₹ 0</div>
                      <div className="text-sm text-gray-500 mt-1">Total Receivable</div>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    You don't have any receivables as of now.
                  </div>
                </div>

                {/* Total Payable */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">₹ 10,000</div>
                      <div className="text-sm text-gray-500 mt-1">Total Payable</div>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    From 1 Party
                  </div>
                </div>

                {/* Total Sale */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">₹ 1,50,000</div>
                      <div className="text-sm text-gray-500 mt-1">Total Sale</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select className="text-sm border border-gray-300 rounded px-2 py-1">
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Graph */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Sale</h3>
                <div className="h-64 flex items-end space-x-2">
                  {/* Simple bar chart representation */}
                  {Array.from({length: 28}, (_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-full rounded-t ${
                          i === 9 ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                        style={{
                          height: i === 9 ? '200px' : '20px'
                        }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1">{i + 1}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Sep 1</span>
                  <span>Sep 28</span>
                </div>
              </div>

              {/* Most Used Reports */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Most Used Reports</h3>
                  <a href="#" className="text-sm text-blue-600 hover:underline">View All</a>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ReportCard title="Sale Report" />
                  <ReportCard title="All Transactions" />
                  <ReportCard title="Daybook Report" />
                  <ReportCard title="Party Statement" />
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Metrics */}
            <div className="space-y-6">
              <DashboardMetric title="Purchases" amount="₹ 50,300" period="This Month" trend="up" />
              <DashboardMetric title="Expenses" amount="₹ 0" period="This Month" trend="neutral" />
              <DashboardMetric title="Stock Value" amount="₹ 51,300" period="As of Now" trend="neutral" />
              <DashboardMetric title="Cash In Hand" amount="₹ 1,14,700" period="As of Now" trend="neutral" />
              <DashboardMetric title="Total Bank Balance" amount="₹ 5,000" period="As of Now" trend="neutral" />
              
              {/* Low Stocks Items */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Low Stocks Items</h4>
                <div className="text-sm text-gray-500">No items to show</div>
                <div className="text-xs text-gray-400 mt-1">As of Now</div>
              </div>

              {/* Add Widget */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 border-dashed">
                <div className="flex items-center justify-center text-gray-500">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm">Add Widget of Your Choice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

// Report Card Component
function ReportCard({ title }) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <span className="text-sm font-medium text-gray-700">{title}</span>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  )
}

// Dashboard Metric Component
function DashboardMetric({ title, amount, period, trend }) {
  const getTrendIcon = () => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-gray-900">{amount}</div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
        {getTrendIcon()}
      </div>
      <div className="text-xs text-gray-400 mt-1">{period}</div>
    </div>
  )
}
