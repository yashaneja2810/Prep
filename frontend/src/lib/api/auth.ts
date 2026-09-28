import { apiRequest, ApiResponse } from '@/helpers/request';
import { API_ENDPOINTS } from '@/helpers/string_const';
import { User } from '@/lib/store/auth';

// Request types
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CompleteProfileRequest {
  first_name: string;
  last_name: string;
  preferred_name?: string;
  phone?: string;
  date_of_birth?: string;
  timezone?: string;
}

// Response types
export interface AuthResponse {
  user: User;
}

export interface UserRole {
  id: string;
  role_id: number;
  role_name: string;
  description: string;
  is_active: boolean;
  assigned_at: string;
}

export interface UserRolesResponse {
  roles: UserRole[];
}

// Auth API service
export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH_REGISTER, data);
  },

  // Login user
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH_LOGIN, data);
  },

  // Complete user profile
  completeProfile: async (data: CompleteProfileRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH_COMPLETE_PROFILE, data);
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest.get<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH_ME);
  },

  // Get current user role
  getCurrentUserRole: async (): Promise<ApiResponse<UserRolesResponse>> => {
      return apiRequest.get<ApiResponse<UserRolesResponse>>(API_ENDPOINTS.AUTH_ROLE);
  },

  // Logout user
  logout: async (): Promise<ApiResponse<any>> => {
    return apiRequest.post<ApiResponse<any>>(API_ENDPOINTS.AUTH_LOGOUT);
  },

  // Refresh session
  refreshSession: async (): Promise<ApiResponse<any>> => {
    return apiRequest.post<ApiResponse<any>>(API_ENDPOINTS.AUTH_REFRESH);
  },

  // Test cookies (for debugging)
  testCookies: async (): Promise<ApiResponse<any>> => {
    return apiRequest.get<ApiResponse<any>>('/api/auth/test-cookies');
  },
}; 