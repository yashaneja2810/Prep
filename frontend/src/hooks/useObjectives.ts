import useSWR from 'swr'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  getObjectiveById,
  getObjectivesByTopicId,
  createObjective,
  createOrUpdateObjective,
  updateHeading,
  deleteHeading,
  updateItem,
  deleteItem,
  OBJECTIVES_SWR_KEY,
  OBJECTIVE_BY_ID_SWR_KEY,
  OBJECTIVES_BY_TOPIC_SWR_KEY,
  ObjectiveResponse,
  CreateObjectiveDto,
  ObjectiveHeading,
  ObjectiveItem,
  validateObjective
} from '@/lib/api/objectives'
import { useObjectivesStore } from '@/store/slices/objectives'
import { handleError } from '@/helpers/helpers'
import { API_MESSAGES } from '@/helpers/string_const'

// Type for the objectives hook return
interface UseObjectivesReturn {
  objectives: ObjectiveResponse[] | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<ObjectiveResponse[] | null | undefined>
  // Store state
  selectedObjective: ObjectiveResponse | null
  searchTerm: string
  // Store actions
  setSearchTerm: (term: string) => void
  setObjectives: (objectives: ObjectiveResponse[] | null) => void
  addObjective: (objective: ObjectiveResponse) => void
  updateObjective: (objectiveId: string, updates: Partial<ObjectiveResponse>) => void
  removeObjective: (objectiveId: string) => void
  setSelectedObjective: (objective: ObjectiveResponse | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Hook for getting objectives
export const useObjectives = (): UseObjectivesReturn => {
  const store = useObjectivesStore()
  
  const { data, error, isLoading, mutate } = useSWR<ObjectiveResponse[] | null>(
    OBJECTIVES_SWR_KEY,
    async () => {
      try {
        // This is just a placeholder as we don't have a getAll endpoint
        // In real implementation, you might want to fetch all objectives
        return [];
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('🟢 [useObjectives] SWR success, setting objectives in store')
        store.setObjectives(data || null)
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useObjectives] SWR error:', error)
        let errorMessage = 'Failed to load objectives'
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
    objectives: data || null,
    isLoading,
    error: error ? 'Failed to load objectives' : null,
    mutate,
    // Store state
    selectedObjective: store.selectedObjective,
    searchTerm: store.searchTerm,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setObjectives: store.setObjectives,
    addObjective: store.addObjective,
    updateObjective: store.updateObjective,
    removeObjective: store.removeObjective,
    setSelectedObjective: store.setSelectedObjective,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for single objective hook return
interface UseObjectiveReturn {
  objective: ObjectiveResponse | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<ObjectiveResponse | undefined>
}

// Single objective hook
export const useObjective = (objectiveId: string | null): UseObjectiveReturn => {
  const store = useObjectivesStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    objectiveId ? OBJECTIVE_BY_ID_SWR_KEY(objectiveId) : null,
    objectiveId ? () => getObjectiveById(objectiveId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useObjective] SWR success for objective:', objectiveId)
        if (data) {
          store.setSelectedObjective(data)
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useObjective] SWR error:', error)
        handleError(error)
        store.setError('Failed to load objective')
      },
      revalidateOnFocus: false,
    }
  )

  return {
    objective: data || null,
    isLoading,
    error: error ? 'Failed to load objective' : null,
    mutate,
  }
}

// Type for objectives by topic hook return
interface UseObjectivesByTopicReturn {
  objectives: ObjectiveResponse[] | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<ObjectiveResponse[] | null | undefined>
}

// Objectives by topic hook
export const useObjectivesByTopic = (topicId: string | null): UseObjectivesByTopicReturn => {
  const store = useObjectivesStore()
  
  const { data, error, isLoading, mutate } = useSWR<ObjectiveResponse[] | null>(
    topicId ? OBJECTIVES_BY_TOPIC_SWR_KEY(topicId) : null,
    topicId ? () => getObjectivesByTopicId(topicId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useObjectivesByTopic] SWR success for topic:', topicId)
        store.setObjectives(data)
        
        // If there's only one objective for this topic, set it as selected
        if (data && data.length === 1) {
          store.setSelectedObjective(data[0])
        }
        
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useObjectivesByTopic] SWR error:', error)
        handleError(error)
        store.setError('Failed to load objectives for topic')
      },
      revalidateOnFocus: false,
    }
  )

  return {
    objectives: data,
    isLoading,
    error: error ? 'Failed to load objectives for topic' : null,
    mutate,
  }
}

// Type for the objectives mutations hook return
interface UseObjectivesMutationsReturn {
  createObjective: (objectiveData: CreateObjectiveDto) => Promise<ObjectiveResponse>
  createOrUpdateObjective: (objectiveData: CreateObjectiveDto) => Promise<ObjectiveResponse>
  updateHeading: (headingId: string, heading: string) => Promise<any>
  deleteHeading: (headingId: string) => Promise<any>
  updateItem: (itemId: string, text: string) => Promise<any>
  deleteItem: (itemId: string) => Promise<any>
  // Store state
  isSubmitting: boolean
  formErrors: Record<string, string>
  formMode: 'create' | 'edit' | 'view'
  isFormOpen: boolean
  editingObjectiveId: string | null
}

// Objectives mutations hook
export const useObjectivesMutations = (): UseObjectivesMutationsReturn => {
  const store = useObjectivesStore()

  // Create a new objective
  const createObjectiveHandler = useCallback(
    async (objectiveData: CreateObjectiveDto): Promise<ObjectiveResponse> => {
      store.setSubmitting(true)
      store.clearFormErrors()

      try {
        // Validate the data
        const validationErrors = validateObjective(objectiveData)
        if (Object.keys(validationErrors).length > 0) {
          store.setFormErrors(validationErrors)
          store.setSubmitting(false)
          throw new Error('Validation failed')
        }

        // Create the objective
        const result = await createObjective(objectiveData)
        
        // Update the store
        store.addObjective(result)
        store.setSelectedObjective(result)
        
        // Show success message
        toast.success('Objective created successfully')
        
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

  // Create or update an objective
  const createOrUpdateObjectiveHandler = useCallback(
    async (objectiveData: CreateObjectiveDto): Promise<ObjectiveResponse> => {
      store.setSubmitting(true)
      store.clearFormErrors()

      try {
        // Validate the data
        const validationErrors = validateObjective(objectiveData)
        if (Object.keys(validationErrors).length > 0) {
          store.setFormErrors(validationErrors)
          store.setSubmitting(false)
          throw new Error('Validation failed')
        }

        // Create or update the objective
        const result = await createOrUpdateObjective(objectiveData)
        
        // Update the store
        store.updateObjective(result.id, result)
        store.setSelectedObjective(result)
        
        // Show success message
        toast.success('Objective saved successfully')
        
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
    createObjective: createObjectiveHandler,
    createOrUpdateObjective: createOrUpdateObjectiveHandler,
    updateHeading: updateHeadingHandler,
    deleteHeading: deleteHeadingHandler,
    updateItem: updateItemHandler,
    deleteItem: deleteItemHandler,
    // Store state
    isSubmitting: store.isSubmitting,
    formErrors: store.formErrors,
    formMode: store.formMode,
    isFormOpen: store.isFormOpen,
    editingObjectiveId: store.editingObjectiveId,
  }
}

// Type for objectives stats hook return
interface UseObjectivesStatsReturn {
  totalObjectives: number
  totalHeadings: number
  totalItems: number
  averageItemsPerHeading: number
  averageHeadingsPerObjective: number
}

// Objectives stats hook
export const useObjectivesStats = (): UseObjectivesStatsReturn => {
  const { objectives } = useObjectives()
  
  // Calculate stats
  const totalObjectives = objectives?.length || 0
  let totalHeadings = 0
  let totalItems = 0
  
  if (objectives) {
    objectives.forEach(objective => {
      totalHeadings += objective.headings.length
      objective.headings.forEach(heading => {
        totalItems += heading.items.length
      })
    })
  }
  
  const averageHeadingsPerObjective = totalObjectives > 0 ? totalHeadings / totalObjectives : 0
  const averageItemsPerHeading = totalHeadings > 0 ? totalItems / totalHeadings : 0
  
  return {
    totalObjectives,
    totalHeadings,
    totalItems,
    averageItemsPerHeading,
    averageHeadingsPerObjective,
  }
} 