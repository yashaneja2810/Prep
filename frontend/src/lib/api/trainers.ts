import { apiRequest } from '@/helpers/request'
import { TrainerProfile, Speciality } from '@/store/slices/trainers'
import { API_ENDPOINTS } from '@/helpers/string_const'
import { apiClient } from './apiClient'

// Types for API requests
export interface CreateTrainerProfileData {
  email: string
  specialities: number[] // Array of speciality IDs
  total_years_teaching?: number
  bio?: string
  expertise?: string
  linkedin_url?: string
  website?: string
  profile_image?: string
  social_links?: Record<string, string> | null
}

export interface UpdateTrainerProfileData {
  specialities?: number[] // Array of speciality IDs
  total_years_teaching?: number
  bio?: string
  expertise?: string
  linkedin_url?: string
  website?: string
  profile_image?: string
  social_links?: Record<string, string> | null
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface CohortTrainer extends TrainerProfile {
  user?: {
    first_name: string
    email: string
  }
}

// Get all trainer profiles (Admin only)
export const getAllTrainerProfiles = async (): Promise<TrainerProfile[]> => {
  return await apiRequest.get<TrainerProfile[]>(API_ENDPOINTS.TRAINER_PROFILES)
}

// Get trainer profile by ID (Admin only)
export const getTrainerProfileById = async (id: string): Promise<TrainerProfile> => {
  return await apiRequest.get<TrainerProfile>(`${API_ENDPOINTS.TRAINER_PROFILE_BY_ID}/${id}`)
}

// Get trainers by cohort ID
export async function getTrainersByCohort(cohortId: string): Promise<TrainerProfile[]> {
  try {
    const response = await apiClient.get<ApiResponse<CohortTrainer[]>>(`/api/cohorts/${cohortId}/trainers`);
    console.log('Cohort Trainers API Response:', response.data);
    
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      console.error('Invalid response structure from trainers API:', response.data);
      return [];
    }
    
    // Process the data to ensure it has the expected structure
    const trainers = response.data.data.map((trainer): TrainerProfile => {
      // Handle the specific structure returned by cohort trainers endpoint
      if (trainer.user) {
        const { user, ...profileData } = trainer;
        return {
          ...profileData,
          first_name: user.first_name,
          email: user.email,
        };
      }
      return trainer;
    });
    
    return trainers;
  } catch (error) {
    console.error(`Error fetching trainers for cohort ${cohortId}:`, error);
    return [];
  }
} 

// Create trainer profile using email (Admin only)
export const createTrainerProfileByEmail = async (
  email: string,
  profileData: Omit<CreateTrainerProfileData, 'email'>
): Promise<TrainerProfile> => {
  const requestData: CreateTrainerProfileData = {
    email,
    ...profileData
  }
  
  return await apiRequest.post<TrainerProfile>(
    API_ENDPOINTS.TRAINER_PROFILES,
    requestData
  )
}

// Update trainer profile by ID (Admin only)
export const updateTrainerProfileById = async (
  id: string,
  profileData: UpdateTrainerProfileData
): Promise<TrainerProfile> => {
  return await apiRequest.put<TrainerProfile>(
    `${API_ENDPOINTS.UPDATE_TRAINER_PROFILE}/${id}`,
    profileData
  )
}

// Deactivate trainer profile by ID (Admin only) - Soft delete
export const deactivateTrainerProfileById = async (id: string): Promise<TrainerProfile> => {
  return await apiRequest.delete<TrainerProfile>(
    `${API_ENDPOINTS.DELETE_TRAINER_PROFILE}/${id}`
  )
}

// Reactivate trainer profile by ID (Admin only)
export const reactivateTrainerProfileById = async (id: string): Promise<TrainerProfile> => {
  return await apiRequest.put<TrainerProfile>(
    `${API_ENDPOINTS.REACTIVATE_TRAINER_PROFILE}/${id}/activate`
  )
}

// Permanently delete trainer profile by ID (Super Admin only)
export const permanentlyDeleteTrainerProfileById = async (id: string): Promise<TrainerProfile> => {
  return await apiRequest.delete<TrainerProfile>(
    `${API_ENDPOINTS.PERMANENT_DELETE_TRAINER_PROFILE}/${id}/permanent`
  )
}

// DEPRECATED: Legacy create function - keeping for backward compatibility
export const createTrainerProfile = async (
  profileData: Omit<TrainerProfile, 'first_name' | 'email'>
): Promise<TrainerProfile> => {
  console.warn('createTrainerProfile is deprecated. Use createTrainerProfileByEmail instead.')
  return await apiRequest.post<TrainerProfile>(
    API_ENDPOINTS.TRAINER_PROFILES,
    profileData
  )
}

// DEPRECATED: Legacy update function - keeping for backward compatibility
export const updateTrainerProfile = async (
  profileData: Partial<TrainerProfile> & { user_id: string }
): Promise<TrainerProfile> => {
  console.warn('updateTrainerProfile is deprecated. Use updateTrainerProfileById instead.')
  return await apiRequest.put<TrainerProfile>(
    API_ENDPOINTS.TRAINER_PROFILES,
    profileData
  )
}

// DEPRECATED: Legacy delete function
export const deleteTrainerProfileById = async (id: string): Promise<TrainerProfile> => {
  console.warn('deleteTrainerProfileById is deprecated. Use deactivateTrainerProfileById for soft delete or permanentlyDeleteTrainerProfileById for hard delete.')
  return deactivateTrainerProfileById(id)
} 