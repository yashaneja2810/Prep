import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/helpers/string_const';

// User interface based on API response
export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
  role?: string;
  first_name?: string;
  last_name?: string;
  preferred_name?: string;
  phone?: string;
  date_of_birth?: string;
  timezone?: string;
  profileCompleted?: boolean;
  createdAt?: string;
  lastSignIn?: string;
}

// Auth store interface
interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  completeProfile: (profileData: Partial<User>) => void;
  updateUserRole: (role: string) => void;
  hasRole: (role: string) => boolean;
}

// Create the auth store with persistence
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Set user
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Login action
      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Update user data
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({
            user: updatedUser,
          });
        }
      },

      // Complete profile
      completeProfile: (profileData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { 
            ...currentUser, 
            ...profileData,
            profileCompleted: true 
          };
          set({
            user: updatedUser,
          });
        }
      },

      // Update user role
      updateUserRole: (role) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, role };
          set({
            user: updatedUser,
          });
        }
      },

      // Check if user has specific role
      hasRole: (role) => {
        const currentUser = get().user;
        return currentUser?.role === role;
      },
    }),
    {
      name: STORAGE_KEYS.USER_DATA,
      // Only persist user data and authentication status
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for commonly used data
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useHasRole = (role: string) => useAuthStore((state) => state.hasRole(role)); 