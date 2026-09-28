import useSWR from 'swr';
import { useUserStore, type UserProfile } from '@/lib/store/userStore';
import { useAuthStore } from '@/lib/store/auth';
import { API_ENDPOINTS } from '@/helpers/string_const';
import { handleError } from '@/helpers/helpers';
import { apiRequest } from '@/helpers/request';

export const useFetchUserProfile = () => {
  const { setProfile } = useUserStore();
  const user = useAuthStore((state) => state.user);

  const { data, error, isLoading, mutate } = useSWR(
    API_ENDPOINTS.USERS_ME, // Always fetch, regardless of auth user state
    async (url) => {
      try {
        console.log('🟢 [useFetchUserProfile] Starting fetch for URL:', url);
        console.log('🟢 [useFetchUserProfile] Auth user exists:', !!user, user?.id);
        
        const userProfileData = await apiRequest.get<UserProfile>(API_ENDPOINTS.USERS_ME);
        console.log('🟢 [useFetchUserProfile] Raw API response:', userProfileData);
        console.log('🟢 [useFetchUserProfile] Response type:', typeof userProfileData);
        console.log('🟢 [useFetchUserProfile] Response keys:', Object.keys(userProfileData || {}));
        
        // Validate response structure
        if (!userProfileData) {
          console.warn('🔴 [useFetchUserProfile] Response is null or undefined');
          throw new Error('No user profile data received');
        }
        
        if (!userProfileData.id || !userProfileData.email) {
          console.warn('🔴 [useFetchUserProfile] Missing required fields:', {
            hasId: !!userProfileData.id,
            hasEmail: !!userProfileData.email,
            response: userProfileData
          });
          throw new Error('Invalid user profile data structure');
        }
        
        // Create a complete profile with proper type checking and defaults
        const completeProfile: UserProfile = {
          // Required fields with validation
          id: userProfileData.id,
          email: userProfileData.email,
          timezone: userProfileData.timezone || 'UTC',
          email_verified: userProfileData.email_verified ?? false,
          is_active: userProfileData.is_active ?? true,
          created_at: userProfileData.created_at || new Date().toISOString(),
          updated_at: userProfileData.updated_at || new Date().toISOString(),
          
          // Handle arrays with proper validation
          activeRoles: Array.isArray(userProfileData.activeRoles) ? userProfileData.activeRoles : [],
          
          // Handle role profiles with proper validation
          roleProfiles: {
            learner: userProfileData.roleProfiles?.learner || undefined,
            trainer: userProfileData.roleProfiles?.trainer || undefined,
            admin: userProfileData.roleProfiles?.admin || undefined,
          },
          
          // Handle stats with validation
          stats: {
            totalPoints: userProfileData.stats?.totalPoints || 0,
          },
          
          // Optional fields
          first_name: userProfileData.first_name || undefined,
          last_name: userProfileData.last_name || undefined,
          preferred_name: userProfileData.preferred_name || undefined,
          phone: userProfileData.phone || undefined,
          date_of_birth: userProfileData.date_of_birth || undefined,
          activeOrganization: userProfileData.activeOrganization || undefined
        };
        
        console.log('✅ [useFetchUserProfile] Processed user profile:', completeProfile);
        console.log('✅ [useFetchUserProfile] Active roles:', completeProfile.activeRoles);
        console.log('✅ [useFetchUserProfile] Role profiles:', Object.keys(completeProfile.roleProfiles));
        
        setProfile(completeProfile);
        return completeProfile;
      } catch (err) {
        console.error('🔴 [useFetchUserProfile] Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        handleError(err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    userProfile: data,
    error,
    isLoading,
    mutate,
  };
};

