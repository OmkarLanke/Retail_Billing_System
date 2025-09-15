'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { authService } from '../../../lib/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function OtpLoginPage() {
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    const phoneParam = searchParams.get('phone')
    if (phoneParam) {
      setPhone(phoneParam)
      setStep('otp')
      // Auto-send OTP when coming from login page
      sendOtp({ phone: phoneParam })
    }
  }, [searchParams])

  const sendOtp = async (data) => {
    setIsLoading(true)
    try {
      const phoneNumber = data.phone || data
      const response = await authService.sendOtp(phoneNumber)
      
      if (response.success) {
        setPhone(phoneNumber)
        setStep('otp')
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

  const verifyOtp = async (data) => {
    setIsLoading(true)
    try {
      const response = await authService.verifyOtp(phone, data.otp)
      
      if (response.success) {
        if (response.token) {
          toast.success('Login successful!')
          router.push('/dashboard')
        } else {
          toast.success('OTP verified! Please complete registration.')
          router.push(`/auth/register?phone=${phone}&verified=true`)
        }
      } else {
        toast.error(response.message || 'Invalid OTP')
      }
    } catch (error) {
      toast.error(error.message || 'OTP verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Login with OTP
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your phone number to receive OTP
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(sendOtp)}>
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
              <Link href="/auth/login" className="text-sm text-primary-600 hover:text-primary-500">
                Login with password instead
              </Link>
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
            Verify OTP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit OTP sent to {phone}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(verifyOtp)}>
          <div>
            <label htmlFor="otp" className="form-label">
              OTP
            </label>
            <input
              {...register('otp', { 
                required: 'OTP is required',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'Please enter a valid 6-digit OTP'
                }
              })}
              type="text"
              maxLength="6"
              className="input-field text-center text-2xl tracking-widest"
              placeholder="123456"
            />
            {errors.otp && (
              <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button
              type="button"
              onClick={() => sendOtp(phone)}
              disabled={isLoading}
              className="w-full py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Change phone number
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
