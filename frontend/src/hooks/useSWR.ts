import useSWR, { SWRConfiguration, SWRResponse } from 'swr'
import useSWRMutation from 'swr/mutation'

// Generic API response type
interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

// Custom error interface extending Error
interface ApiError extends Error {
  info?: any
  status?: number
}

// Custom fetcher with error handling
const apiFetcher = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = new Error('API request failed') as ApiError
    error.info = await response.json().catch(() => ({}))
    error.status = response.status
    throw error
  }

  return response.json()
}

// POST/PUT/DELETE fetcher for mutations
const mutationFetcher = async (url: string, { arg }: { arg: any }) => {
  const { method = 'POST', data, ...options } = arg

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  })

  if (!response.ok) {
    const error = new Error('API mutation failed') as ApiError
    error.info = await response.json().catch(() => ({}))
    error.status = response.status
    throw error
  }

  return response.json()
}

// Custom hook for GET requests
export function useApi<T = any>(
  url: string | null,
  config?: SWRConfiguration
): SWRResponse<ApiResponse<T>, ApiError> {
  return useSWR(url, apiFetcher, {
    revalidateOnFocus: false,
    ...config,
  })
}

// Custom hook for mutations (POST, PUT, DELETE)
export function useApiMutation<T = any>(url: string) {
  return useSWRMutation(url, mutationFetcher)
}

// Specific hooks for common endpoints
export function useUser(userId?: string) {
  return useApi(userId ? `/api/users/${userId}` : null)
}

export function useCourses() {
  return useApi('/api/courses')
}

export function useCourse(courseId?: string) {
  return useApi(courseId ? `/api/courses/${courseId}` : null)
}

export function useCohorts() {
  return useApi('/api/cohorts')
}

export function useCohort(cohortId?: string) {
  return useApi(cohortId ? `/api/cohorts/${cohortId}` : null)
}

// Mutation hooks
export function useCreateCourse() {
  return useApiMutation('/api/courses')
}

export function useUpdateCourse(courseId: string) {
  return useApiMutation(`/api/courses/${courseId}`)
}

export function useDeleteCourse(courseId: string) {
  return useApiMutation(`/api/courses/${courseId}`)
} 