'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

// Use our centralized API client as the fetcher
import { apiRequest } from '@/helpers/request'

const fetcher = async (url: string) => {
  return apiRequest.get(url)
}

interface SWRProviderProps {
  children: ReactNode
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        // Global configuration optimized for auth flow
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
        errorRetryCount: 0, // Completely disable retries
        errorRetryInterval: 0,
        dedupingInterval: 10000,
        refreshInterval: 0,
        // Disable automatic reconnection attempts
        isOnline: () => true, // Override online detection
        isVisible: () => true, // Override visibility detection
        onError: (error, key) => {
          // Don't log 401 errors (user not authenticated) as they're expected
          if (error?.response?.status !== 401) {
            // Also suppress reconnection-related errors
            const errorMessage = error?.message || '';
            if (!errorMessage.includes('reconnection') && !errorMessage.includes('Max reconnection')) {
              console.error('SWR Error:', error, 'Key:', key)
            }
          }
        },
        onSuccess: (data, key, config) => {
          // Optional: Log successful requests in development
          if (process.env.NODE_ENV === 'development') {
            console.log('SWR Success:', key, data)
          }
        }
      }}
    >
      {children}
    </SWRConfig>
  )
} 