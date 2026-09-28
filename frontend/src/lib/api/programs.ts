import { apiRequest } from '@/helpers/request'
import { Module } from './modules'
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const'

export interface Program {
  id: string
  program_code: string
  title: string
  description?: string
  prerequisites?: string
  status?: string
  thumbnail?: string
  duration?: number
  level?: string
  created_at?: string
  updated_at?: string
  modules?: Module[]
}

// API endpoints using constants
const ENDPOINTS = {
  PROGRAMS: API_ENDPOINTS.PROGRAMS,
  PROGRAM_BY_ID: (id: string) => `${API_ENDPOINTS.PROGRAM_BY_ID}/${id}`,
  PROGRAM_MODULES: (id: string) => `${API_ENDPOINTS.PROGRAM_MODULES}/${id}/modules`,
  PROGRAM_MODULE_REMOVE: (programId: string, moduleId: string) => `${API_ENDPOINTS.PROGRAM_MODULE_REMOVE}/${programId}/modules/${moduleId}`,
  PROGRAM_MODULES_REORDER: (id: string) => `${API_ENDPOINTS.PROGRAM_MODULES_REORDER}/${id}/modules/reorder`,
  PUBLISHED_PROGRAMS: API_ENDPOINTS.PUBLISHED_PROGRAMS,
  PUBLISHED_PROGRAMS_COUNTS: API_ENDPOINTS.PUBLISHED_PROGRAMS_COUNTS
}

// Types for API requests
export interface CreateProgramDto {
  program_code: string
  title: string
  description?: string
  prerequisites?: string
  status?: string
  thumbnail?: string
  duration?: string | number
  level?: string
  modules?: string[]
}

export interface UpdateProgramDto {
  title?: string
  description?: string
  prerequisites?: string
  status?: string
  thumbnail?: string
  duration?: string | number
  level?: string
  modules?: string[]
}

export interface AddModulesDto {
  module_ids: string[]
}

export interface ReorderModulesDto {
  modules: {
    module_id: string
    order: number
  }[]
}

// Interface for program counts
export interface ProgramCounts {
  ap_count: number
  cp_count: number
}

// Create a new program - Admin only
export const createProgram = async (programData: CreateProgramDto): Promise<Program> => {
  return await apiRequest.post<Program>(ENDPOINTS.PROGRAMS, programData)
}

// Get all programs
export const getAllPrograms = async (): Promise<Program[]> => {
  return await apiRequest.get<Program[]>(ENDPOINTS.PROGRAMS)
}

// Get a program by ID
export const getProgramById = async (id: string): Promise<Program> => {
  return await apiRequest.get<Program>(ENDPOINTS.PROGRAM_BY_ID(id))
}

// Get modules of a specific program
export const getProgramModules = async (programId: string): Promise<Module[]> => {
  return await apiRequest.get<Module[]>(ENDPOINTS.PROGRAM_MODULES(programId))
}

// Update a program - Admin only
export const updateProgram = async (id: string, programData: UpdateProgramDto): Promise<Program> => {
  return await apiRequest.put<Program>(ENDPOINTS.PROGRAM_BY_ID(id), programData)
}

// Delete a program - Admin only
export const deleteProgram = async (id: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.PROGRAM_BY_ID(id))
}

// Add modules to a program - Admin only
export const addModulesToProgram = async (programId: string, moduleIds: string[]): Promise<Program> => {
  return await apiRequest.post<Program>(
    ENDPOINTS.PROGRAM_MODULES(programId), 
    { module_ids: moduleIds }
  )
}

// Remove a module from a program - Admin only
export const removeModuleFromProgram = async (programId: string, moduleId: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.PROGRAM_MODULE_REMOVE(programId, moduleId))
}

// Reorder modules in a program - Admin only
export const reorderProgramModules = async (programId: string, modules: { module_id: string; order: number }[]): Promise<Program> => {
  return await apiRequest.put<Program>(
    ENDPOINTS.PROGRAM_MODULES_REORDER(programId), 
    { modules }
  )
}

// Get published programs
export const getPublishedPrograms = async (): Promise<Program[]> => {
  return await apiRequest.get<Program[]>(ENDPOINTS.PUBLISHED_PROGRAMS)
}

// Get counts of APs and CPs for published programs
export const getPublishedProgramsCounts = async (): Promise<ProgramCounts> => {
  return await apiRequest.get<ProgramCounts>(ENDPOINTS.PUBLISHED_PROGRAMS_COUNTS)
}

// Validation function for program
export const validateProgram = (programData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Program code validation (required for create)
  if (!isUpdate && !programData.program_code) {
    errors.program_code = 'Program code is required'
  } else if (programData.program_code && (programData.program_code.length < 1 || programData.program_code.length > 20)) {
    errors.program_code = 'Program code must be between 1 and 20 characters'
  }

  // Title validation (required for create)
  if (!isUpdate && !programData.title) {
    errors.title = 'Program title is required'
  } else if (programData.title && programData.title.length > 100) {
    errors.title = 'Program title cannot exceed 100 characters'
  }

  // Description validation
  if (programData.description && programData.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters'
  }

  // Prerequisites validation
  if (programData.prerequisites && programData.prerequisites.length > 200) {
    errors.prerequisites = 'Prerequisites cannot exceed 200 characters'
  }

  // Status validation
  if (programData.status && !['draft', 'published', 'archived'].includes(programData.status)) {
    errors.status = 'Status must be one of: draft, published, archived'
  }

  // Duration validation
  if (programData.duration) {
    const duration = typeof programData.duration === 'string' 
      ? parseInt(programData.duration, 10) 
      : programData.duration
    
    if (isNaN(duration) || duration < 0) {
      errors.duration = 'Duration must be a positive number'
    }
  }

  // Level validation
  if (programData.level && !['beginner', 'intermediate', 'advanced'].includes(programData.level)) {
    errors.level = 'Level must be one of: beginner, intermediate, advanced'
  }

  return Object.keys(errors).length === 0 ? null : errors
}

// Helper functions for program data
export const formatProgramStatus = (status: string): string => {
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

export const formatProgramLevel = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'Beginner'
    case 'intermediate':
      return 'Intermediate'
    case 'advanced':
      return 'Advanced'
    default:
      return level
  }
}

// SWR keys for caching
export const PROGRAMS_SWR_KEY = SWR_KEYS.PROGRAMS
export const PROGRAM_BY_ID_SWR_KEY = (id: string): string => `${SWR_KEYS.PROGRAM_BY_ID}_${id}`
export const PROGRAM_MODULES_SWR_KEY = (id: string): string => `${SWR_KEYS.PROGRAM_MODULES}_${id}`
export const PUBLISHED_PROGRAMS_SWR_KEY = SWR_KEYS.PUBLISHED_PROGRAMS
export const PUBLISHED_PROGRAMS_COUNTS_SWR_KEY = SWR_KEYS.PUBLISHED_PROGRAMS_COUNTS 