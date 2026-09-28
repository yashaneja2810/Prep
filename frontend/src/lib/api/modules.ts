import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const'
import { TopicCompletionResponse } from './completions'

// Module interface based on the backend API documentation
export interface Topic {
  id: string
  topic_code: string
  title: string
  description?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface ModuleTopic {
  id: string
  module_id: string
  topic_id: string
  order_index: number
  created_at?: string
  updated_at?: string
  topic?: Topic
}

export interface Module {
  id: string
  module_code: string
  module_title: string
  module_name: string
  description?: string
  status?: string
  created_at?: string
  updated_at?: string
  topics?: ModuleTopic[]
}

// API endpoints using constants
const ENDPOINTS = {
  MODULES: API_ENDPOINTS.MODULES,
  MODULE_BY_ID: (id: string) => `${API_ENDPOINTS.MODULE_BY_ID}/${id}`,
  MODULE_TOPICS: (id: string) => `${API_ENDPOINTS.MODULE_TOPICS}/${id}/topics`,
  MODULE_TOPIC_REMOVE: (moduleId: string, topicId: string) => `${API_ENDPOINTS.MODULE_TOPIC_REMOVE}/${moduleId}/topics/${topicId}`,
  MODULE_TOPICS_REORDER: (id: string) => `${API_ENDPOINTS.MODULE_TOPICS_REORDER}/${id}/topics/reorder`,
  TOPIC_COMPLETIONS_BY_USER: (userId: string) => `/api/completions/topic/${userId}`
}

// Types for API requests
export interface CreateModuleDto {
  module_code: string
  module_title: string
  module_name: string
  description?: string
  status?: string
  topics?: string[]
}

export interface UpdateModuleDto {
  module_title?: string
  module_name?: string
  description?: string
  status?: string
  topics?: string[]
}

export interface AddTopicsDto {
  topic_ids: string[]
}

export interface ReorderTopicsDto {
  topics: {
    topic_id: string
    order: number
  }[]
}

// Create a new module - Admin only
export const createModule = async (moduleData: CreateModuleDto): Promise<Module> => {
  return await apiRequest.post<Module>(ENDPOINTS.MODULES, moduleData)
}

// Get all modules
export const getAllModules = async (): Promise<Module[]> => {
  return await apiRequest.get<Module[]>(ENDPOINTS.MODULES)
}

// Get a module by ID
export const getModuleById = async (id: string): Promise<Module> => {
  return await apiRequest.get<Module>(ENDPOINTS.MODULE_BY_ID(id))
}

// Update a module - Admin only
export const updateModule = async (id: string, moduleData: UpdateModuleDto): Promise<Module> => {
  return await apiRequest.put<Module>(ENDPOINTS.MODULE_BY_ID(id), moduleData)
}

// Delete a module - Admin only
export const deleteModule = async (id: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.MODULE_BY_ID(id))
}

// Get all topics of a module
export const getModuleTopics = async (moduleId: string): Promise<ModuleTopic[]> => {
  return await apiRequest.get<ModuleTopic[]>(ENDPOINTS.MODULE_TOPICS(moduleId))
}

// Add topics to a module - Admin only
export const addTopicsToModule = async (moduleId: string, topicIds: string[]): Promise<Module> => {
  return await apiRequest.post<Module>(
    ENDPOINTS.MODULE_TOPICS(moduleId), 
    { topic_ids: topicIds }
  )
}

// Remove a topic from a module - Admin only
export const removeTopicFromModule = async (moduleId: string, topicId: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.MODULE_TOPIC_REMOVE(moduleId, topicId))
}

// Reorder topics in a module - Admin only
export const reorderTopics = async (moduleId: string, topics: { topic_id: string; order: number }[]): Promise<Module> => {
  return await apiRequest.put<Module>(
    ENDPOINTS.MODULE_TOPICS_REORDER(moduleId), 
    { topics }
  )
}

// Validation function for module
export const validateModule = (moduleData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Module code validation (required for create)
  if (!isUpdate && !moduleData.module_code) {
    errors.module_code = 'Module code is required'
  } else if (moduleData.module_code && (moduleData.module_code.length < 1 || moduleData.module_code.length > 20)) {
    errors.module_code = 'Module code must be between 1 and 20 characters'
  }

  // Module title validation (required for create)
  if (!isUpdate && !moduleData.module_title) {
    errors.module_title = 'Module title is required'
  } else if (moduleData.module_title && moduleData.module_title.length > 100) {
    errors.module_title = 'Module title cannot exceed 100 characters'
  }

  // Module name validation (required for create)
  if (!isUpdate && !moduleData.module_name) {
    errors.module_name = 'Module name is required'
  } else if (moduleData.module_name && moduleData.module_name.length > 100) {
    errors.module_name = 'Module name cannot exceed 100 characters'
  }

  // Description validation
  if (moduleData.description && moduleData.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters'
  }

  // Status validation
  if (moduleData.status && !['draft', 'published', 'archived'].includes(moduleData.status)) {
    errors.status = 'Status must be one of: draft, published, archived'
  }

  return Object.keys(errors).length === 0 ? null : errors
}

// Helper functions for module data
export const formatModuleStatus = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'published':
      return 'Published'
    case 'archived':
      return 'Archived'
    default:
      return status
  }
}

// Check if a module is completed (all topics are completed)
export const isModuleCompleted = (module: Module, topicCompletions: TopicCompletionResponse[]): boolean => {
  // If module has no topics, it's not completed
  if (!module.topics || module.topics.length === 0) {
    return false
  }

  // Check if all topics in the module are completed
  const allCompleted = module.topics.every(moduleTopic => {
    // Find if this topic is completed
    return topicCompletions.some(completion => 
      completion.topic_id === moduleTopic.topic_id
    )
  })
  
  return allCompleted
}

// Get completed modules count for a user
export const getCompletedModulesCount = async (userId: string, modules: Module[]): Promise<number> => {
  try {
    // Get user topic completions
    const topicCompletions = await apiRequest.get<TopicCompletionResponse[]>(
      ENDPOINTS.TOPIC_COMPLETIONS_BY_USER(userId)
    )
    
    // Count completed modules
    const completedModules = modules.filter(module => 
      isModuleCompleted(module, topicCompletions)
    ).length
    
    return completedModules
  } catch (error) {
    console.error("Failed to get completed modules count:", error)
    return 0
  }
}

// SWR keys for caching
export const MODULES_SWR_KEY = SWR_KEYS.MODULES
export const MODULE_BY_ID_SWR_KEY = (id: string): string => `${SWR_KEYS.MODULE_BY_ID}_${id}`
export const MODULE_TOPICS_SWR_KEY = (id: string): string => `${SWR_KEYS.MODULE_TOPICS}_${id}` 