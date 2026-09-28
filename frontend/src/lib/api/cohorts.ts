import { apiRequest } from '@/helpers/request'
import { findUserByEmail } from "./users";
import { API_ENDPOINTS, SWR_KEYS } from "@/helpers/string_const";

export interface Cohort {
  id: string;
  cohort_code: string;
  title: string;
  description?: string;
  program_id: string;
  org_id?: string;
  scope: 'direct' | 'organization';
  start_date: string;
  end_date: string;
  github_repo_link?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  program?: {
    title: string;
  };
  organization?: {
    org_name: string;
  };
  cohort_trainers?: CohortUser[];
  cohort_learners?: {
    id: string;
  }[];
}

export interface CohortUser {
  id: string;
  user_id: string;
  cohort_id: string;
  is_primary?: boolean;
  joined_at?: string;
  user: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

// API endpoints using constants
const ENDPOINTS = {
  COHORTS: API_ENDPOINTS.COHORTS,
  COHORT_BY_ID: (id: string) => `${API_ENDPOINTS.COHORT_BY_ID}/${id}`,
  COHORT_TRAINERS: (id: string) => `${API_ENDPOINTS.COHORT_TRAINERS}/${id}/trainers`,
  COHORT_TRAINER_REMOVE: (cohortId: string, trainerId: string) => `${API_ENDPOINTS.COHORT_TRAINERS}/${cohortId}/trainers/${trainerId}`,
  COHORT_LEARNERS: (id: string) => `${API_ENDPOINTS.COHORT_LEARNERS}/${id}/learners`,
  COHORT_LEARNER_REMOVE: (cohortId: string, learnerId: string) => `${API_ENDPOINTS.COHORT_LEARNERS}/${cohortId}/learners/${learnerId}`
}

// Types for API requests
export interface CreateCohortDto {
  cohort_code: string;
  title: string;
  description?: string;
  program_id: string;
  org_id?: string;
  scope: 'direct' | 'organization';
  start_date: string;
  end_date: string;
  github_repo_link?: string;
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  trainer_ids?: string[];
  learner_ids?: string[];
}

export interface UpdateCohortDto {
  title?: string;
  description?: string;
  org_id?: string;
  scope?: 'direct' | 'organization';
  start_date?: string;
  end_date?: string;
  github_repo_link?: string;
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface AddTrainersToCohortDto {
  trainer_ids: string[];
}

export interface AddLearnersToCohortDto {
  learner_ids: string[];
}

// Create a new cohort - Admin only
export const createCohort = async (cohortData: CreateCohortDto): Promise<Cohort> => {
  return await apiRequest.post<Cohort>(ENDPOINTS.COHORTS, cohortData)
}

// Get all cohorts
export const getAllCohorts = async (
  filters?: { scope?: string; status?: string; programId?: string }
): Promise<Cohort[]> => {
  let url = ENDPOINTS.COHORTS
  
  // Add query parameters if filters are provided
  if (filters) {
    const queryParams = new URLSearchParams()
    if (filters.scope) queryParams.append('scope', filters.scope)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.programId) queryParams.append('programId', filters.programId)
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }
  }
  
  return await apiRequest.get<Cohort[]>(url)
}

// Get a cohort by ID
export const getCohortById = async (id: string): Promise<Cohort> => {
  return await apiRequest.get<Cohort>(ENDPOINTS.COHORT_BY_ID(id))
}

// Update a cohort - Admin only
export const updateCohort = async (id: string, cohortData: UpdateCohortDto): Promise<Cohort> => {
  return await apiRequest.put<Cohort>(ENDPOINTS.COHORT_BY_ID(id), cohortData)
}

// Delete a cohort - Admin only
export const deleteCohort = async (id: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.COHORT_BY_ID(id))
}

// Get trainers for a cohort
export const getCohortTrainers = async (cohortId: string): Promise<CohortUser[]> => {
  return await apiRequest.get<CohortUser[]>(ENDPOINTS.COHORT_TRAINERS(cohortId))
}

// Add trainers to a cohort - Admin only
export const addTrainersToCohort = async (cohortId: string, trainerIds: string[]): Promise<any> => {
  return await apiRequest.post<any>(
    ENDPOINTS.COHORT_TRAINERS(cohortId), 
    { trainer_ids: trainerIds }
  )
}

// Remove a trainer from a cohort - Admin only
export const removeTrainerFromCohort = async (cohortId: string, trainerId: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.COHORT_TRAINER_REMOVE(cohortId, trainerId))
}

// Get learners for a cohort
export const getCohortLearners = async (cohortId: string): Promise<CohortUser[]> => {
  return await apiRequest.get<CohortUser[]>(ENDPOINTS.COHORT_LEARNERS(cohortId))
}

// Add learners to a cohort - Admin only
export const addLearnersToCohort = async (cohortId: string, learnerIds: string[]): Promise<any> => {
  return await apiRequest.post<any>(
    ENDPOINTS.COHORT_LEARNERS(cohortId), 
    { learner_ids: learnerIds }
  )
}

// Remove a learner from a cohort - Admin only
export const removeLearnerFromCohort = async (cohortId: string, learnerId: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.COHORT_LEARNER_REMOVE(cohortId, learnerId))
}

// Update all trainers for a cohort (remove existing and add new ones)
export const updateCohortTrainers = async (cohortId: string, trainerIds: string[]): Promise<void> => {
  // Get current trainers
  const currentTrainers = await getCohortTrainers(cohortId)
  
  // Create sets for easier comparison
  const currentTrainerIds = new Set(currentTrainers.map(trainer => trainer.user_id))
  const newTrainerIds = new Set(trainerIds)
  
  // Trainers to remove (in current but not in new)
  for (const trainer of currentTrainers) {
    if (!newTrainerIds.has(trainer.user_id)) {
      await removeTrainerFromCohort(cohortId, trainer.id)
    }
  }
  
  // Trainers to add (in new but not in current)
  const trainersToAdd = trainerIds.filter(id => !currentTrainerIds.has(id))
  if (trainersToAdd.length > 0) {
    await addTrainersToCohort(cohortId, trainersToAdd)
  }
}

// Update all learners for a cohort (remove existing and add new ones)
export const updateCohortLearners = async (
  cohortId: string, 
  learnerData: Array<{ id?: string; name: string; email: string }>
): Promise<void> => {
  // Get current learners
  const currentLearners = await getCohortLearners(cohortId)
  
  // Create map of email to id for current learners
  const currentLearnerMap = new Map(
    currentLearners.map(learner => [learner.user.email, learner.id])
  )
  
  // Create set of emails for easier comparison
  const newLearnerEmails = new Set(learnerData.map(learner => learner.email))
  
  // Learners to remove (in current but not in new)
  for (const learner of currentLearners) {
    if (!newLearnerEmails.has(learner.user.email)) {
      await removeLearnerFromCohort(cohortId, learner.id)
    }
  }
  
  // Add new learners
  const learnersToAdd: string[] = []
  
  // Find learners that need to be added (in new but not in current)
  for (const learner of learnerData) {
    if (!currentLearnerMap.has(learner.email)) {
      // Try to find user by email
      try {
        const user = await findUserByEmail(learner.email)
        if (user) {
          learnersToAdd.push(user.id)
        } else {
          console.warn(`User with email ${learner.email} not found`)
          // TODO: Handle case where user doesn't exist
        }
      } catch (error) {
        console.error(`Error finding user with email ${learner.email}:`, error)
      }
    }
  }
  
  // Add learners if we found any
  if (learnersToAdd.length > 0) {
    await addLearnersToCohort(cohortId, learnersToAdd)
  }
}

// Find user by email - Helper function
export const findUserByEmail = async (email: string): Promise<{ id: string } | null> => {
  try {
    const response = await apiRequest.get<any[]>(`/api/users?email=${encodeURIComponent(email)}`)
    return response && response.length > 0 ? response[0] : null
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}

// Validation function for cohort
export const validateCohort = (cohortData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Cohort code validation (required for create)
  if (!isUpdate && !cohortData.cohort_code) {
    errors.cohort_code = 'Cohort code is required'
  } else if (cohortData.cohort_code && (cohortData.cohort_code.length < 1 || cohortData.cohort_code.length > 20)) {
    errors.cohort_code = 'Cohort code must be between 1 and 20 characters'
  }

  // Title validation (required for create)
  if (!isUpdate && !cohortData.title) {
    errors.title = 'Cohort title is required'
  } else if (cohortData.title && cohortData.title.length > 100) {
    errors.title = 'Cohort title cannot exceed 100 characters'
  }

  // Program ID validation (required for create)
  if (!isUpdate && !cohortData.program_id) {
    errors.program_id = 'Program is required'
  }

  // Scope validation (required for create)
  if (!isUpdate && !cohortData.scope) {
    errors.scope = 'Scope is required'
  } else if (cohortData.scope && !['direct', 'organization'].includes(cohortData.scope)) {
    errors.scope = 'Scope must be either direct or organization'
  }

  // Start date validation (required for create)
  if (!isUpdate && !cohortData.start_date) {
    errors.start_date = 'Start date is required'
  }

  // End date validation (required for create)
  if (!isUpdate && !cohortData.end_date) {
    errors.end_date = 'End date is required'
  }

  // End date must be after start date
  if (cohortData.start_date && cohortData.end_date) {
    const startDate = new Date(cohortData.start_date)
    const endDate = new Date(cohortData.end_date)
    if (endDate < startDate) {
      errors.end_date = 'End date must be after start date'
    }
  }

  // Status validation
  if (cohortData.status && !['upcoming', 'active', 'completed', 'cancelled'].includes(cohortData.status)) {
    errors.status = 'Status must be one of: upcoming, active, completed, cancelled'
  }

  // Description validation
  if (cohortData.description && cohortData.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters'
  }

  // GitHub repo link validation
  if (cohortData.github_repo_link && cohortData.github_repo_link.length > 255) {
    errors.github_repo_link = 'GitHub repository link cannot exceed 255 characters'
  }

  return Object.keys(errors).length === 0 ? null : errors
}

// Helper functions for cohort data
export const formatCohortStatus = (status: string): string => {
  switch (status) {
    case 'upcoming':
      return 'Upcoming'
    case 'active':
      return 'Active'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

export const formatCohortScope = (scope: string): string => {
  switch (scope) {
    case 'direct':
      return 'Direct'
    case 'organization':
      return 'Organization'
    default:
      return scope
  }
}

// SWR keys for caching
export const COHORTS_SWR_KEY = SWR_KEYS.COHORTS
export const COHORT_BY_ID_SWR_KEY = (id: string): string => `${SWR_KEYS.COHORT_BY_ID}_${id}`
export const COHORT_TRAINERS_SWR_KEY = (id: string): string => `${SWR_KEYS.COHORT_TRAINERS}_${id}`
export const COHORT_LEARNERS_SWR_KEY = (id: string): string => `${SWR_KEYS.COHORT_LEARNERS}_${id}` 