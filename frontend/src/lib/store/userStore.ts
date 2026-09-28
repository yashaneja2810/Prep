import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  // Add more preferences as needed
}

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  preferred_name?: string
  phone?: string
  date_of_birth?: string
  timezone: string
  email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  activeRoles: string[]
  activeOrganization?: {
    id: string
    org_name: string
    code: string
    type?: string
    website?: string
    description?: string
  }
  roleProfiles: {
    learner?: {
      id: string
      user_id: string
      learner_type: 'student' | 'professional'
      goals_text?: string
      enrollment_date: string
      rank?: number
      tasks_completed: number
      streak_days: number
      last_activity_date?: string
      profile_image?: string
      learner_student_details?: {
        id: string
        learner_id: string
        college_name?: string
        degree_course?: string
        expected_grad_year?: number
        current_gpa?: number
        interest?: string
      }
      learner_professional_details?: {
        id: string
        learner_id: string
        company_name?: string
        job_title?: string
        years_experience?: number
        pipeline_dev_exp?: number
        portfolio_url?: string
      }
      cohorts?: any[]
      programs?: any[]
    }
    trainer?: {
      id: string
      user_id: string
      total_years_teaching?: number
      bio?: string
      linkedin_url?: string
      expertise?: string
      profile_image?: string
      website?: string
      social_links?: any
      trainer_specialities?: any[]
      cohorts?: any[]
      recentSessions?: any[]
    }
    admin?: {
      id: string
      user_id: string
      admin_level: 'global' | 'organization' | 'program'
      phone_ext?: string
      notes?: string
    }
  }
  stats: {
    totalPoints: number
  }
}

interface UserState {
  profile: UserProfile | null
  preferences: UserPreferences
  
  // Actions
  setProfile: (profile: UserProfile) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  setPreferences: (preferences: Partial<UserPreferences>) => void
  clearUserData: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  emailNotifications: true,
  pushNotifications: false,
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      preferences: defaultPreferences,

      setProfile: (profile) =>
        set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      clearUserData: () =>
        set({
          profile: null,
          preferences: defaultPreferences,
        }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
      }),
    }
  )
) 