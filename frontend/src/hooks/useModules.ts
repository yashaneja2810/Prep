import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useModulesStore } from '@/store/slices/modules'
import * as modulesApi from '@/lib/api/modules'
import { handleError } from '@/helpers/helpers'
import { API_MESSAGES } from '@/helpers/string_const'
import { authApi } from '@/lib/api/auth'

// Main hook for module management
export const useModules = () => {
  // State from store
  const {
    modules,
    filteredModules,
    selectedModule,
    isLoading,
    error,
    setModules,
    setLoading,
    setError,
    addModule,
    updateModule: updateModuleInStore,
    removeModule,
    setSelectedModule
  } = useModulesStore()

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all modules
  const fetchModules = async (showToast = false) => {
    try {
      setLoading(true)
      const modulesData = await modulesApi.getAllModules()
      setModules(modulesData)
      if (showToast) toast.success('Modules loaded successfully')
      return modulesData
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return fetchModules(showToast)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return []
    } finally {
      setLoading(false)
    }
  }

  // Fetch module by ID
  const fetchModuleById = async (id: string) => {
    try {
      setLoading(true)
      const moduleData = await modulesApi.getModuleById(id)
      setSelectedModule(moduleData)
      return moduleData
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return fetchModuleById(id)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create module
  const createModule = async (moduleData: modulesApi.CreateModuleDto) => {
    try {
      setIsSubmitting(true)
      
      // Validate module data
      const validationErrors = modulesApi.validateModule(moduleData, false)
      if (validationErrors) {
        setError('Please correct the validation errors')
        return { success: false, errors: validationErrors }
      }
      
      const newModule = await modulesApi.createModule(moduleData)
      addModule(newModule)
      toast.success('Module created successfully')
      return { success: true, module: newModule }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return createModule(moduleData)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, errors: { general: getErrorMessage(error) } }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update module
  const updateModule = async (id: string, moduleData: modulesApi.UpdateModuleDto) => {
    try {
      setIsSubmitting(true)
      
      // Validate module data
      const validationErrors = modulesApi.validateModule(moduleData, true)
      if (validationErrors) {
        setError('Please correct the validation errors')
        return { success: false, errors: validationErrors }
      }
      
      const updatedModule = await modulesApi.updateModule(id, moduleData)
      updateModuleInStore(id, updatedModule)
      toast.success('Module updated successfully')
      return { success: true, module: updatedModule }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return updateModule(id, moduleData)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, errors: { general: getErrorMessage(error) } }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete module
  const deleteModule = async (id: string) => {
    try {
      setIsSubmitting(true)
      await modulesApi.deleteModule(id)
      removeModule(id)
      toast.success('Module deleted successfully')
      return { success: true }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return deleteModule(id)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add topics to module
  const addTopicsToModule = async (moduleId: string, topicIds: string[]) => {
    try {
      setIsSubmitting(true)
      const updatedModule = await modulesApi.addTopicsToModule(moduleId, topicIds)
      updateModuleInStore(moduleId, updatedModule)
      toast.success('Topics added to module successfully')
      return { success: true, module: updatedModule }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return addTopicsToModule(moduleId, topicIds)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Remove topic from module
  const removeTopicFromModule = async (moduleId: string, topicId: string) => {
    try {
      setIsSubmitting(true)
      await modulesApi.removeTopicFromModule(moduleId, topicId)
      
      // Fetch updated module to refresh state
      const updatedModule = await modulesApi.getModuleById(moduleId)
      updateModuleInStore(moduleId, updatedModule)
      
      toast.success('Topic removed from module successfully')
      return { success: true, module: updatedModule }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return removeTopicFromModule(moduleId, topicId)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reorder topics
  const reorderModuleTopics = async (moduleId: string, topics: { topic_id: string; order: number }[]) => {
    try {
      setIsSubmitting(true)
      const updatedModule = await modulesApi.reorderTopics(moduleId, topics)
      updateModuleInStore(moduleId, updatedModule)
      toast.success('Module topics reordered successfully')
      return { success: true, module: updatedModule }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return reorderModuleTopics(moduleId, topics)
      }
      handleError(error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check module completion
  const checkModuleCompletion = async (moduleId: string, userId?: string) => {
    try {
      if (!userId) return { success: false, error: 'User ID is required' }
      
      const module = await modulesApi.getModuleById(moduleId)
      const completedModules = await modulesApi.getCompletedModulesCount(userId, [module])
      
      return { 
        success: true, 
        isCompleted: completedModules > 0,
        module
      }
    } catch (error) {
      // Handle token expiration
      if (isTokenExpired(error)) {
        await refreshToken()
        return checkModuleCompletion(moduleId, userId)
      }
      handleError(error)
      return { success: false, error: getErrorMessage(error) }
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
    modules,
    filteredModules,
    selectedModule,
    
    // State
    isLoading,
    isSubmitting,
    error,
    
    // Actions
    fetchModules,
    fetchModuleById,
    createModule,
    updateModule,
    deleteModule,
    addTopicsToModule,
    removeTopicFromModule,
    reorderModuleTopics,
    checkModuleCompletion,
    setSelectedModule
  }
}

// Additional hooks for specific use cases
export const useModuleById = (moduleId: string) => {
  const { fetchModuleById, selectedModule, isLoading, error } = useModules()
  
  // Fetch module on mount
  useEffect(() => {
    if (moduleId) {
      fetchModuleById(moduleId)
    }
  }, [moduleId, fetchModuleById])
  
  return {
    module: selectedModule,
    isLoading,
    error,
    refetch: () => fetchModuleById(moduleId)
  }
}

export const useModuleTopics = (moduleId: string) => {
  const [topics, setTopics] = useState<modulesApi.ModuleTopic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchTopics = async () => {
    try {
      setIsLoading(true)
      const topicsData = await modulesApi.getModuleTopics(moduleId)
      setTopics(topicsData)
      return topicsData
    } catch (err) {
      handleError(err)
      setError(err?.message || 'Failed to fetch module topics')
      return []
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch topics on mount
  useEffect(() => {
    if (moduleId) {
      fetchTopics()
    }
  }, [moduleId])
  
  return {
    topics,
    isLoading,
    error,
    refetch: fetchTopics
  }
} 