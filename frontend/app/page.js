'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          GST Accounting App
        </h1>
        <p className="text-gray-600">
          Loading...
        </p>
      </div>
    </div>
  )
}
