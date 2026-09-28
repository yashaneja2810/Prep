import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { 
  getAllTrainerProfiles,
  getTrainerProfileById,
  createTrainerProfileByEmail,
  updateTrainerProfileById,
  deactivateTrainerProfileById,
  reactivateTrainerProfileById,
  permanentlyDeleteTrainerProfileById,
  CreateTrainerProfileData,
  UpdateTrainerProfileData
} from '@/lib/api/trainers'
import { getAllSpecialities } from '@/lib/api/specialities'
import { SWR_KEYS } from '@/helpers/string_const'
import { toast } from 'sonner'
import { TrainerProfile, FormMode, useTrainersStore, Speciality } from '@/store/slices/trainers'

// Types for CRUD operations
interface CreateTrainerData {
  email: string
  profileData: Partial<TrainerProfile>
}

interface UpdateTrainerData {
  id: string
  data: Partial<TrainerProfile>
}

// ============================================================================
// TRAINERS HOOK
// ============================================================================

interface UseTrainersReturn {
  // Data
  trainers: TrainerProfile[]
  allTrainers: TrainerProfile[]
  selectedTrainer: TrainerProfile | null
  
  // Filter states
  searchTerm: string
  selectedStatus: string
  selectedSpecialty: string
  activeTab: string
  
  // Form states
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingProfileId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setSelectedTrainer: (trainer: TrainerProfile | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setSelectedStatus: (status: string) => void
  setSelectedSpecialty: (specialty: string) => void
  setActiveTab: (tab: string) => void
  filterTrainers: () => void
  resetFilters: () => void
  refreshTrainers: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingProfileId: (profileId: string | null) => void
  
  // CRUD Operations
  createTrainer: (email: string, profileData: Omit<CreateTrainerProfileData, 'email'>) => Promise<TrainerProfile>
  updateTrainer: (id: string, data: UpdateTrainerProfileData) => Promise<TrainerProfile>
  deleteTrainer: (id: string) => Promise<void>
  reactivateTrainer: (id: string) => Promise<TrainerProfile>
  permanentlyDeleteTrainer: (id: string) => Promise<void>
  getTrainerById: (id: string) => Promise<TrainerProfile>

  
  // Helper functions
  getUniqueSpecialities: () => string[]
  getTrainerCounts: () => { 
    total: number
    active: number
    inactive: number
    withExpertise: number
    withExperience: number
    withSocialLinks: number
  }

  getTrainerByProfileId: (profileId: string) => TrainerProfile | null
  
  // SWR utilities
  mutate: () => void
}

export const useTrainers = (): UseTrainersReturn => {
  console.log('🟣 [HOOK] useTrainers called')
  
  const {
    trainers,
    filteredTrainers,
    selectedTrainer,
    searchTerm,
    selectedStatus,
    selectedSpecialty,
    activeTab,
    formMode,
    isFormOpen,
    formErrors,
    editingProfileId,
    isSubmitting,
    isLoading,
    error,
    setTrainers,
    addTrainer,
    updateTrainer: updateTrainerInStore,
    removeTrainer,
    setSelectedTrainer,
    setSearchTerm,
    setSelectedStatus,
    setSelectedSpecialty,
    setActiveTab,
    setFormMode,
    toggleForm,
    setFormErrors,
    clearFormErrors,
    setEditingProfileId,
    setSubmitting,
    setLoading,
    setError,
    filterTrainers,
    resetFilters,
    getTrainerByProfileId
  } = useTrainersStore()

  console.log('🟣 [HOOK] Store state:', {
    trainersCount: Array.isArray(trainers) ? trainers.length : 0,
    filteredTrainersCount: Array.isArray(filteredTrainers) ? filteredTrainers.length : 0,
    isLoading,
    isSubmitting,
    error: error ? 'ERROR' : 'NO_ERROR'
  })

  // SWR hook for fetching trainer profiles
  const {
    data: trainersData,
    error: swrError,
    isLoading: swrLoading,
    mutate
  } = useSWR(SWR_KEYS.TRAINER_PROFILES, getAllTrainerProfiles, {
    onSuccess: (data) => {
      console.log('🟢 [HOOK] SWR success - received trainers:', data?.length || 0)
      setTrainers(data || [])
      setLoading(false)
      setError(null)
    },
    onError: (err) => {
      console.error('🔴 [HOOK] SWR error:', err)
      setLoading(false)
      setError(err.message || 'Failed to load trainer profiles')
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  })

  // Handle loading state
  useMemo(() => {
    if (swrLoading && !trainersData) {
      setLoading(true)
    }
  }, [swrLoading, trainersData, setLoading])

  // Handle error state
  useMemo(() => {
    if (swrError) {
      setError(swrError.message || 'Failed to load trainer profiles')
    }
  }, [swrError, setError])

  // Refresh trainers function
  const refreshTrainers = useCallback(async () => {
    console.log('🔄 [HOOK] refreshTrainers called')
    try {
      setLoading(true)
      setError(null)
      await mutate()
    } catch (error) {
      console.error('🔴 [HOOK] Error refreshing trainers:', error)
      setError('Failed to refresh trainer profiles')
    } finally {
      setLoading(false)
    }
  }, [mutate, setLoading, setError])

  // CRUD Operations
  const createTrainer = useCallback(async (
    email: string, 
    profileData: Omit<CreateTrainerProfileData, 'email'>
  ): Promise<TrainerProfile> => {
    console.log('🟢 [HOOK] createTrainer called')
    try {
      setSubmitting(true)
      setError(null)
      const newTrainer = await createTrainerProfileByEmail(email, profileData)
      addTrainer(newTrainer)
      await mutate() // Refresh data
      toast.success('Trainer profile created successfully!')
      return newTrainer
    } catch (error: any) {
      console.error('🔴 [HOOK] Error creating trainer:', error)
      const errorMessage = error.message || 'Failed to create trainer profile'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [addTrainer, mutate, setSubmitting, setError])

  const updateTrainer = useCallback(async (
    id: string, 
    data: UpdateTrainerProfileData
  ): Promise<TrainerProfile> => {
    console.log('🟢 [HOOK] updateTrainer called for:', id)
    try {
      setSubmitting(true)
      setError(null)
      const updatedTrainer = await updateTrainerProfileById(id, data)
      updateTrainerInStore(id, updatedTrainer)
      await mutate() // Refresh data
      toast.success('Trainer profile updated successfully!')
      return updatedTrainer
    } catch (error: any) {
      console.error('🔴 [HOOK] Error updating trainer:', error)
      const errorMessage = error.message || 'Failed to update trainer profile'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [updateTrainerInStore, mutate, setSubmitting, setError])

  const deleteTrainer = useCallback(async (id: string): Promise<void> => {
    console.log('🔴 [HOOK] deleteTrainer called for:', id)
    try {
      setSubmitting(true)
      setError(null)
      await deactivateTrainerProfileById(id)
      // Update the trainer in store to reflect deactivated status
      updateTrainerInStore(id, { is_active: false })
      await mutate() // Refresh data
      toast.success('Trainer profile deactivated successfully!')
    } catch (error: any) {
      console.error('🔴 [HOOK] Error deactivating trainer:', error)
      const errorMessage = error.message || 'Failed to deactivate trainer profile'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [updateTrainerInStore, mutate, setSubmitting, setError])

  const reactivateTrainer = useCallback(async (id: string): Promise<TrainerProfile> => {
    console.log('🟢 [HOOK] reactivateTrainer called for:', id)
    try {
      setSubmitting(true)
      setError(null)
      const reactivatedTrainer = await reactivateTrainerProfileById(id)
      updateTrainerInStore(id, reactivatedTrainer)
      await mutate() // Refresh data
      toast.success('Trainer profile reactivated successfully!')
      return reactivatedTrainer
    } catch (error: any) {
      console.error('🔴 [HOOK] Error reactivating trainer:', error)
      const errorMessage = error.message || 'Failed to reactivate trainer profile'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [updateTrainerInStore, mutate, setSubmitting, setError])

  const permanentlyDeleteTrainer = useCallback(async (id: string): Promise<void> => {
    console.log('🔴 [HOOK] permanentlyDeleteTrainer called for:', id)
    try {
      setSubmitting(true)
      setError(null)
      await permanentlyDeleteTrainerProfileById(id)
      removeTrainer(id)
      await mutate() // Refresh data
      toast.success('Trainer profile permanently deleted!')
    } catch (error: any) {
      console.error('🔴 [HOOK] Error permanently deleting trainer:', error)
      const errorMessage = error.message || 'Failed to permanently delete trainer profile'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [removeTrainer, mutate, setSubmitting, setError])

  const getTrainerById = useCallback(async (id: string): Promise<TrainerProfile> => {
    return await getTrainerProfileById(id)
  }, [])



  // Helper functions
  const getUniqueSpecialities = useCallback((): string[] => {
    // Ensure trainers is an array before processing
    const safeTrainers = Array.isArray(trainers) ? trainers : []
    
    const specialitiesSet = new Set<string>()
    safeTrainers.forEach((trainer: TrainerProfile) => {
      if (Array.isArray(trainer.specialities)) {
        trainer.specialities.forEach((speciality: Speciality) => {
          specialitiesSet.add(speciality.name)
        })
      }
    })
    return Array.from(specialitiesSet).sort()
  }, [trainers])

  const getTrainerCounts = useCallback(() => {
    // Ensure trainers is an array before processing
    const safeTrainers = Array.isArray(trainers) ? trainers : []
    
    const total = safeTrainers.length
    const active = safeTrainers.filter((trainer: TrainerProfile) => trainer.is_active).length
    const inactive = safeTrainers.filter((trainer: TrainerProfile) => !trainer.is_active).length
    const withExpertise = safeTrainers.filter((trainer: TrainerProfile) => trainer.expertise && trainer.expertise.trim().length > 0).length
    const withExperience = safeTrainers.filter((trainer: TrainerProfile) => trainer.total_years_teaching && trainer.total_years_teaching > 0).length
    const withSocialLinks = safeTrainers.filter((trainer: TrainerProfile) => 
      trainer.social_links && Object.keys(trainer.social_links).length > 0
    ).length

    return {
      total,
      active,
      inactive,
      withExpertise,
      withExperience,
      withSocialLinks,
    }
  }, [trainers])

  return {
    // Data
    trainers: filteredTrainers,
    allTrainers: trainers,
    selectedTrainer,
    
    // Filter states
    searchTerm,
    selectedStatus,
    selectedSpecialty,
    activeTab,
    
    // Form states
    formMode,
    isFormOpen,
    formErrors,
    editingProfileId,
    isSubmitting,
    
    // Loading and error states
    isLoading: isLoading || swrLoading,
    error: error || (swrError?.message),
    
    // Data Actions
    setSelectedTrainer,
    
    // Filter Actions
    setSearchTerm,
    setSelectedStatus,
    setSelectedSpecialty,
    setActiveTab,
    filterTrainers,
    resetFilters,
    refreshTrainers,
    
    // Form Actions
    setFormMode,
    toggleForm,
    setFormErrors,
    clearFormErrors,
    setEditingProfileId,
    
    // CRUD Operations
    createTrainer,
    updateTrainer,
    deleteTrainer,
    reactivateTrainer,
    permanentlyDeleteTrainer,
    getTrainerById,
    
    // Helper functions
    getUniqueSpecialities,
    getTrainerCounts,
    getTrainerByProfileId,
    
    // SWR utilities
    mutate
  }
}

// ============================================================================
// SPECIALITIES HOOK
// ============================================================================

interface UseSpecialitiesReturn {
  specialities: Speciality[]
  isLoading: boolean
  error: string | null
  mutate: () => void
}

export const useSpecialities = (): UseSpecialitiesReturn => {
  console.log('🟣 [HOOK] useSpecialities called')
  
  // Temporary mock data for development - remove when backend is ready
  const mockSpecialities: Speciality[] = [
    { id: 1, name: "Full Stack Web Development" },
    { id: 2, name: "Frontend Development" },
    { id: 3, name: "Backend Development" },
    { id: 4, name: "Mobile Development" },
    { id: 5, name: "DevOps" },
    { id: 6, name: "Machine Learning" },
    { id: 7, name: "Data Science" },
    { id: 8, name: "UI/UX Design" },
    { id: 9, name: "Cybersecurity" },
    { id: 10, name: "Cloud Computing" }
  ]
  
  const {
    data: specialities,
    error,
    isLoading,
    mutate
  } = useSWR(SWR_KEYS.SPECIALITIES, getAllSpecialities, {
    onSuccess: (data) => {
      console.log('🟢 [HOOK] Specialities loaded successfully:', data?.length || 0)
    },
    onError: (err) => {
      console.error('🔴 [HOOK] Error loading specialities:', err)
      console.log('🟡 [HOOK] Falling back to mock data')
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // Cache for 1 minute
    fallbackData: mockSpecialities, // Use mock data as fallback
    // Force use of mock data in development if API fails
    refreshInterval: 0
  })

  // In development, always use mock data if API data is empty or failed
  const shouldUseMockData = process.env.NODE_ENV === 'development' && 
    (!specialities || specialities.length === 0 || error)

  const finalSpecialities = shouldUseMockData ? mockSpecialities : (specialities || [])

  console.log('🟣 [HOOK] Specialities state:', {
    originalCount: specialities?.length || 0,
    finalCount: finalSpecialities.length,
    isLoading,
    error: error ? 'ERROR' : 'NO_ERROR',
    usingMockData: shouldUseMockData,
    source: shouldUseMockData ? 'MOCK' : 'API'
  })

  return {
    specialities: finalSpecialities,
    isLoading: shouldUseMockData ? false : isLoading, // Don't show loading if using mock data
    error: shouldUseMockData ? null : (error?.message || null), // Don't show error if using mock data
    mutate
  }
}

// ============================================================================
// FUTURE HOOKS CAN BE ADDED HERE
// ============================================================================

// Example structure for other store hooks:
/*
export const useAuth = () => {
  // Auth store hook implementation
}

export const useUI = () => {
  // UI store hook implementation
}

export const useUsers = () => {
  // Users store hook implementation
}
*/
