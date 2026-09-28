import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  getAllAPs,
  getAPsByTopicId,
  getAPById,
  createAP,
  updateAPById,
  deleteAPById,
  APS_SWR_KEY,
  APS_BY_TOPIC_SWR_KEY,
  AP_BY_ID_SWR_KEY,
  AP,
  CreateAPDto,
  UpdateAPDto
} from '@/lib/api/aps'
import { useAPsStore } from '@/store/slices/aps'
import { handleError } from '@/helpers/helpers'
import { API_MESSAGES } from '@/helpers/string_const'

// Type for the APs hook return
interface UseAPsReturn {
  aps: AP[]
  isLoading: boolean
  error: string | null
  mutate: () => Promise<AP[] | undefined>
  // Store state
  filteredAPs: AP[]
  selectedAP: AP | null
  searchTerm: string
  selectedDifficulty: string
  activeTab: string
  // Store actions
  setSearchTerm: (term: string) => void
  setSelectedDifficulty: (difficulty: string) => void
  setActiveTab: (tab: string) => void
  filterAPs: () => void
  resetFilters: () => void
  setAPs: (aps: AP[]) => void
  addAP: (ap: AP) => void
  updateAP: (apId: string, updates: Partial<AP>) => void
  removeAP: (apId: string) => void
  setSelectedAP: (ap: AP | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Simple APs hook for basic listing
export const useAPs = (): UseAPsReturn => {
  const store = useAPsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    APS_SWR_KEY,
    getAllAPs,
    {
      onSuccess: (data) => {
        console.log('🟢 [useAPs] SWR success, setting APs in store')
        store.setAPs(data || [])
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useAPs] SWR error:', error)
        // Don't show toast here as handleError already shows it
        // Just extract the message for the store
        let errorMessage = 'Failed to load application problems'
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
    aps: data || [],
    isLoading,
    error: error ? 'Failed to load application problems' : null,
    mutate,
    // Store state
    filteredAPs: store.filteredAPs,
    selectedAP: store.selectedAP,
    searchTerm: store.searchTerm,
    selectedDifficulty: store.selectedDifficulty,
    activeTab: store.activeTab,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setSelectedDifficulty: store.setSelectedDifficulty,
    setActiveTab: store.setActiveTab,
    filterAPs: store.filterAPs,
    resetFilters: store.resetFilters,
    setAPs: store.setAPs,
    addAP: store.addAP,
    updateAP: store.updateAP,
    removeAP: store.removeAP,
    setSelectedAP: store.setSelectedAP,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for APs by topic hook return
interface UseAPsByTopicReturn {
  aps: AP[]
  isLoading: boolean
  error: string | null
  mutate: () => Promise<AP[] | undefined>
  // Store state
  filteredAPs: AP[]
  selectedAP: AP | null
  searchTerm: string
  selectedDifficulty: string
  // Store actions
  setSearchTerm: (term: string) => void
  setSelectedDifficulty: (difficulty: string) => void
  filterAPs: () => void
  resetFilters: () => void
}

// APs by topic hook
export const useAPsByTopic = (topicId: string | null): UseAPsByTopicReturn => {
  const store = useAPsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    topicId ? APS_BY_TOPIC_SWR_KEY(topicId) : null,
    topicId ? () => getAPsByTopicId(topicId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useAPsByTopic] SWR success for topic:', topicId)
        if (data) {
          // We only want to set the APs for this topic, not all APs
          // This is different from the useAPs hook
          const currentAPs = store.aps.filter(ap => ap.topic_id !== topicId)
          const updatedAPs = [...currentAPs, ...data]
          store.setAPs(updatedAPs)
          
          // Set the active tab to filter by this topic
          if (topicId) {
            store.setActiveTab(topicId)
          }
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useAPsByTopic] SWR error:', error)
        let errorMessage = 'Failed to load application problems for this topic'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    aps: data || [],
    isLoading,
    error: error ? 'Failed to load application problems for this topic' : null,
    mutate,
    // Store state
    filteredAPs: store.filteredAPs,
    selectedAP: store.selectedAP,
    searchTerm: store.searchTerm,
    selectedDifficulty: store.selectedDifficulty,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setSelectedDifficulty: store.setSelectedDifficulty,
    filterAPs: store.filterAPs,
    resetFilters: store.resetFilters,
  }
}

// Type for single AP hook return
interface UseAPReturn {
  ap: AP | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<AP | undefined>
}

// Single AP hook
export const useAP = (apId: string | null): UseAPReturn => {
  const store = useAPsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    apId ? AP_BY_ID_SWR_KEY(apId) : null,
    apId ? () => getAPById(apId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useAP] SWR success for AP:', apId)
        if (data) {
          store.setSelectedAP(data)
          
          // Update the AP in the store if it exists
          const existingAP = store.getAPById(data.id)
          if (existingAP) {
            store.updateAP(data.id, data)
          } else {
            store.addAP(data)
          }
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useAP] SWR error:', error)
        let errorMessage = 'Failed to load application problem'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    ap: data || null,
    isLoading,
    error: error ? 'Failed to load application problem' : null,
    mutate,
  }
}

// Type for AP mutations hook return
interface UseAPMutationsReturn {
  createAP: (apData: CreateAPDto) => Promise<AP>
  updateAP: (apId: string, apData: UpdateAPDto) => Promise<AP>
  deleteAP: (apId: string) => Promise<void>
  // Store state
  isSubmitting: boolean
  formErrors: Record<string, string>
  formMode: 'create' | 'edit' | 'view'
  isFormOpen: boolean
  editingAPId: string | null
}

// AP mutations hook
export const useAPMutations = (): UseAPMutationsReturn => {
  const store = useAPsStore()
  
  const createAPMutation = useCallback(async (apData: CreateAPDto): Promise<AP> => {
    store.setSubmitting(true)
    try {
      const result = await createAP(apData)
      toast.success('Application problem created successfully')
      
      // Update store with the new AP
      store.addAP(result)
      
      return result
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const updateAPMutation = useCallback(async (apId: string, apData: UpdateAPDto): Promise<AP> => {
    store.setSubmitting(true)
    try {
      const result = await updateAPById(apId, apData)
      toast.success('Application problem updated successfully')
      
      // Update store with the updated AP
      store.updateAP(apId, result)
      
      return result
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const deleteAPMutation = useCallback(async (apId: string): Promise<void> => {
    store.setSubmitting(true)
    try {
      await deleteAPById(apId)
      toast.success('Application problem deleted successfully')
      
      // Remove the AP from the store
      store.removeAP(apId)
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  return {
    createAP: createAPMutation,
    updateAP: updateAPMutation,
    deleteAP: deleteAPMutation,
    // Store state
    isSubmitting: store.isSubmitting,
    formErrors: store.formErrors,
    formMode: store.formMode,
    isFormOpen: store.isFormOpen,
    editingAPId: store.editingAPId,
  }
} 