import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { authApi, RegisterRequest, LoginRequest, CompleteProfileRequest } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth';
import { useUserStore } from '@/lib/store/userStore';
import { handleError } from '@/helpers/helpers';
import { SWR_KEYS, API_MESSAGES, ROUTES, API_ENDPOINTS } from '@/helpers/string_const';

// Custom hook for user registration
export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      
      if (response.success) {
        toast.success(API_MESSAGES.REGISTRATION_SUCCESS);
        // Redirect to login page after successful registration
        router.push(ROUTES.LOGIN);
      }
      
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
  };
};

// Custom hook for user login
export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login: setAuthUser } = useAuthStore();
  const router = useRouter();

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(data);
      
      if (response.success && response.data.user) {
        // Update auth store
        setAuthUser(response.data.user);
        
        toast.success(API_MESSAGES.LOGIN_SUCCESS);
        
        router.push(ROUTES.DASHBOARD);
        
      }
      
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
};

// Custom hook for completing user profile
export const useCompleteProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { completeProfile: updateAuthProfile } = useAuthStore();
  const router = useRouter();

  const completeProfile = async (data: CompleteProfileRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.completeProfile(data);
      
      if (response.success && response.data.user) {
        // Update auth store
        updateAuthProfile(response.data.user);
        
        toast.success(API_MESSAGES.PROFILE_COMPLETE_SUCCESS);
        
        // Redirect to dashboard
        router.push(ROUTES.DASHBOARD);
      }
      
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completeProfile,
    isLoading,
  };
};

// Custom hook for logout
export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { logout: clearAuthUser } = useAuthStore();
  const { clearUserData } = useUserStore();
  const router = useRouter();

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      
      // Clear auth store
      clearAuthUser();
      // Clear user profile store
      clearUserData();
      
      toast.success(API_MESSAGES.LOGOUT_SUCCESS);
      
      // Redirect to login
      router.push(ROUTES.LOGIN);
    } catch (error) {
      // Even if logout fails on server, clear local state
      clearAuthUser();
      clearUserData();
      handleError(error);
      router.push(ROUTES.LOGIN);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    isLoading,
  };
};

// Custom hook for fetching current user with SWR
export const useCurrentUser = () => {
  const { setUser, setLoading } = useAuthStore();

  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.CURRENT_USER,
    async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data.user) {
          setUser(response.data.user);
          return response.data.user;
        }
        return null;
      } catch (error) {
        // Don't show error toast for 401 (user not authenticated)
        const errorStatus = (error as any)?.response?.status;
        if (errorStatus !== 401) {
          handleError(error);
        }
        setUser(null);
        throw error;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  // Update loading state in store
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  return {
    user: data,
    error,
    isLoading,
    mutate,
  };
};

// Custom hook for fetching user role with SWR
export const useUserRole = () => {
  const [fetchError, setFetchError] = useState<Error | null>(null);
  
  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.USER_ROLE,
    async () => {
      try {
        console.log('Fetching user role from API');
        const response = await authApi.getCurrentUserRole();
        console.log('User role response:', JSON.stringify(response, null, 2));
        
        // Check if response has the expected structure
        if (response && response.data && response.data.roles) {
          console.log('Roles found:', response.data.roles);
          return response.data.roles;
        } else {
          console.warn('No roles found in response:', JSON.stringify(response, null, 2));
          setFetchError(new Error('No roles found in response'));
          return [];
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Log detailed error information
        if ((error as any)?.response) {
          console.error('Error response:', {
            status: (error as any).response.status,
            data: (error as any).response.data,
            headers: (error as any).response.headers,
          });
        }
        
        // Don't show error toast for 401 (user not authenticated)
        const errorStatus = (error as any)?.response?.status;
        if (errorStatus !== 401) {
          handleError(error);
        }
        setFetchError(error as Error);
        return [];
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 10000, // 10 seconds
    }
  );

  // For debugging purposes
  useEffect(() => {
    console.log('useUserRole hook state:', {
      data,
      error,
      fetchError,
      isLoading
    });
  }, [data, error, fetchError, isLoading]);

  return {
    roles: data || [],
    error: error || fetchError,
    isLoading,
    mutate
  };
};

// Hook to check authentication status
export const useAuthStatus = () => {
  const { user } = useAuthStore();
  const { isLoading } = useCurrentUser();

  return {
    isAuthenticated: !!user,
    user,
    isLoading,
    isProfileComplete: user?.profileCompleted || false,
  };
};
