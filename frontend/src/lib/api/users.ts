import { apiClient } from "./apiClient";
import { getAllTrainerProfiles } from "./trainers";
import type { TrainerProfile } from "@/store/slices/trainers";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  roles?: { id: number; role_name: string }[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await apiClient.get<ApiResponse<User[]>>('/api/users');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await apiClient.get<ApiResponse<User>>(`/api/users/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
}

// Search users by name or email
export async function searchUsers(query: string): Promise<User[]> {
  try {
    const response = await apiClient.get<ApiResponse<{users: User[]}>>(`/api/users?search=${encodeURIComponent(query)}`);
    return response.data.data.users || [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// Find user by exact email
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await searchUsers(email);
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error(`Error finding user with email ${email}:`, error);
    return null;
  }
}

// Get users by role
export async function getUsersByRole(role: string): Promise<User[]> {
  try {
    // Use correctly typed response structure
    interface ApiResponse {
      success?: boolean;
      message?: string;
      data?: {
        users?: User[];
        total?: number;
        page?: number;
        limit?: number;
      } | User[];
    }

    const response = await apiClient.get<ApiResponse>(`/api/users?role=${encodeURIComponent(role)}`);
    
    // Check various possible response structures
    if (response.data) {
      // Case 1: Direct array of users in data
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Case 2: Standard API response structure with data.users property
      if (response.data.data && typeof response.data.data === 'object') {
        // If data.data is an array, return it directly
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        // If data.data.users exists and is an array, return it (most likely structure)
        if (response.data.data.users && Array.isArray(response.data.data.users)) {
          return response.data.data.users;
        }
      }
      
      console.error('Unexpected API response structure:', response.data);
    }
    
    // If we couldn't find users in the response, return empty array
    return [];
  } catch (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    return [];
  }
}

// Get trainers
export async function getTrainers(): Promise<User[]> {
  try {
    // Use the getAllTrainerProfiles function from trainers.ts
    const trainers = await getAllTrainerProfiles();
    
    // Convert TrainerProfile objects to User objects
    return trainers.map(trainer => ({
      id: trainer.id || '',
      email: trainer.email || '',
      first_name: trainer.first_name || '',
      profile_image: trainer.profile_image,
      created_at: undefined,
      updated_at: undefined,
      status: trainer.is_active ? 'active' : 'inactive'
    }));
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return [];
  }
}

// Get learners
export async function getLearners(): Promise<User[]> {
  return getUsersByRole('learner');
} 