'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { authService } from '../../../lib/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function RegisterPage() {
  const [registerType, setRegisterType] = useState('email')
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [phone, setPhone] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    const phoneParam = searchParams.get('phone')
    const verified = searchParams.get('verified')
    
    if (phoneParam && verified === 'true') {
      setPhone(phoneParam)
      setRegisterType('phone')
      setOtpSent(true)
    }
  }, [searchParams])

  const sendOtp = async (data) => {
    setIsLoading(true)
    try {
      const response = await authService.sendOtp(data.phone)
      
      if (response.success) {
        setPhone(data.phone)
        setOtpSent(true)
        toast.success('OTP sent successfully!')
      } else {
        toast.error(response.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      let response

      if (registerType === 'phone' && otpSent) {
        // Register with OTP
        const registerData = {
          username: data.username,
          password: data.password,
          email: data.email || null,
          phone: phone,
          businessName: data.businessName,
          registerType: 'phone'
        }
        response = await authService.registerWithOtp(registerData)
      } else {
        // Register with email/password
        const registerData = {
          username: data.username,
          password: data.password,
          email: data.email,
          phone: data.phone || null,
          businessName: data.businessName,
          registerType: 'email'
        }
        response = await authService.register(registerData)
      }
      
      if (response.success) {
        toast.success('Registration successful!')
        router.push('/dashboard')
      } else {
        toast.error(response.message || 'Registration failed')
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (registerType === 'phone' && !otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Register with Phone
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your phone number to receive OTP
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(sendOtp)} suppressHydrationWarning>
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Please enter a valid 10-digit Indian mobile number'
                  }
                })}
                type="tel"
                className="input-field"
                placeholder="9876543210"
                suppressHydrationWarning
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setRegisterType('email')}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Register with email instead
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning>
          <div className="space-y-4">
            {/* Registration Type Toggle */}
            {!otpSent && (
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setRegisterType('email')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border ${
                    registerType === 'email'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterType('phone')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    registerType === 'phone'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Phone
                </button>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                {...register('username', { 
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  }
                })}
                type="text"
                className="input-field"
                placeholder="Enter username"
                suppressHydrationWarning
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field (only for email registration) */}
            {registerType === 'email' && (
              <div>
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  type="email"
                  className="input-field"
                  placeholder="Enter email"
                  suppressHydrationWarning
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            )}

            {/* Phone Field (only for phone registration) */}
            {registerType === 'phone' && otpSent && (
              <div>
                <label className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  disabled
                  className="input-field bg-gray-100"
                  suppressHydrationWarning
                />
                <p className="mt-1 text-sm text-green-600">✓ OTP verified</p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                className="input-field"
                placeholder="Enter password"
                suppressHydrationWarning
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Business Name Field */}
            <div>
              <label htmlFor="businessName" className="form-label">
                Business Name
              </label>
              <input
                {...register('businessName', { required: 'Business name is required' })}
                type="text"
                className="input-field"
                placeholder="Enter your business name"
                suppressHydrationWarning
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
