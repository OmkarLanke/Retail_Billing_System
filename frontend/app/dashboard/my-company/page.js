'use client'

import { useState, useEffect } from 'react'

export default function MyCompanyPage() {
  const [formData, setFormData] = useState({
    businessName: 'My Company',
    phoneNumber: '8180039093',
    gstin: '',
    email: '',
    businessType: '',
    businessCategory: '',
    state: '',
    pincode: '',
    businessAddress: '',
    logo: null,
    signature: null
  })
  
  const [logoPreview, setLogoPreview] = useState(null)
  const [signaturePreview, setSignaturePreview] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Load existing company data on component mount
  useEffect(() => {
    // Check if user is authenticated
    const token = sessionStorage.getItem('token')
    if (!token) {
      setMessage('Please login to access this page')
      setIsSuccess(false)
      return
    }
    
    // Test authentication first
    testAuthentication()
    testStaticFileServing()
    loadCompanyData()
  }, [])

  const testAuthentication = async () => {
    try {
      const token = sessionStorage.getItem('token')
      console.log('Testing authentication with token:', token ? `${token.substring(0, 20)}...` : 'No token')
      
      const response = await fetch('http://localhost:8080/api/company/test-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Auth test response status:', response.status)
      const result = await response.json()
      console.log('Auth test response:', result)
      
      if (response.ok) {
        console.log('Authentication test successful')
      } else {
        console.error('Authentication test failed:', result)
      }
    } catch (error) {
      console.error('Authentication test error:', error)
    }
  }

  const testStaticFileServing = async () => {
    try {
      const token = sessionStorage.getItem('token')
      console.log('Testing static file serving...')
      
      const response = await fetch('http://localhost:8080/api/company/test-static-files', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Static file test response status:', response.status)
      const result = await response.json()
      console.log('Static file test response:', result)
      
    } catch (error) {
      console.error('Static file test error:', error)
    }
  }

  const loadCompanyData = async () => {
    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.log('No authentication token found')
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
        console.log('Loaded company data:', data)
        if (data.success && data.businessName) {
          setFormData(prev => ({
            ...prev,
            businessName: data.businessName || '',
            phoneNumber: data.phoneNumber || '',
            gstin: data.gstin || '',
            email: data.email || '',
            businessType: data.businessType || '',
            businessCategory: data.businessCategory || '',
            state: data.state || '',
            pincode: data.pincode || '',
            businessAddress: data.businessAddress || ''
          }))
          
          // Set image previews if paths exist
          console.log('Logo path:', data.logoPath)
          console.log('Signature path:', data.signaturePath)
          
          if (data.logoPath) {
            // Extract filename from path: uploads/company/logos/filename.jpg -> filename.jpg
            const logoFilename = data.logoPath.split('/').pop()
            const logoUrl = `http://localhost:8080/public/images/logo/${logoFilename}`
            console.log('Setting logo preview URL:', logoUrl)
            setLogoPreview(logoUrl)
          }
          if (data.signaturePath) {
            // Extract filename from path: uploads/company/signatures/filename.jpg -> filename.jpg
            const signatureFilename = data.signaturePath.split('/').pop()
            const signatureUrl = `http://localhost:8080/public/images/signature/${signatureFilename}`
            console.log('Setting signature preview URL:', signatureUrl)
            setSignaturePreview(signatureUrl)
          }
        }
      }
    } catch (error) {
      console.error('Error loading company data:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }))
      
      // Create preview for immediate display
      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === 'logo') {
          setLogoPreview(e.target.result)
        } else if (type === 'signature') {
          setSignaturePreview(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        setMessage('Please login to save company data')
        setLoading(false)
        return
      }

      // Prepare form data for API
      const apiData = {
        businessName: formData.businessName,
        phoneNumber: formData.phoneNumber,
        gstin: formData.gstin,
        email: formData.email,
        businessType: formData.businessType,
        businessCategory: formData.businessCategory,
        state: formData.state,
        pincode: formData.pincode,
        businessAddress: formData.businessAddress
      }

      console.log('Sending data to API:', apiData)
      console.log('Token being sent:', token ? `${token.substring(0, 20)}...` : 'No token')

      const response = await fetch('http://localhost:8080/api/company/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (response.ok && result.success) {
        setMessage('Company profile saved successfully!')
        setIsSuccess(true)
        
        // Upload logo if selected
        if (formData.logo) {
          await uploadFile(formData.logo, 'logo')
        }
        
        // Upload signature if selected
        if (formData.signature) {
          await uploadFile(formData.signature, 'signature')
        }
      } else {
        setMessage(result.message || 'Failed to save company profile')
        setIsSuccess(false)
      }
    } catch (error) {
      console.error('Error saving company data:', error)
      setMessage('Error saving company profile. Please try again.')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file, type) => {
    try {
      const token = sessionStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`http://localhost:8080/api/company/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()
      console.log(`${type} upload response:`, result)

      if (response.ok && result.success) {
        console.log(`${type} uploaded successfully`)
      } else {
        console.error(`Failed to upload ${type}:`, result.message)
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
    }
  }

  const handleCancel = () => {
    // Reset form to original state
    setFormData({
      businessName: 'My Company',
      phoneNumber: '8180039093',
      gstin: '',
      email: '',
      businessType: '',
      businessCategory: '',
      state: '',
      pincode: '',
      businessAddress: '',
      logo: null,
      signature: null
    })
    setLogoPreview(null)
    setSignaturePreview(null)
    setMessage('')
    setIsSuccess(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Edit Profile</h1>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            isSuccess 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Business Details */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Details</h2>
                
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center relative overflow-hidden">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Company Logo" 
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            console.error('Logo image failed to load:', logoPreview)
                            setLogoPreview(null)
                          }}
                          onLoad={() => console.log('Logo image loaded successfully:', logoPreview)}
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-blue-600 text-sm font-medium">Add Logo</div>
                        </div>
                      )}
                      {/* Blue border segment at top */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-full"></div>
                      {/* Edit icon */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GSTIN
                    <svg className="inline w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    placeholder="Enter GSTIN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Email ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter Email ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Middle Column - More Details */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">More Details</h2>
                
                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <div className="relative">
                     <select
                       name="businessType"
                       value={formData.businessType}
                       onChange={handleInputChange}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                     >
                       <option value="">Select Business Type</option>
                       <option value="retail">Retail</option>
                       <option value="wholesale">Wholesale</option>
                       <option value="distributor">Distributor</option>
                       <option value="service">Service</option>
                       <option value="manufacturing">Manufacturing</option>
                       <option value="others">Others</option>
                     </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Business Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Category
                  </label>
                  <div className="relative">
                     <select
                       name="businessCategory"
                       value={formData.businessCategory}
                       onChange={handleInputChange}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                     >
                       <option value="">Select Business Category</option>
                       <option value="accounting-ca">Accounting & CA</option>
                       <option value="interior-designer">Interior Designer</option>
                       <option value="automobiles-auto-parts">Automobiles/ Auto parts</option>
                       <option value="salon-spa">Salon & Spa</option>
                       <option value="liquor-store">Liquor Store</option>
                       <option value="book-stationary-store">Book / Stationary store</option>
                       <option value="construction-materials-equipment">Construction Materials & Equipment</option>
                       <option value="repairing-plumbing-electrician">Repairing/ Plumbing/ Electrician</option>
                       <option value="chemicals-fertilizers">Chemicals & Fertilizers</option>
                       <option value="computer-equipments-softwares">Computer Equipments & Softwares</option>
                       <option value="electrical-electronics-equipments">Electrical & Electronics Equipments</option>
                       <option value="fashion-accessory-cosmetics">Fashion Accessory/ Cosmetics</option>
                       <option value="tailoring-boutique">Tailoring/ Boutique</option>
                       <option value="fruit-and-vegetable">Fruit And Vegetable</option>
                       <option value="kirana-general-merchant">Kirana/ General Merchant</option>
                       <option value="fmcg-products">FMCG Products</option>
                       <option value="dairy-farm-products-poultry">Dairy Farm Products/ Poultry</option>
                       <option value="furniture">Furniture</option>
                       <option value="garment-fashion-hosiery">Garment/Fashion & Hosiery</option>
                       <option value="jewellery-gems">Jewellery & Gems</option>
                       <option value="pharmacy-medical">Pharmacy/ Medical</option>
                       <option value="hardware-store">Hardware Store</option>
                       <option value="industrial-machinery-equipment">Industrial Machinery & Equipment</option>
                       <option value="mobile-accessories">Mobile & Accessories</option>
                       <option value="nursery-plants">Nursery/ Plants</option>
                       <option value="petroleum-bulk-stations-terminals-petrol">Petroleum Bulk Stations & Terminals/ Petrol</option>
                       <option value="restaurant-hotel">Restaurant/ Hotel</option>
                       <option value="footwear">Footwear</option>
                       <option value="paper-paper-products">Paper & Paper Products</option>
                       <option value="sweet-shop-bakery">Sweet Shop/ Bakery</option>
                       <option value="gifts-toys">Gifts & Toys</option>
                       <option value="laundry-washing-dry-clean">Laundry/ Washing/ Dry clean</option>
                       <option value="coaching-training">Coaching & Training</option>
                       <option value="renting-leasing">Renting & Leasing</option>
                       <option value="fitness-center">Fitness Center</option>
                       <option value="oil-gas">Oil & Gas</option>
                       <option value="real-estate">Real Estate</option>
                       <option value="ngo-charitable-trust">NGO & Charitable trust</option>
                       <option value="tours-travels">Tours & Travels</option>
                       <option value="others">Others</option>
                     </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <div className="relative">
                     <select
                       name="state"
                       value={formData.state}
                       onChange={handleInputChange}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                     >
                       <option value="">Select State</option>
                       <option value="andhra-pradesh">Andhra Pradesh</option>
                       <option value="arunachal-pradesh">Arunachal Pradesh</option>
                       <option value="assam">Assam</option>
                       <option value="bihar">Bihar</option>
                       <option value="chhattisgarh">Chhattisgarh</option>
                       <option value="goa">Goa</option>
                       <option value="gujarat">Gujarat</option>
                       <option value="haryana">Haryana</option>
                       <option value="himachal-pradesh">Himachal Pradesh</option>
                       <option value="jharkhand">Jharkhand</option>
                       <option value="karnataka">Karnataka</option>
                       <option value="kerala">Kerala</option>
                       <option value="madhya-pradesh">Madhya Pradesh</option>
                       <option value="maharashtra">Maharashtra</option>
                       <option value="manipur">Manipur</option>
                       <option value="meghalaya">Meghalaya</option>
                       <option value="mizoram">Mizoram</option>
                       <option value="nagaland">Nagaland</option>
                       <option value="odisha">Odisha</option>
                       <option value="punjab">Punjab</option>
                       <option value="rajasthan">Rajasthan</option>
                       <option value="sikkim">Sikkim</option>
                       <option value="tamil-nadu">Tamil Nadu</option>
                       <option value="telangana">Telangana</option>
                       <option value="tripura">Tripura</option>
                       <option value="uttar-pradesh">Uttar Pradesh</option>
                       <option value="uttarakhand">Uttarakhand</option>
                       <option value="west-bengal">West Bengal</option>
                       <option value="andaman-nicobar-islands">Andaman and Nicobar Islands</option>
                       <option value="chandigarh">Chandigarh</option>
                       <option value="dadra-nagar-haveli-daman-diu">Dadra and Nagar Haveli and Daman and Diu</option>
                       <option value="delhi">Delhi</option>
                       <option value="jammu-kashmir">Jammu and Kashmir</option>
                       <option value="ladakh">Ladakh</option>
                       <option value="lakshadweep">Lakshadweep</option>
                       <option value="puducherry">Puducherry</option>
                     </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter Pincode"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Column - Business Address and Signature */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Address</h2>
                
                {/* Business Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <textarea
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    placeholder="Enter Business Address"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Add Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Signature
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {signaturePreview ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={signaturePreview} 
                          alt="Signature Preview" 
                          className="max-w-full max-h-32 object-contain mb-2"
                          onError={(e) => {
                            console.error('Signature image failed to load:', signaturePreview)
                            setSignaturePreview(null)
                          }}
                          onLoad={() => console.log('Signature image loaded successfully:', signaturePreview)}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'signature')}
                          className="hidden"
                          id="signature-upload"
                        />
                        <label htmlFor="signature-upload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          Change Signature
                        </label>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'signature')}
                          className="hidden"
                          id="signature-upload"
                        />
                        <label htmlFor="signature-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-gray-600">Upload Signature</span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
