import useSWR from 'swr'
import { useCallback } from 'react'
import { toast } from 'sonner'
import * as submissionsApi from '@/lib/api/submissions'
import { handleError } from '@/helpers/helpers'
import { USER_AP_SUBMISSIONS_SWR_KEY } from '@/lib/api/submissions'
import { useSubmissionsStore } from '@/store/slices/submissions'

// Type for the submissions hook return
interface UseSubmissionsReturn {
  submissions: submissionsApi.ApSubmission[]
  isLoading: boolean
  error: string | null
  mutate: () => void
  // Store state
  filteredSubmissions: submissionsApi.ApSubmission[]
  selectedSubmission: submissionsApi.ApSubmission | null
  searchTerm: string
  apFilter: string | null
  statusFilter: 'all' | 'correct' | 'incorrect'
  // Store actions
  setSearchTerm: (term: string) => void
  setApFilter: (apId: string | null) => void
  setStatusFilter: (status: 'all' | 'correct' | 'incorrect') => void
  filterSubmissions: () => void
  resetFilters: () => void
  setSubmissions: (submissions: submissionsApi.ApSubmission[]) => void
  addSubmission: (submission: submissionsApi.ApSubmission) => void
  setSelectedSubmission: (submission: submissionsApi.ApSubmission | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Main submissions hook for user's AP submissions
export const useUserApSubmissions = (): UseSubmissionsReturn => {
  const store = useSubmissionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    USER_AP_SUBMISSIONS_SWR_KEY,
    () => submissionsApi.getUserApSubmissions(),
    {
      onSuccess: (data) => {
        console.log('🟢 [useUserApSubmissions] SWR success, setting submissions in store')
        store.setSubmissions(data || [])
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useUserApSubmissions] SWR error:', error)
        let errorMessage = 'Failed to load submissions'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
        store.setLoading(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    submissions: data || [],
    isLoading,
    error: error ? 'Failed to load submissions' : null,
    mutate,
    // Store state
    filteredSubmissions: store.filteredSubmissions,
    selectedSubmission: store.selectedSubmission,
    searchTerm: store.searchTerm,
    apFilter: store.apFilter,
    statusFilter: store.statusFilter,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setApFilter: store.setApFilter,
    setStatusFilter: store.setStatusFilter,
    filterSubmissions: store.filterSubmissions,
    resetFilters: store.resetFilters,
    setSubmissions: store.setSubmissions,
    addSubmission: store.addSubmission,
    setSelectedSubmission: store.setSelectedSubmission,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for submissions mutations hook return
interface UseSubmissionsMutationsReturn {
  submitAp: (data: submissionsApi.CreateApSubmissionDto) => Promise<{ submission: submissionsApi.ApSubmission, isCorrect: boolean }>
  // Store state
  isSubmitting: boolean
}

// Hook for submission mutations
export const useSubmissionsMutations = (): UseSubmissionsMutationsReturn => {
  const store = useSubmissionsStore()
  
  const submitAp = useCallback(async (data: submissionsApi.CreateApSubmissionDto) => {
    try {
      store.setSubmitting(true)
      
      const validationErrors = submissionsApi.validateSubmissionCode(data.submission_code)
      if (validationErrors) {
        throw new Error('Validation failed: ' + Object.values(validationErrors).join(', '))
      }
      
      const result = await submissionsApi.submitAp(data)
      
      // Add the submission to the store
      if (result && result.submission) {
        store.addSubmission(result.submission)
      }
      
      // Show success message based on correctness
      if (result.isCorrect) {
        toast.success('Correct solution! Submission successful.')
      } else {
        toast.error('Incorrect solution, but submission was recorded.')
      }
      
      return result
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  return {
    submitAp,
    isSubmitting: store.isSubmitting
  }
} 