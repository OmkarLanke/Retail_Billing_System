'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { authService } from '../../../lib/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LoginPage() {
  const [loginType, setLoginType] = useState('email')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      if (loginType === 'phone') {
        // For phone login, redirect to OTP login page
        router.push(`/auth/otp-login?phone=${data.username}`)
        return
      }

      const loginData = {
        username: data.username,
        password: data.password,
        loginType: loginType
      }

      const response = await authService.login(loginData)
      
      if (response.success) {
        toast.success('Login successful!')
        router.push('/dashboard')
      } else {
        toast.error(response.message || 'Login failed')
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Login Type Toggle */}
            <div className="flex rounded-md shadow-sm mb-4">
              <button
                type="button"
                onClick={() => setLoginType('email')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border ${
                  loginType === 'email'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Email/Username
              </button>
              <button
                type="button"
                onClick={() => setLoginType('phone')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  loginType === 'phone'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Phone
              </button>
            </div>

            {/* Username/Email/Phone Field */}
            <div>
              <label htmlFor="username" className="form-label">
                {loginType === 'phone' ? 'Phone Number' : 'Email/Username'}
              </label>
              <input
                {...register('username', { 
                  required: 'This field is required',
                  pattern: loginType === 'phone' ? {
                    value: /^[6-9]\d{9}$/,
                    message: 'Please enter a valid 10-digit Indian mobile number'
                  } : undefined
                })}
                type={loginType === 'phone' ? 'tel' : 'text'}
                className="input-field"
                placeholder={loginType === 'phone' ? '9876543210' : 'Enter email or username'}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field - only show for email/username login */}
            {loginType === 'email' && (
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  className="input-field"
                  placeholder="Enter password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : loginType === 'phone' ? 'Send OTP' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/otp-login" className="text-sm text-primary-600 hover:text-primary-500">
              Login with OTP instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
