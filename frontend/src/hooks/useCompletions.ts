import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  // API functions
  getUserTopicCompletions,
  getUserCpCompletions,
  getUserObjectiveCompletions,
  getUserOutcomeCompletions,
  markTopicCompleted,
  markCpCompleted,
  markObjectiveCompleted,
  markOutcomeCompleted,
  deleteTopicCompletion,
  deleteCpCompletion,
  deleteObjectiveCompletion,
  deleteOutcomeCompletion,
  
  // SWR keys
  TOPIC_COMPLETIONS_SWR_KEY,
  CP_COMPLETIONS_SWR_KEY,
  OBJECTIVE_COMPLETIONS_SWR_KEY,
  OUTCOME_COMPLETIONS_SWR_KEY,
  
  // Types
  TopicCompletion,
  CpCompletion,
  ObjectiveCompletion,
  OutcomeCompletion,
  TopicCompletionRequest,
  CpCompletionRequest,
  ObjectiveCompletionRequest,
  OutcomeCompletionRequest
} from '@/lib/api/completions'

import { useCompletionsStore } from '@/store/slices/completions'
import { handleError } from '@/helpers/helpers'

// Topic completions hook
export const useTopicCompletions = () => {
  const store = useCompletionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    TOPIC_COMPLETIONS_SWR_KEY,
    async () => {
      try {
        console.log("Fetching topic completions");
        const data = await getUserTopicCompletions();
        return data;
      } catch (error) {
        console.error("Error fetching topic completions:", error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('🟢 [useTopicCompletions] SWR success, setting completions in store')
        store.setTopicCompletions(data || [])
        store.setLoadingTopicCompletions(false)
        store.setTopicCompletionsError(null)
      },
      onError: (error) => {
        console.error('🔴 [useTopicCompletions] SWR error:', error)
        let errorMessage = 'Failed to load topic completions'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setTopicCompletionsError(errorMessage)
        store.setLoadingTopicCompletions(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
      errorRetryCount: 3,
    }
  )

  // Update store loading state
  useEffect(() => {
    if (isLoading !== store.isLoadingTopicCompletions) {
      store.setLoadingTopicCompletions(isLoading)
    }
  }, [isLoading, store.isLoadingTopicCompletions, store.setLoadingTopicCompletions])

  return {
    topicCompletions: data || [],
    isLoading,
    error: error ? 'Failed to load topic completions' : null,
    mutate,
    // Store state and actions
    isTopicCompleted: store.isTopicCompleted,
    getTopicCompletion: store.getTopicCompletion,
  }
}

// CP completions hook
export const useCpCompletions = () => {
  const store = useCompletionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    CP_COMPLETIONS_SWR_KEY,
    async () => {
      try {
        console.log("Fetching CP completions");
        const data = await getUserCpCompletions();
        return data;
      } catch (error) {
        console.error("Error fetching CP completions:", error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('🟢 [useCpCompletions] SWR success, setting completions in store')
        store.setCpCompletions(data || [])
        store.setLoadingCpCompletions(false)
        store.setCpCompletionsError(null)
      },
      onError: (error) => {
        console.error('🔴 [useCpCompletions] SWR error:', error)
        let errorMessage = 'Failed to load CP completions'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setCpCompletionsError(errorMessage)
        store.setLoadingCpCompletions(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state
  useEffect(() => {
    if (isLoading !== store.isLoadingCpCompletions) {
      store.setLoadingCpCompletions(isLoading)
    }
  }, [isLoading, store.isLoadingCpCompletions, store.setLoadingCpCompletions])

  return {
    cpCompletions: data || [],
    isLoading,
    error: error ? 'Failed to load CP completions' : null,
    mutate,
    // Store state and actions
    isCpCompleted: store.isCpCompleted,
    getCpCompletion: store.getCpCompletion,
  }
}

// Objective completions hook
export const useObjectiveCompletions = () => {
  const store = useCompletionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    OBJECTIVE_COMPLETIONS_SWR_KEY,
    async () => {
      try {
        console.log("Fetching objective completions");
        const data = await getUserObjectiveCompletions();
        return data;
      } catch (error) {
        console.error("Error fetching objective completions:", error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('🟢 [useObjectiveCompletions] SWR success, setting completions in store')
        store.setObjectiveCompletions(data || [])
        store.setLoadingObjectiveCompletions(false)
        store.setObjectiveCompletionsError(null)
      },
      onError: (error) => {
        console.error('🔴 [useObjectiveCompletions] SWR error:', error)
        let errorMessage = 'Failed to load objective completions'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setObjectiveCompletionsError(errorMessage)
        store.setLoadingObjectiveCompletions(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state
  useEffect(() => {
    if (isLoading !== store.isLoadingObjectiveCompletions) {
      store.setLoadingObjectiveCompletions(isLoading)
    }
  }, [isLoading, store.isLoadingObjectiveCompletions, store.setLoadingObjectiveCompletions])

  return {
    objectiveCompletions: data || [],
    isLoading,
    error: error ? 'Failed to load objective completions' : null,
    mutate,
    // Store state and actions
    isObjectiveCompleted: store.isObjectiveCompleted,
    getObjectiveCompletion: store.getObjectiveCompletion,
  }
}

// Outcome completions hook
export const useOutcomeCompletions = () => {
  const store = useCompletionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    OUTCOME_COMPLETIONS_SWR_KEY,
    async () => {
      try {
        console.log("Fetching outcome completions");
        const data = await getUserOutcomeCompletions();
        return data;
      } catch (error) {
        console.error("Error fetching outcome completions:", error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('🟢 [useOutcomeCompletions] SWR success, setting completions in store')
        store.setOutcomeCompletions(data || [])
        store.setLoadingOutcomeCompletions(false)
        store.setOutcomeCompletionsError(null)
      },
      onError: (error) => {
        console.error('🔴 [useOutcomeCompletions] SWR error:', error)
        let errorMessage = 'Failed to load outcome completions'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setOutcomeCompletionsError(errorMessage)
        store.setLoadingOutcomeCompletions(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state
  useEffect(() => {
    if (isLoading !== store.isLoadingOutcomeCompletions) {
      store.setLoadingOutcomeCompletions(isLoading)
    }
  }, [isLoading, store.isLoadingOutcomeCompletions, store.setLoadingOutcomeCompletions])

  return {
    outcomeCompletions: data || [],
    isLoading,
    error: error ? 'Failed to load outcome completions' : null,
    mutate,
    // Store state and actions
    isOutcomeCompleted: store.isOutcomeCompleted,
    getOutcomeCompletion: store.getOutcomeCompletion,
  }
}

// Combined hook for all completions
export const useAllCompletions = () => {
  const { topicCompletions, isLoading: isLoadingTopics, error: topicError, mutate: mutateTopics } = useTopicCompletions()
  const { cpCompletions, isLoading: isLoadingCps, error: cpError, mutate: mutateCps } = useCpCompletions()
  const { objectiveCompletions, isLoading: isLoadingObjectives, error: objectiveError, mutate: mutateObjectives } = useObjectiveCompletions()
  const { outcomeCompletions, isLoading: isLoadingOutcomes, error: outcomeError, mutate: mutateOutcomes } = useOutcomeCompletions()
  
  const isLoading = isLoadingTopics || isLoadingCps || isLoadingObjectives || isLoadingOutcomes
  const error = topicError || cpError || objectiveError || outcomeError
  
  const mutateAll = useCallback(() => {
    mutateTopics()
    mutateCps()
    mutateObjectives()
    mutateOutcomes()
  }, [mutateTopics, mutateCps, mutateObjectives, mutateOutcomes])
  
  return {
    topicCompletions,
    cpCompletions,
    objectiveCompletions,
    outcomeCompletions,
    isLoading,
    error,
    mutateAll
  }
}

// Completion mutations interface
interface UseCompletionsMutationsReturn {
  // Topic mutations
  markTopicComplete: (topicId: string) => Promise<TopicCompletion>
  unmarkTopicComplete: (topicId: string) => Promise<void>
  
  // CP mutations
  markCpComplete: (cpId: string) => Promise<CpCompletion>
  unmarkCpComplete: (cpId: string) => Promise<void>
  
  // Objective mutations
  markObjectiveComplete: (objectiveId: string) => Promise<ObjectiveCompletion>
  unmarkObjectiveComplete: (objectiveId: string) => Promise<void>
  
  // Outcome mutations
  markOutcomeComplete: (outcomeId: string) => Promise<OutcomeCompletion>
  unmarkOutcomeComplete: (outcomeId: string) => Promise<void>
  
  // Loading state
  isSubmitting: boolean
}

// Hook for completion mutations
export const useCompletionsMutations = (): UseCompletionsMutationsReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const store = useCompletionsStore()
  
  // Topic mutations
  const markTopicComplete = useCallback(async (topicId: string): Promise<TopicCompletion> => {
    try {
      setIsSubmitting(true)
      console.log(`Marking topic ${topicId} as completed`);
      const result = await markTopicCompleted({ topic_id: topicId })
      
      // Update store
      store.addTopicCompletion(result)
      
      // Show success toast
      toast.success('Topic marked as completed')
      
      return result
    } catch (error) {
      handleError(error, 'Failed to mark topic as completed')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [store])
  
  const unmarkTopicComplete = useCallback(async (topicId: string): Promise<void> => {
    try {
      setIsSubmitting(true)
      console.log(`Removing completion for topic ${topicId}`);
      await deleteTopicCompletion({ topic_id: topicId })
      
      // Update store
      store.removeTopicCompletion(topicId)
      
      // Show success toast
      toast.success('Topic completion removed')
    } catch (error) {
      handleError(error, 'Failed to remove topic completion')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [store])
  
  // CP mutations
  const markCpComplete = useCallback(async (cpId: string): Promise<CpCompletion> => {
    try {
      setIsSubmitting(true)
      console.log(`Marking CP ${cpId} as completed`);
      const result = await markCpCompleted({ cp_id: cpId })
      
      // Update store
      store.addCpCompletion(result)
      
      // Show success toast
      toast.success('Concept practice marked as completed')
      
      return result
    } catch (error) {
      handleError(error, 'Failed to mark concept practice as completed')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [store])
  
  const unmarkCpComplete = useCallback(async (cpId: string): Promise<void> => {
    try {
      setIsSubmitting(true)
      console.log(`Removing completion for CP ${cpId}`);
      await deleteCpCompletion({ cp_id: cpId })
      
      // Update store
      store.removeCpCompletion(cpId)
      
      // Show success toast
      toast.success('Concept practice completion removed')
    } catch (error) {
      handleError(error, 'Failed to remove concept practice completion')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [store])
  
  // Objective mutations
  const markObjectiveComplete = useCallback(async (objectiveId: string): Promise<ObjectiveCompletion> => {
    try {
      setIsSubmitting(true)
      console.log(`Marking objective ${objectiveId} as completed`);
      const result = await markObjectiveCompleted({ objective_item_id: objectiveId })
      
      // Update store
      store.addObjectiveCompletion(result)
      
      // Show success toast
      toast.success('Learning objective marked as completed')
      
      return result
    } catch (error) {
      handleError(error, 'Failed to mark learning objective as completed')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [store])
  
  const unmarkObjectiveComplete = useCallback(async (objectiveId: string): Promise<void> => {
    try {
      setIsSubmitting(true)
      console.log(`Removing completion for objective ${objectiveId}`);
      await deleteObjectiveCompletion({ objective_item_id: objectiveId })
      
      // Update store
      store.removeObjectiveCompletion(objectiveId)
      
      // Show success toast
      toast.success('Learning objective completion removed')
    } catch (error) {
      handleError(error, 'Failed to remove learning objective completion')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [store])
  
  // Outcome mutations
  const markOutcomeComplete = useCallback(async (outcomeId: string): Promise<OutcomeCompletion> => {
    try {
      setIsSubmitting(true)
      console.log(`Marking outcome ${outcomeId} as completed`);
      const result = await markOutcomeCompleted({ outcome_item_id: outcomeId })
      
      // Update store
      store.addOutcomeCompletion(result)
      
      // Show success toast
      toast.success('Learning outcome marked as completed')
      
      return result
    } catch (error) {
      handleError(error, 'Failed to mark learning outcome as completed')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [store])
  
  const unmarkOutcomeComplete = useCallback(async (outcomeId: string): Promise<void> => {
    try {
      setIsSubmitting(true)
      console.log(`Removing completion for outcome ${outcomeId}`);
      await deleteOutcomeCompletion({ outcome_item_id: outcomeId })
      
      // Update store
      store.removeOutcomeCompletion(outcomeId)
      
      // Show success toast
      toast.success('Learning outcome completion removed')
    } catch (error) {
      handleError(error, 'Failed to remove learning outcome completion')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [store])
  
  return {
    markTopicComplete,
    unmarkTopicComplete,
    markCpComplete,
    unmarkCpComplete,
    markObjectiveComplete,
    unmarkObjectiveComplete,
    markOutcomeComplete,
    unmarkOutcomeComplete,
    isSubmitting
  }
}

// Hook for completion stats
export const useCompletionStats = () => {
  const store = useCompletionsStore()
  return store.getCompletionStats()
} 