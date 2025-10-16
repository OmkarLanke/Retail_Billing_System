'use client'

import { useEffect, useState } from 'react'

export default function SuppressHydrationWarning({ children, ...props }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div {...props}>{children}</div>
  }

  return <div {...props} suppressHydrationWarning>{children}</div>
}
