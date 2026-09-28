import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useProgramsStore } from '@/store/slices/programs'
import * as programsApi from '@/lib/api/programs'
import { handleError } from '@/helpers/helpers'
import { API_MESSAGES } from '@/helpers/string_const'
import { authApi } from '@/lib/api/auth'

// Main hook for program management
export const usePrograms = () => {
  // State from store
  const {
    programs,
    filteredPrograms,
    selectedProgram,
    isLoading,
    error,
    setPrograms,
    setLoading,
    setError,
    addProgram,
    updateProgram: updateProgramInStore,
    removeProgram,
    setSelectedProgram
  } = useProgramsStore()

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all programs
  const fetchPrograms = async (showToast = false) => {
    try {
      setLoading(true)
      const programsData = await programsApi.getAllPrograms()
      setPrograms(programsData)
      if (showToast) toast.success('Programs loaded successfully')
      return programsData
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return fetchPrograms(showToast)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return []
    } finally {
      setLoading(false)
    }
  }

  // Fetch published programs
  const fetchPublishedPrograms = async () => {
    try {
      setLoading(true)
      const programsData = await programsApi.getPublishedPrograms()
      return programsData
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return fetchPublishedPrograms()
      }
      handleError(error)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Fetch program by ID
  const fetchProgramById = async (id: string) => {
    try {
      setLoading(true)
      const programData = await programsApi.getProgramById(id)
      setSelectedProgram(programData)
      return programData
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return fetchProgramById(id)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create program
  const createProgram = async (programData: programsApi.CreateProgramDto) => {
    try {
      setIsSubmitting(true)
      
      // Validate program data
      const validationErrors = programsApi.validateProgram(programData, false)
      if (validationErrors) {
        setError('Please correct the validation errors')
        return { success: false, errors: validationErrors }
      }
      
      const newProgram = await programsApi.createProgram(programData)
      addProgram(newProgram)
      toast.success('Program created successfully')
      return { success: true, program: newProgram }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return createProgram(programData)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, errors: { general: getErrorMessage(error) } }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update program
  const updateProgram = async (id: string, programData: programsApi.UpdateProgramDto) => {
    try {
      setIsSubmitting(true)
      
      // Validate program data
      const validationErrors = programsApi.validateProgram(programData, true)
      if (validationErrors) {
        setError('Please correct the validation errors')
        return { success: false, errors: validationErrors }
      }
      
      const updatedProgram = await programsApi.updateProgram(id, programData)
      updateProgramInStore(id, updatedProgram)
      toast.success('Program updated successfully')
      return { success: true, program: updatedProgram }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return updateProgram(id, programData)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, errors: { general: getErrorMessage(error) } }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete program
  const deleteProgram = async (id: string) => {
    try {
      setIsSubmitting(true)
      await programsApi.deleteProgram(id)
      removeProgram(id)
      toast.success('Program deleted successfully')
      return { success: true }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return deleteProgram(id)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add modules to program
  const addModulesToProgram = async (programId: string, moduleIds: string[]) => {
    try {
      setIsSubmitting(true)
      const updatedProgram = await programsApi.addModulesToProgram(programId, moduleIds)
      updateProgramInStore(programId, updatedProgram)
      toast.success('Modules added to program successfully')
      return { success: true, program: updatedProgram }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return addModulesToProgram(programId, moduleIds)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Remove module from program
  const removeModuleFromProgram = async (programId: string, moduleId: string) => {
    try {
      setIsSubmitting(true)
      await programsApi.removeModuleFromProgram(programId, moduleId)
      
      // Fetch updated program to refresh state
      const updatedProgram = await programsApi.getProgramById(programId)
      updateProgramInStore(programId, updatedProgram)
      
      toast.success('Module removed from program successfully')
      return { success: true, program: updatedProgram }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return removeModuleFromProgram(programId, moduleId)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reorder modules
  const reorderProgramModules = async (programId: string, modules: { module_id: string; order: number }[]) => {
    try {
      setIsSubmitting(true)
      const updatedProgram = await programsApi.reorderProgramModules(programId, modules)
      updateProgramInStore(programId, updatedProgram)
      toast.success('Program modules reordered successfully')
      return { success: true, program: updatedProgram }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return reorderProgramModules(programId, modules)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get program counts
  const getProgramCounts = async () => {
    try {
      return await programsApi.getPublishedProgramsCounts()
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return getProgramCounts()
      }
      handleError(error)
      return { ap_count: 0, cp_count: 0 }
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
    programs,
    filteredPrograms,
    selectedProgram,
    
    // State
    isLoading,
    isSubmitting,
    error,
    
    // Actions
    fetchPrograms,
    fetchPublishedPrograms,
    fetchProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
    addModulesToProgram,
    removeModuleFromProgram,
    reorderProgramModules,
    getProgramCounts,
    setSelectedProgram
  }
}

// Additional hooks for specific use cases
export const useProgramById = (programId: string) => {
  const { fetchProgramById, selectedProgram, isLoading, error } = usePrograms()
  
  // Fetch program on mount
  useEffect(() => {
    if (programId) {
      fetchProgramById(programId)
    }
  }, [programId, fetchProgramById])
  
  return {
    program: selectedProgram,
    isLoading,
    error,
    refetch: () => fetchProgramById(programId)
  }
}

export const useProgramModules = (programId: string) => {
  const [modules, setModules] = useState<programsApi.Module[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchModules = async () => {
    try {
      setIsLoading(true)
      const modulesData = await programsApi.getProgramModules(programId)
      setModules(modulesData)
      return modulesData
    } catch (err) {
      handleError(err)
      setError(err?.message || 'Failed to fetch program modules')
      return []
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch modules on mount
  useEffect(() => {
    if (programId) {
      fetchModules()
    }
  }, [programId])
  
  return {
    modules,
    isLoading,
    error,
    refetch: fetchModules
  }
}

export const usePublishedPrograms = () => {
  const { fetchPublishedPrograms, isLoading } = usePrograms()
  const [programs, setPrograms] = useState<programsApi.Program[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const fetchPrograms = async () => {
    try {
      const data = await fetchPublishedPrograms()
      setPrograms(data)
      return data
    } catch (err) {
      setError(err?.message || 'Failed to fetch published programs')
      return []
    }
  }
  
  // Fetch published programs on mount
  useEffect(() => {
    fetchPrograms()
  }, [])
  
  return {
    programs,
    isLoading,
    error,
    refetch: fetchPrograms
  }
} 