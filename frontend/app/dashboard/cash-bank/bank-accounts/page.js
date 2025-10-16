'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../../lib/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import api from '../../../../lib/api'

export default function BankAccountsPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBank, setSelectedBank] = useState(null)
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [bankAccounts, setBankAccounts] = useState([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [newBank, setNewBank] = useState({
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
        await fetchBankAccounts()
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

  const fetchBankAccounts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bank-accounts')
      setBankAccounts(response.data.bankAccounts || [])
      setTotalBalance(response.data.totalBalance || 0)
      
      // Set first bank as selected by default
      if (response.data.bankAccounts && response.data.bankAccounts.length > 0) {
        setSelectedBank(response.data.bankAccounts[0])
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
      toast.error('Failed to fetch bank accounts')
    } finally {
      setLoading(false)
    }
  }

  const fetchBankTransactions = async (bankAccountId) => {
    try {
      setLoadingTransactions(true)
      console.log('Fetching transactions for bank account:', bankAccountId)
      const response = await api.get(`/bank-accounts/${bankAccountId}/transactions`)
      console.log('Bank transactions response:', response.data)
      setTransactions(response.data.transactions || [])
    } catch (error) {
      console.error('Error fetching bank transactions:', error)
      toast.error('Failed to fetch bank transactions')
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleBankSelect = (bank) => {
    setSelectedBank(bank)
    fetchBankTransactions(bank.id)
  }

  const handleAddBank = async (e, formData) => {
    try {
      setLoading(true)
      console.log('Creating bank account with data:', formData)
      const response = await api.post('/bank-accounts', formData)
      console.log('Bank account created:', response.data)
      toast.success('Bank account added successfully')
      setShowAddBankModal(false)
      await fetchBankAccounts()
      
      // If this is the first bank account, select it and fetch its transactions
      if (response.data && response.data.id) {
        setSelectedBank(response.data)
        await fetchBankTransactions(response.data.id)
      }
    } catch (error) {
      console.error('Error adding bank account:', error)
      toast.error(error.response?.data?.error || 'Failed to add bank account')
    } finally {
      setLoading(false)
    }
  }

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
      <div className="flex-1 flex">
        {/* Left Panel - Bank List */}
        <div className="w-1/3 bg-white border-r border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Banks</h2>
              <button 
                onClick={() => setShowAddBankModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + Add Bank
              </button>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4">Loading bank accounts...</div>
              ) : bankAccounts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No bank accounts found</div>
              ) : (
                bankAccounts.map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => handleBankSelect(bank)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedBank?.id === bank.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{bank.bankName}</div>
                        <div className="text-sm text-gray-500">{bank.accountHolderName}</div>
                        <div className="text-xs text-gray-400">{bank.accountNumber}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹ {bank.currentBalance?.toLocaleString() || '0'}</div>
                        <div className="text-sm text-gray-500">Current Balance</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Bank Details */}
        <div className="flex-1 bg-gray-50">
          {selectedBank ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBank.bankName}</h3>
                  <div className="text-sm text-gray-500">{selectedBank.accountHolderName}</div>
                  <div className="text-xs text-gray-400">Account: {selectedBank.accountNumber}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Deposit / Withdraw
                  </button>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Balance Display */}
              <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">₹ {selectedBank.currentBalance?.toLocaleString() || '0'}</div>
                    <div className="text-sm text-gray-500 mt-1">Current Balance</div>
                    <div className="text-xs text-gray-400 mt-2">
                      IFSC: {selectedBank.ifscCode} | {selectedBank.accountType}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Transactions</h4>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                          <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                          <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                          <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                          <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingTransactions ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                            Loading transactions...
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.transactionType}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(() => {
                                const desc = transaction.description || 'N/A';
                                // Check if it's a payment transaction and extract party name
                                if (desc.startsWith('Payment to ')) {
                                  const partyNameMatch = desc.match(/Payment to ([^-]+)(?:\s-\s(.+))?/);
                                  if (partyNameMatch) {
                                    const partyName = partyNameMatch[1].trim();
                                    const additionalDesc = partyNameMatch[2];
                                    return (
                                      <div>
                                        <div className="font-medium text-gray-900">{partyName}</div>
                                        {additionalDesc && (
                                          <div className="text-xs text-gray-500">{additionalDesc}</div>
                                        )}
                                      </div>
                                    );
                                  }
                                }
                                return desc;
                              })()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(transaction.transactionDate).toLocaleDateString()}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                              transaction.transactionType === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              ₹ {transaction.amount?.toLocaleString() || '0'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-500 text-lg">Select a bank to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <AddBankModal 
          onClose={() => setShowAddBankModal(false)} 
          onSubmit={handleAddBank}
          loading={loading}
        />
      )}
      </div>
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


          {/* Card Machine Integration Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-900">Card Machine Integration</div>
                <div className="text-xs text-blue-700">Connect your card machine to automatically record transactions</div>
              </div>
            </div>
          </div>

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
