import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useCohortsStore } from '@/store/slices/cohorts'
import * as cohortsApi from '@/lib/api/cohorts'
import { handleError } from '@/helpers/helpers'
import { API_MESSAGES } from '@/helpers/string_const'
import { authApi } from '@/lib/api/auth'

// Main hook for cohort management
export const useCohorts = () => {
  // State from store
  const {
    cohorts,
    filteredCohorts,
    selectedCohort,
    isLoading,
    error,
    setCohorts,
    setLoading,
    setError,
    addCohort,
    updateCohort: updateCohortInStore,
    removeCohort,
    setSelectedCohort
  } = useCohortsStore()

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all cohorts
  const fetchCohorts = async (showToast = false, filters?: { scope?: string; status?: string; programId?: string }) => {
    try {
      setLoading(true)
      const cohortsData = await cohortsApi.getAllCohorts(filters)
      setCohorts(cohortsData)
      if (showToast) toast.success('Cohorts loaded successfully')
      return cohortsData
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return fetchCohorts(showToast, filters)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return []
    } finally {
      setLoading(false)
    }
  }

  // Fetch cohort by ID
  const fetchCohortById = async (id: string) => {
    try {
      setLoading(true)
      const cohortData = await cohortsApi.getCohortById(id)
      setSelectedCohort(cohortData)
      return cohortData
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return fetchCohortById(id)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create cohort
  const createCohort = async (cohortData: cohortsApi.CreateCohortDto) => {
    try {
      setIsSubmitting(true)
      
      // Validate cohort data
      const validationErrors = cohortsApi.validateCohort(cohortData, false)
      if (validationErrors) {
        setError('Please correct the validation errors')
        return { success: false, errors: validationErrors }
      }
      
      const newCohort = await cohortsApi.createCohort(cohortData)
      addCohort(newCohort)
      toast.success('Cohort created successfully')
      return { success: true, cohort: newCohort }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return createCohort(cohortData)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, errors: { general: getErrorMessage(error) } }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update cohort
  const updateCohort = async (id: string, cohortData: cohortsApi.UpdateCohortDto) => {
    try {
      setIsSubmitting(true)
      
      // Validate cohort data
      const validationErrors = cohortsApi.validateCohort(cohortData, true)
      if (validationErrors) {
        setError('Please correct the validation errors')
        return { success: false, errors: validationErrors }
      }
      
      const updatedCohort = await cohortsApi.updateCohort(id, cohortData)
      updateCohortInStore(id, updatedCohort)
      toast.success('Cohort updated successfully')
      return { success: true, cohort: updatedCohort }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return updateCohort(id, cohortData)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, errors: { general: getErrorMessage(error) } }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete cohort
  const deleteCohort = async (id: string) => {
    try {
      setIsSubmitting(true)
      await cohortsApi.deleteCohort(id)
      removeCohort(id)
      toast.success('Cohort deleted successfully')
      return { success: true }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return deleteCohort(id)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch cohort trainers
  const fetchCohortTrainers = async (cohortId: string) => {
    try {
      setLoading(true)
      const trainers = await cohortsApi.getCohortTrainers(cohortId)
      return trainers
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return fetchCohortTrainers(cohortId)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return []
    } finally {
      setLoading(false)
    }
  }

  // Add trainers to cohort
  const addTrainersToCohort = async (cohortId: string, trainerIds: string[]) => {
    try {
      setIsSubmitting(true)
      const result = await cohortsApi.addTrainersToCohort(cohortId, trainerIds)
      
      // Refresh cohort data to update the UI
      const updatedCohort = await cohortsApi.getCohortById(cohortId)
      updateCohortInStore(cohortId, updatedCohort)
      
      toast.success('Trainers added to cohort successfully')
      return { success: true, result }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return addTrainersToCohort(cohortId, trainerIds)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Remove trainer from cohort
  const removeTrainerFromCohort = async (cohortId: string, trainerId: string) => {
    try {
      setIsSubmitting(true)
      await cohortsApi.removeTrainerFromCohort(cohortId, trainerId)
      
      // Refresh cohort data to update the UI
      const updatedCohort = await cohortsApi.getCohortById(cohortId)
      updateCohortInStore(cohortId, updatedCohort)
      
      toast.success('Trainer removed from cohort successfully')
      return { success: true }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return removeTrainerFromCohort(cohortId, trainerId)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch cohort learners
  const fetchCohortLearners = async (cohortId: string) => {
    try {
      setLoading(true)
      const learners = await cohortsApi.getCohortLearners(cohortId)
      return learners
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return fetchCohortLearners(cohortId)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return []
    } finally {
      setLoading(false)
    }
  }

  // Add learners to cohort
  const addLearnersToCohort = async (cohortId: string, learnerIds: string[]) => {
    try {
      setIsSubmitting(true)
      const result = await cohortsApi.addLearnersToCohort(cohortId, learnerIds)
      
      // Refresh cohort data to update the UI
      const updatedCohort = await cohortsApi.getCohortById(cohortId)
      updateCohortInStore(cohortId, updatedCohort)
      
      toast.success('Learners added to cohort successfully')
      return { success: true, result }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return addLearnersToCohort(cohortId, learnerIds)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Remove learner from cohort
  const removeLearnerFromCohort = async (cohortId: string, learnerId: string) => {
    try {
      setIsSubmitting(true)
      await cohortsApi.removeLearnerFromCohort(cohortId, learnerId)
      
      // Refresh cohort data to update the UI
      const updatedCohort = await cohortsApi.getCohortById(cohortId)
      updateCohortInStore(cohortId, updatedCohort)
      
      toast.success('Learner removed from cohort successfully')
      return { success: true }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return removeLearnerFromCohort(cohortId, learnerId)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update cohort trainers
  const updateCohortTrainers = async (cohortId: string, trainerIds: string[]) => {
    try {
      setIsSubmitting(true)
      await cohortsApi.updateCohortTrainers(cohortId, trainerIds)
      
      // Refresh cohort data to update the UI
      const updatedCohort = await cohortsApi.getCohortById(cohortId)
      updateCohortInStore(cohortId, updatedCohort)
      
      toast.success('Cohort trainers updated successfully')
      return { success: true }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return updateCohortTrainers(cohortId, trainerIds)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update cohort learners
  const updateCohortLearners = async (
    cohortId: string,
    learnerData: Array<{ id?: string; name: string; email: string }>
  ) => {
    try {
      setIsSubmitting(true)
      await cohortsApi.updateCohortLearners(cohortId, learnerData)
      
      // Refresh cohort data to update the UI
      const updatedCohort = await cohortsApi.getCohortById(cohortId)
      updateCohortInStore(cohortId, updatedCohort)
      
      toast.success('Cohort learners updated successfully')
      return { success: true }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return updateCohortLearners(cohortId, learnerData)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to check if token is expired
  const isTokenExpired = (error: any): boolean => {
    return error?.response?.status === 401 || 
           (error?.message && error?.message.includes('expired'))
  }

  // Helper function to refresh token
  const refreshToken = async (): Promise<void> => {
    try {
      await authApi.refreshSession()
    } catch (refreshError) {
      // If refresh fails, redirect to login
      window.location.href = '/login'
    }
  }

  // Helper function to get error message
  const getErrorMessage = (error: any): string => {
    return error?.response?.data?.message || 
           error?.message || 
           'An error occurred while processing your request'
  }

  return {
    // Data
    cohorts,
    filteredCohorts,
    selectedCohort,
    
    // State
    isLoading,
    isSubmitting,
    error,
    
    // Actions
    fetchCohorts,
    fetchCohortById,
    createCohort,
    updateCohort,
    deleteCohort,
    fetchCohortTrainers,
    addTrainersToCohort,
    removeTrainerFromCohort,
    fetchCohortLearners,
    addLearnersToCohort,
    removeLearnerFromCohort,
    updateCohortTrainers,
    updateCohortLearners,
    setSelectedCohort
  }
}

// Additional hooks for specific use cases
export const useCohortById = (cohortId: string) => {
  const { fetchCohortById, selectedCohort, isLoading, error } = useCohorts()
  
  // Fetch cohort on mount
  useEffect(() => {
    if (cohortId) {
      fetchCohortById(cohortId)
    }
  }, [cohortId, fetchCohortById])
  
  return {
    cohort: selectedCohort,
    isLoading,
    error,
    refetch: () => fetchCohortById(cohortId)
  }
}

export const useCohortTrainers = (cohortId: string) => {
  const [trainers, setTrainers] = useState<cohortsApi.CohortUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchTrainers = async () => {
    try {
      setIsLoading(true)
      const trainersData = await cohortsApi.getCohortTrainers(cohortId)
      setTrainers(trainersData)
      return trainersData
    } catch (err) {
      handleError(err)
      setError(err?.message || 'Failed to fetch cohort trainers')
      return []
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch trainers on mount
  useEffect(() => {
    if (cohortId) {
      fetchTrainers()
    }
  }, [cohortId])
  
  return {
    trainers,
    isLoading,
    error,
    refetch: fetchTrainers
  }
}

export const useCohortLearners = (cohortId: string) => {
  const [learners, setLearners] = useState<cohortsApi.CohortUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchLearners = async () => {
    try {
      setIsLoading(true)
      const learnersData = await cohortsApi.getCohortLearners(cohortId)
      setLearners(learnersData)
      return learnersData
    } catch (err) {
      handleError(err)
      setError(err?.message || 'Failed to fetch cohort learners')
      return []
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch learners on mount
  useEffect(() => {
    if (cohortId) {
      fetchLearners()
    }
  }, [cohortId])
  
  return {
    learners,
    isLoading,
    error,
    refetch: fetchLearners
  }
} 