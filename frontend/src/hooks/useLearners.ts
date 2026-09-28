import { useState } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { 
  getAllLearnerProfiles, 
  getLearnerProfileById, 
  addLearnerByEmail, 
  addLearnersBatch,
  deactivateLearner,
  reactivateLearner
} from '@/lib/api/learners'
import { useLearnersStore } from '@/store/slices/learners'
import { handleError } from '@/helpers/helpers'
import { API_MESSAGES, SWR_KEYS } from '@/helpers/string_const'
import { LearnerProfile, AddLearnerResponse, BatchAddResponse } from '@/lib/types/learner'

// Custom hook for fetching all learners (Admin)
export const useLearners = () => {
  const { 
    setLearners, 
    setLoading, 
    setError,
    learners,
    isLoading: storeLoading,
    error: storeError
  } = useLearnersStore()

  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.LEARNERS,
    async () => {
      try {
        setLoading(true)
        setError(null)
        const learnerProfiles = await getAllLearnerProfiles()
        
        setLearners(learnerProfiles)
        return learnerProfiles
      } catch (error) {
        console.error('❌ [useLearners] Error fetching learners:', error)
        setError((error as Error).message)
        handleError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  )

  return {
    learners: data || learners,
    error: error || storeError,
    isLoading: isLoading || storeLoading,
    mutate,
  }
}

// Custom hook for fetching individual learner (Admin)
export const useLearner = (learnerId?: string) => {
  const { setSelectedLearner, selectedLearner } = useLearnersStore()

  const { data, error, isLoading, mutate } = useSWR(
    learnerId ? `${SWR_KEYS.LEARNERS}/${learnerId}` : null,
    async () => {
      if (!learnerId) return null
      
      try {
        const learnerProfile = await getLearnerProfileById(learnerId)
        
        setSelectedLearner(learnerProfile)
        return learnerProfile
      } catch (error) {
        console.error('❌ [useLearner] Error fetching learner:', error)
        handleError(error)
        throw error
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  )

  return {
    learner: data || selectedLearner,
    error,
    isLoading,
    mutate,
  }
}

// Custom hook for adding a single learner by email (Admin)
export const useAddLearner = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { addLearner, setError, learners } = useLearnersStore()
  const { mutate } = useLearners() // Access SWR mutate for cache sync

  const addLearner_fn = async (email: string): Promise<AddLearnerResponse['data']> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await addLearnerByEmail(email)
      
      toast.success(API_MESSAGES.LEARNER_ADDED_SUCCESS)

      // Try to fetch fresh profile for the new learner and add to state/cache
      try {
        if (response?.user_id) {
          const profileResp = await getLearnerProfileById(response.user_id)
          
          // 1) Update Zustand store
          addLearner(profileResp)

          // 2) Update SWR cache optimistically without revalidation
          mutate((prev: LearnerProfile[] | undefined) => {
            if (!prev) return [profileResp]
            // Prevent duplicate
            const exists = prev.some(p => p.id === profileResp.id)
            return exists ? prev : [profileResp, ...prev]
          }, { revalidate: false })
        }
      } catch (err) {
        console.warn('Unable to fetch newly added learner profile:', err)
      }
      
      return response
    } catch (error) {
      console.error('❌ [useAddLearner] Error adding learner:', error)
      setError((error as Error).message)
      handleError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    addLearner: addLearner_fn,
    isLoading,
  }
}

// Custom hook for batch adding learners (Admin)
export const useAddLearnersBatch = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { setError, addLearner } = useLearnersStore()
  const { mutate } = useLearners() // Access SWR mutate for cache sync

  const addLearnersBatch_fn = async (emails: string[]): Promise<BatchAddResponse['data']> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await addLearnersBatch(emails)
      
      const { successful, failed, totalRequested } = response
      
      if (failed === 0) {
        toast.success(`${API_MESSAGES.LEARNER_BATCH_SUCCESS} (${successful}/${totalRequested})`)
      } else {
        toast.warning(`Added ${successful}/${totalRequested} learners. ${failed} failed.`)
      }
      
      // For each successful result, attempt to fetch and add profile on the fly
      const fetchPromises = response.results
        .filter(r => r.success && r.data?.user_id)
        .map(async (r) => {
          try {
            const profRes = await getLearnerProfileById(r.data!.user_id)
            
            // Update store and cache
            addLearner(profRes)
            mutate((prev: LearnerProfile[] | undefined) => {
              if (!prev) return [profRes]
              const exists = prev.some(p => p.id === profRes.id)
              return exists ? prev : [profRes, ...prev]
            }, { revalidate: false })
          } catch (e) {
            console.warn('Failed to fetch profile for', r.email)
          }
        })

      // Execute all profile fetches in parallel
      await Promise.allSettled(fetchPromises)
      
      return response
    } catch (error) {
      console.error('❌ [useAddLearnersBatch] Error adding learners:', error)
      setError((error as Error).message)
      handleError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    addLearnersBatch: addLearnersBatch_fn,
    isLoading,
  }
}

// Custom hook for deactivating a learner (Admin)
export const useDeactivateLearner = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { updateLearner, setError } = useLearnersStore()
  const { mutate } = useLearners()

  const deactivateLearner_fn = async (userId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await deactivateLearner(userId)
      
      toast.success(API_MESSAGES.LEARNER_DEACTIVATED_SUCCESS)
      
      // Update the learner status in store and cache
      updateLearner(userId, { status: 'dropout' })
      
      // Update SWR cache
      mutate((prev: LearnerProfile[] | undefined) => {
        if (!prev) return prev
        return prev.map(learner => 
          learner.user_id === userId 
            ? { ...learner, status: 'dropout' as const }
            : learner
        )
      }, { revalidate: false })
      
    } catch (error) {
      console.error('❌ [useDeactivateLearner] Error deactivating learner:', error)
      setError((error as Error).message)
      handleError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    deactivateLearner: deactivateLearner_fn,
    isLoading,
  }
}

// Custom hook for reactivating a learner (Admin)
export const useReactivateLearner = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { updateLearner, setError } = useLearnersStore()
  const { mutate } = useLearners()

  const reactivateLearner_fn = async (userId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await reactivateLearner(userId)
      
      toast.success(API_MESSAGES.LEARNER_REACTIVATED_SUCCESS)
      
      // Update the learner status in store and cache
      updateLearner(userId, { status: 'active' })
      
      // Update SWR cache
      mutate((prev: LearnerProfile[] | undefined) => {
        if (!prev) return prev
        return prev.map(learner => 
          learner.user_id === userId 
            ? { ...learner, status: 'active' as const }
            : learner
        )
      }, { revalidate: false })
      
    } catch (error) {
      console.error('❌ [useReactivateLearner] Error reactivating learner:', error)
      setError((error as Error).message)
      handleError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    reactivateLearner: reactivateLearner_fn,
    isLoading,
  }
} 