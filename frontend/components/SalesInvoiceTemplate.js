'use client'

import { useState, useRef, useEffect } from 'react'
import { generateInvoicePDF, printInvoice } from '../utils/pdfGenerator'
import toast from 'react-hot-toast'

export default function SalesInvoiceTemplate({ sale, onClose, onPrint, onDownload }) {
  const invoiceRef = useRef(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [companyData, setCompanyData] = useState(null)
  const [isLoadingCompany, setIsLoadingCompany] = useState(true)

  // Debug: Log sale data to see what's being received
  console.log('SalesInvoiceTemplate - Sale data:', sale)
  console.log('SalesInvoiceTemplate - Sale items:', sale?.saleItems || sale?.items)

  // Fetch company data on component mount
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = sessionStorage.getItem('token')
        if (!token) {
          console.log('No token found, skipping company data fetch')
          setIsLoadingCompany(false)
          return
        }

        const response = await fetch('http://localhost:8080/api/company/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Company data loaded for invoice:', data)
          setCompanyData(data)
        } else {
          console.log('Failed to load company data:', response.status)
        }
      } catch (error) {
        console.error('Error loading company data:', error)
      } finally {
        setIsLoadingCompany(false)
      }
    }

    fetchCompanyData()
  }, [])

  const handleDownload = async () => {
    if (!invoiceRef.current) return
    
    setIsGeneratingPDF(true)
    try {
      const result = await generateInvoicePDF(invoiceRef.current, sale)
      if (result.success) {
        toast.success('PDF downloaded successfully!')
      } else {
        console.error('PDF generation failed:', result.error)
        toast.error('PDF generation failed. Using browser print instead.')
        // Fallback: Use browser's print to PDF
        window.print()
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('PDF generation failed. Using browser print instead.')
      // Fallback: Use browser's print to PDF
      window.print()
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrint = async () => {
    if (!invoiceRef.current) return
    
    setIsPrinting(true)
    try {
      const result = printInvoice(invoiceRef.current)
      if (result.success) {
        toast.success('Print dialog opened!')
      } else {
        console.error('Print failed:', result.error)
        toast.error('Print failed. Please try again.')
      }
    } catch (error) {
      console.error('Error printing:', error)
      toast.error('Print failed. Please try again.')
    } finally {
      setIsPrinting(false)
    }
  }

  // Helper function to convert number to words including fractions
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

    const convertToWords = (n) => {
      if (n === 0) return 'Zero'
      if (n < 10) return ones[n]
      if (n < 20) return teens[n - 10]
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertToWords(n % 100) : '')
      if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '')
      if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '')
      return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '')
    }

    // Handle decimal numbers
    const integerPart = Math.floor(num)
    const decimalPart = Math.round((num - integerPart) * 100)
    
    let result = convertToWords(integerPart)
    
    if (decimalPart > 0) {
      result += ' and ' + convertToWords(decimalPart) + ' Paise'
    }
    
    return result
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  const getStateName = (stateCode) => {
    const states = {
      '27': 'Maharashtra',
      '01': 'Jammu and Kashmir',
      '02': 'Himachal Pradesh',
      '03': 'Punjab',
      '04': 'Chandigarh',
      '05': 'Uttarakhand',
      '06': 'Haryana',
      '07': 'Delhi',
      '08': 'Rajasthan',
      '09': 'Uttar Pradesh',
      '10': 'Bihar',
      '11': 'Sikkim',
      '12': 'Arunachal Pradesh',
      '13': 'Nagaland',
      '14': 'Manipur',
      '15': 'Mizoram',
      '16': 'Tripura',
      '17': 'Meghalaya',
      '18': 'Assam',
      '19': 'West Bengal',
      '20': 'Jharkhand',
      '21': 'Odisha',
      '22': 'Chhattisgarh',
      '23': 'Madhya Pradesh',
      '24': 'Gujarat',
      '25': 'Daman and Diu',
      '26': 'Dadra and Nagar Haveli',
      '28': 'Andhra Pradesh',
      '29': 'Karnataka',
      '30': 'Goa',
      '31': 'Lakshadweep',
      '32': 'Kerala',
      '33': 'Tamil Nadu',
      '34': 'Puducherry',
      '35': 'Andaman and Nicobar Islands',
      '36': 'Telangana',
      '37': 'Andhra Pradesh',
      '38': 'Ladakh'
    }
    return states[stateCode] || stateCode
  }

  const totalAmount = sale?.totalAmount || 0
  const receivedAmount = sale?.receivedAmount || 0
  const balanceAmount = sale?.balanceAmount || 0
  const subtotal = sale?.subtotal || totalAmount
  const discountAmount = sale?.discountAmount || 0
  const taxAmount = sale?.taxAmount || 0
  const roundOff = sale?.roundOff || 0

  // Calculate totals from sale items
  const calculateItemTotals = () => {
    // Handle both 'saleItems' (from form) and 'items' (from backend)
    const items = sale?.saleItems || sale?.items || []
    
    if (items.length === 0) {
      // If no sale items, use the sale-level totals if available
      const saleDiscount = parseFloat(sale?.discountAmount) || 0
      const saleTax = parseFloat(sale?.taxAmount) || 0
      const saleTotal = parseFloat(sale?.totalAmount) || 0
      const taxableAmount = saleTotal - saleTax
      
      return {
        totalQuantity: 1,
        totalDiscount: saleDiscount,
        totalGST: saleTax,
        totalAmount: saleTotal,
        taxableAmount: taxableAmount,
        cgstAmount: saleTax / 2,
        sgstAmount: saleTax / 2
      }
    }

    const totals = items.reduce((acc, item) => {
      acc.totalQuantity += item.quantity || 0
      acc.totalDiscount += parseFloat(item.discountAmount) || 0
      acc.totalGST += parseFloat(item.taxAmount) || 0
      acc.totalAmount += parseFloat(item.totalAmount) || 0
      acc.taxableAmount += (parseFloat(item.totalAmount) || 0) - (parseFloat(item.taxAmount) || 0)
      return acc
    }, {
      totalQuantity: 0,
      totalDiscount: 0,
      totalGST: 0,
      totalAmount: 0,
      taxableAmount: 0
    })

    // Calculate CGST and SGST (assuming 5% GST = 2.5% CGST + 2.5% SGST)
    totals.cgstAmount = totals.totalGST / 2
    totals.sgstAmount = totals.totalGST / 2

    return totals
  }

  const itemTotals = calculateItemTotals()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tax Invoice</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              disabled={isGeneratingPDF}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>{isPrinting ? 'Printing...' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div ref={invoiceRef} className="bg-white p-8 border border-gray-300">
            {/* Invoice Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Tax Invoice</h1>
            </div>

            {/* Company Info and Invoice Details */}
            <div className="flex justify-between mb-8">
              <div className="w-1/2">
                {companyData?.logoPath ? (
                  <div className="w-32 h-20 mb-4 flex items-center justify-center">
                    <img 
                      src={`http://localhost:8080/public/images/logo/${companyData.logoPath.split('/').pop()}`}
                      alt="Company Logo" 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        console.error('Company logo failed to load:', companyData.logoPath)
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-200 w-32 h-20 mb-4 flex items-center justify-center text-gray-500 text-xs">
                    LOGO
                  </div>
                )}
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {companyData?.businessName || 'My Company'}
                </h2>
                <p className="text-gray-600">{companyData?.phoneNumber || '8180039093'}</p>
              </div>
              
              <div className="w-1/2 flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                  <p className="text-gray-700 font-medium">{sale?.billingName || 'Walk-in Customer'}</p>
                  <p className="text-gray-600">{sale?.billingAddress || ''}</p>
                  <p className="text-gray-600">Contact No: {sale?.phoneNumber || ''}</p>
                  <p className="text-gray-600">State: {getStateName('27')}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Invoice Details:</h3>
                  <p className="text-gray-700">No: {sale?.invoiceNumber || sale?.id}</p>
                  <p className="text-gray-700">Date: {formatDate(sale?.invoiceDate)}</p>
                  <p className="text-gray-700">Place Of Supply: {getStateName('27')}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300 table-fixed">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-12">#</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-48">Item name</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-20">Unit</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-24">HSN/ SAC</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-20">Quantity</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-28">Price/ Unit(₹)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-28">Discount(₹)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-24">GST(₹)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-28">Amount(₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(sale?.saleItems || sale?.items || []).map((item, index) => {
                    const itemDiscount = parseFloat(item?.discountAmount) || 0
                    const itemGST = parseFloat(item?.taxAmount) || 0
                    const itemPrice = parseFloat(item?.price) || 100
                    const itemQuantity = item?.quantity || 1
                    const itemTotal = parseFloat(item?.totalAmount) || (itemPrice * itemQuantity - itemDiscount + itemGST)
                    const discountPercent = parseFloat(item?.discountPercentage) || 5
                    const gstPercent = parseFloat(item?.taxPercentage) || 5
                    
                    // Debug: Log item data to see HSN code values
                    console.log(`Item ${index + 1} data:`, {
                      itemName: item?.item?.name || item?.itemName,
                      hsnCode: item?.hsnCode,
                      itemHsnCode: item?.item?.hsnCode,
                      unit: item?.unit || item?.item?.unit
                    })
                    
                    return (
                      <tr key={index}>
                        <td className="border border-gray-300 px-3 py-2"># {index + 1}</td>
                        <td className="border border-gray-300 px-3 py-2">{item?.item?.name || item?.itemName || 'Sample Item'}</td>
                        <td className="border border-gray-300 px-3 py-2">{item?.unit || item?.item?.unit || 'NONE'}</td>
                        <td className="border border-gray-300 px-3 py-2">{item?.hsnCode || item?.item?.hsnCode || ''}</td>
                        <td className="border border-gray-300 px-3 py-2">{itemQuantity}</td>
                        <td className="border border-gray-300 px-3 py-2">₹{itemPrice.toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2">₹{itemDiscount.toFixed(2)} ({discountPercent}%)</td>
                        <td className="border border-gray-300 px-3 py-2">₹{itemGST.toFixed(2)} ({gstPercent}%)</td>
                        <td className="border border-gray-300 px-3 py-2">₹{itemTotal.toFixed(2)}</td>
                      </tr>
                    )
                  }) || (
                    <tr>
                      <td className="border border-gray-300 px-3 py-2"># 1</td>
                      <td className="border border-gray-300 px-3 py-2">Sample Item</td>
                      <td className="border border-gray-300 px-3 py-2">NONE</td>
                      <td className="border border-gray-300 px-3 py-2"></td>
                      <td className="border border-gray-300 px-3 py-2">1</td>
                      <td className="border border-gray-300 px-3 py-2">₹{itemTotals.totalAmount.toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2">₹{itemTotals.totalDiscount.toFixed(2)} (5%)</td>
                      <td className="border border-gray-300 px-3 py-2">₹{itemTotals.totalGST.toFixed(2)} (5%)</td>
                      <td className="border border-gray-300 px-3 py-2">₹{itemTotals.totalAmount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="border border-gray-300 px-3 py-2 font-semibold">Total</td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold">{itemTotals.totalQuantity}</td>
                    <td className="border border-gray-300 px-3 py-2"></td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold">₹{itemTotals.totalDiscount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold">₹{itemTotals.totalGST.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold">₹{itemTotals.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Tax Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Summary</h3>
              <table className="w-full border-collapse border border-gray-300 table-fixed">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-24">HSN/SAC</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-32">Taxable amount (₹)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-20" colSpan="2">CGST</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-20" colSpan="2">SGST</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-28">Total Tax (₹)</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold"></th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold"></th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-10">Rate (%)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-10">Amt (₹)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-10">Rate (%)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-10">Amt (₹)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2"></td>
                    <td className="border border-gray-300 px-3 py-2">₹{itemTotals.taxableAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2">2.5</td>
                    <td className="border border-gray-300 px-3 py-2">₹{itemTotals.cgstAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2">2.5</td>
                    <td className="border border-gray-300 px-3 py-2">₹{itemTotals.sgstAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2">₹{itemTotals.totalGST.toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 font-semibold">TOTAL</td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold">₹{itemTotals.taxableAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold"></td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold">₹{itemTotals.cgstAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold"></td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold">₹{itemTotals.sgstAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold">₹{itemTotals.totalGST.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-between mb-8 gap-8">
              <div className="w-2/3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Sub Total:</span>
                    <span>₹{itemTotals.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Round Off:</span>
                    <span>₹{roundOff.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span>₹{(itemTotals.totalAmount + roundOff).toFixed(2)}</span>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold">Invoice Amount in Words:</p>
                    <p className="text-gray-700">{numberToWords(itemTotals.totalAmount + roundOff)} Rupees only</p>
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="font-semibold">Received:</span>
                    <span>₹{receivedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Balance:</span>
                    <span>₹{balanceAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">You Saved:</span>
                    <span>₹{itemTotals.totalDiscount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-1/3 flex justify-end">
                <div className="text-right">
                  <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
                  <p className="text-gray-700">Thanks for doing business with us!</p>
                  
                  <div className="mt-8">
                    {companyData?.signaturePath ? (
                      <div className="border border-gray-300 w-48 h-20 flex items-center justify-center">
                        <img 
                          src={`http://localhost:8080/public/images/signature/${companyData.signaturePath.split('/').pop()}`}
                          alt="Company Signature" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            console.error('Company signature failed to load:', companyData.signaturePath)
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = '<p class="text-center text-gray-600">For My Company:</p>'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="border border-gray-300 w-48 h-20 flex items-center justify-center">
                        <p className="text-center text-gray-600">For My Company:</p>
                      </div>
                    )}
                    <p className="text-center text-gray-600 mt-2">Authorized Signatory</p>
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
