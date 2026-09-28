import useSWR from 'swr'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  getOutcomeById,
  getOutcomesByTopicId,
  createOutcome,
  createOrUpdateOutcome,
  updateHeading,
  deleteHeading,
  updateItem,
  deleteItem,
  OUTCOMES_SWR_KEY,
  OUTCOME_BY_ID_SWR_KEY,
  OUTCOMES_BY_TOPIC_SWR_KEY,
  OutcomeResponse,
  CreateOutcomeDto,
  OutcomeHeading,
  OutcomeItem,
  validateOutcome
} from '@/lib/api/outcomes'
import { useOutcomesStore } from '@/store/slices/outcomes'
import { handleError } from '@/helpers/helpers'

// Type for the outcomes hook return
interface UseOutcomesReturn {
  outcomes: OutcomeResponse[] | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<OutcomeResponse[] | null | undefined>
  // Store state
  selectedOutcome: OutcomeResponse | null
  searchTerm: string
  // Store actions
  setSearchTerm: (term: string) => void
  setOutcomes: (outcomes: OutcomeResponse[] | null) => void
  addOutcome: (outcome: OutcomeResponse) => void
  updateOutcome: (outcomeId: string, updates: Partial<OutcomeResponse>) => void
  removeOutcome: (outcomeId: string) => void
  setSelectedOutcome: (outcome: OutcomeResponse | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Hook for getting outcomes
export const useOutcomes = (): UseOutcomesReturn => {
  const store = useOutcomesStore()
  
  const { data, error, isLoading, mutate } = useSWR<OutcomeResponse[] | null>(
    OUTCOMES_SWR_KEY,
    async () => {
      try {
        // This is just a placeholder as we don't have a getAll endpoint
        // In real implementation, you might want to fetch all outcomes
        return [];
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('🟢 [useOutcomes] SWR success, setting outcomes in store')
        store.setOutcomes(data || null)
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useOutcomes] SWR error:', error)
        let errorMessage = 'Failed to load outcomes'
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

  // Update store loading state using useEffect to avoid setState during render
  useEffect(() => {
    if (isLoading !== store.isLoading) {
      store.setLoading(isLoading)
    }
  }, [isLoading, store.isLoading, store.setLoading])

  return {
    outcomes: data || null,
    isLoading,
    error: error ? 'Failed to load outcomes' : null,
    mutate,
    // Store state
    selectedOutcome: store.selectedOutcome,
    searchTerm: store.searchTerm,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setOutcomes: store.setOutcomes,
    addOutcome: store.addOutcome,
    updateOutcome: store.updateOutcome,
    removeOutcome: store.removeOutcome,
    setSelectedOutcome: store.setSelectedOutcome,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for single outcome hook return
interface UseOutcomeReturn {
  outcome: OutcomeResponse | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<OutcomeResponse | undefined>
}

// Single outcome hook
export const useOutcome = (outcomeId: string | null): UseOutcomeReturn => {
  const store = useOutcomesStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    outcomeId ? OUTCOME_BY_ID_SWR_KEY(outcomeId) : null,
    outcomeId ? () => getOutcomeById(outcomeId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useOutcome] SWR success for outcome:', outcomeId)
        if (data) {
          store.setSelectedOutcome(data)
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useOutcome] SWR error:', error)
        handleError(error)
        store.setError('Failed to load outcome')
      },
      revalidateOnFocus: false,
    }
  )

  return {
    outcome: data || null,
    isLoading,
    error: error ? 'Failed to load outcome' : null,
    mutate,
  }
}

// Type for outcomes by topic hook return
interface UseOutcomesByTopicReturn {
  outcomes: OutcomeResponse[] | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<OutcomeResponse[] | null | undefined>
}

// Outcomes by topic hook
export const useOutcomesByTopic = (topicId: string | null): UseOutcomesByTopicReturn => {
  const store = useOutcomesStore()
  
  const { data, error, isLoading, mutate } = useSWR<OutcomeResponse[] | null>(
    topicId ? OUTCOMES_BY_TOPIC_SWR_KEY(topicId) : null,
    topicId ? () => getOutcomesByTopicId(topicId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useOutcomesByTopic] SWR success for topic:', topicId)
        store.setOutcomes(data)
        
        // If there's only one outcome for this topic, set it as selected
        if (data && data.length === 1) {
          store.setSelectedOutcome(data[0])
        }
        
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useOutcomesByTopic] SWR error:', error)
        handleError(error)
        store.setError('Failed to load outcomes for topic')
      },
      revalidateOnFocus: false,
    }
  )

  return {
    outcomes: data,
    isLoading,
    error: error ? 'Failed to load outcomes for topic' : null,
    mutate,
  }
}

// Type for the outcomes mutations hook return
interface UseOutcomesMutationsReturn {
  createOutcome: (outcomeData: CreateOutcomeDto) => Promise<OutcomeResponse>
  createOrUpdateOutcome: (outcomeData: CreateOutcomeDto) => Promise<OutcomeResponse>
  updateHeading: (headingId: string, heading: string) => Promise<any>
  deleteHeading: (headingId: string) => Promise<any>
  updateItem: (itemId: string, text: string) => Promise<any>
  deleteItem: (itemId: string) => Promise<any>
  // Store state
  isSubmitting: boolean
  formErrors: Record<string, string>
  formMode: 'create' | 'edit' | 'view'
  isFormOpen: boolean
  editingOutcomeId: string | null
}

// Outcomes mutations hook
export const useOutcomesMutations = (): UseOutcomesMutationsReturn => {
  const store = useOutcomesStore()

  // Create a new outcome
  const createOutcomeHandler = useCallback(
    async (outcomeData: CreateOutcomeDto): Promise<OutcomeResponse> => {
      store.setSubmitting(true)
      store.clearFormErrors()

      try {
        // Validate the data
        const validationErrors = validateOutcome(outcomeData)
        if (Object.keys(validationErrors).length > 0) {
          store.setFormErrors(validationErrors)
          store.setSubmitting(false)
          throw new Error('Validation failed')
        }

        // Create the outcome
        const result = await createOutcome(outcomeData)
        
        // Update the store
        store.addOutcome(result)
        store.setSelectedOutcome(result)
        
        // Show success message
        toast.success('Outcome created successfully')
        
        return result
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        store.setSubmitting(false)
      }
    },
    [store]
  )

  // Create or update an outcome
  const createOrUpdateOutcomeHandler = useCallback(
    async (outcomeData: CreateOutcomeDto): Promise<OutcomeResponse> => {
      store.setSubmitting(true)
      store.clearFormErrors()

      try {
        // Validate the data
        const validationErrors = validateOutcome(outcomeData)
        if (Object.keys(validationErrors).length > 0) {
          store.setFormErrors(validationErrors)
          store.setSubmitting(false)
          throw new Error('Validation failed')
        }

        // Create or update the outcome
        const result = await createOrUpdateOutcome(outcomeData)
        
        // Update the store
        store.updateOutcome(result.id, result)
        store.setSelectedOutcome(result)
        
        // Show success message
        toast.success('Outcome saved successfully')
        
        return result
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        store.setSubmitting(false)
      }
    },
    [store]
  )

  // Update a heading
  const updateHeadingHandler = useCallback(
    async (headingId: string, heading: string): Promise<any> => {
      store.setSubmitting(true)

      try {
        // Update the heading
        const result = await updateHeading(headingId, heading)
        
        // Show success message
        toast.success('Heading updated successfully')
        
        return result
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        store.setSubmitting(false)
      }
    },
    [store]
  )

  // Delete a heading
  const deleteHeadingHandler = useCallback(
    async (headingId: string): Promise<any> => {
      store.setSubmitting(true)

      try {
        // Delete the heading
        const result = await deleteHeading(headingId)
        
        // Show success message
        toast.success('Heading deleted successfully')
        
        return result
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        store.setSubmitting(false)
      }
    },
    [store]
  )

  // Update an item
  const updateItemHandler = useCallback(
    async (itemId: string, text: string): Promise<any> => {
      store.setSubmitting(true)

      try {
        // Update the item
        const result = await updateItem(itemId, text)
        
        // Show success message
        toast.success('Item updated successfully')
        
        return result
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        store.setSubmitting(false)
      }
    },
    [store]
  )

  // Delete an item
  const deleteItemHandler = useCallback(
    async (itemId: string): Promise<any> => {
      store.setSubmitting(true)

      try {
        // Delete the item
        const result = await deleteItem(itemId)
        
        // Show success message
        toast.success('Item deleted successfully')
        
        return result
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        store.setSubmitting(false)
      }
    },
    [store]
  )

  return {
    createOutcome: createOutcomeHandler,
    createOrUpdateOutcome: createOrUpdateOutcomeHandler,
    updateHeading: updateHeadingHandler,
    deleteHeading: deleteHeadingHandler,
    updateItem: updateItemHandler,
    deleteItem: deleteItemHandler,
    // Store state
    isSubmitting: store.isSubmitting,
    formErrors: store.formErrors,
    formMode: store.formMode,
    isFormOpen: store.isFormOpen,
    editingOutcomeId: store.editingOutcomeId,
  }
}

// Type for outcomes stats hook return
interface UseOutcomesStatsReturn {
  totalOutcomes: number
  totalHeadings: number
  totalItems: number
  averageItemsPerHeading: number
  averageHeadingsPerOutcome: number
}

// Outcomes stats hook
export const useOutcomesStats = (): UseOutcomesStatsReturn => {
  const { outcomes } = useOutcomes()
  
  // Calculate stats
  const totalOutcomes = outcomes?.length || 0
  let totalHeadings = 0
  let totalItems = 0
  
  if (outcomes) {
    outcomes.forEach(outcome => {
      totalHeadings += outcome.headings.length
      outcome.headings.forEach(heading => {
        totalItems += heading.items.length
      })
    })
  }
  
  const averageHeadingsPerOutcome = totalOutcomes > 0 ? totalHeadings / totalOutcomes : 0
  const averageItemsPerHeading = totalHeadings > 0 ? totalItems / totalHeadings : 0
  
  return {
    totalOutcomes,
    totalHeadings,
    totalItems,
    averageItemsPerHeading,
    averageHeadingsPerOutcome,
  }
} 