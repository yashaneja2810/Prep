import { apiRequest, ApiResponse } from '@/helpers/request'
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const'

// Speciality interface
export interface Speciality {
  id: number
  name: string
}

// API endpoints for specialities
const ENDPOINTS = {
  SPECIALITIES: API_ENDPOINTS.SPECIALITIES,
  SPECIALITY_BY_ID: (id: number) => `${API_ENDPOINTS.SPECIALITY_BY_ID}/${id}`,
}

// Get all specialities
export const getAllSpecialities = async (): Promise<Speciality[]> => {
  return await apiRequest.get<Speciality[]>(ENDPOINTS.SPECIALITIES)
}

// Create a new speciality (Admin only)
export const createSpeciality = async (name: string): Promise<Speciality> => {
  return await apiRequest.post<Speciality>(ENDPOINTS.SPECIALITIES, { name })
}

// Update a speciality (Admin only)
export const updateSpeciality = async (
  id: number,
  name: string
): Promise<Speciality> => {
  return await apiRequest.put<Speciality>(ENDPOINTS.SPECIALITY_BY_ID(id), {
    name,
  })
}

// Delete a speciality (Admin only)
export const deleteSpeciality = async (id: number): Promise<void> => {
  await apiRequest.delete<void>(ENDPOINTS.SPECIALITY_BY_ID(id))
}

// Get speciality usage count (how many trainers use this speciality)
export const getSpecialityUsageCount = async (id: number): Promise<{ count: number }> => {
  return await apiRequest.get<{ count: number }>(`${ENDPOINTS.SPECIALITY_BY_ID(id)}/usage`);
}

// SWR Key for specialities
export const SPECIALITIES_SWR_KEY = SWR_KEYS.SPECIALITIES 