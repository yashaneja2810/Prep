"use client";

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useFetchUserProfile } from '@/hooks/useFetchUserProfile';

export function UserProfileInitializer() {
  // Get auth state directly from the store
  const authUser = useAuthStore((state) => state.user);
  
  // Use the SWR hook for fetching user profile
  const { userProfile, error, isLoading, mutate } = useFetchUserProfile();

  // Stabilize the mutate function to prevent useEffect dependency issues
  const stableMutate = useCallback(() => {
    console.log('🟢 [UserProfileInitializer] Triggering profile refetch');
    mutate();
  }, [mutate]);

  useEffect(() => {
    console.log('🟢 [UserProfileInitializer] Current state:', {
      hasAuthUser: !!authUser,
      authUserId: authUser?.id,
      hasUserProfile: !!userProfile,
      userProfileId: userProfile?.id,
      isLoading,
      error: error?.message
    });

    // Log any error that occurs during profile fetch
    if (error) {
      console.error('🔴 [UserProfileInitializer] Failed to fetch user profile:', {
        error: error.message,
        hasAuthUser: !!authUser
      });
      
      // If we get a 401, it means the session is invalid
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('🔴 [UserProfileInitializer] Session appears to be expired or not authenticated');
      }
    }

    // Log successful profile load
    if (userProfile) {
      console.log('✅ [UserProfileInitializer] User profile loaded successfully:', {
        userId: userProfile.id,
        email: userProfile.email,
        roles: userProfile.activeRoles
      });
    }
  }, [authUser, userProfile, error, isLoading]);

  // Trigger initial fetch on mount
  useEffect(() => {
    stableMutate();
  }, []); // Empty dependency array - only run on mount

  return null;
}
