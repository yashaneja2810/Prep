// ============================================================================
// CENTRALIZED STORE EXPORTS
// ============================================================================

// Trainer Store
export { 
  useTrainersStore, 
  type TrainerProfile, 
  type ExtendedTrainer 
} from './slices/trainers'

// Future store exports can be added here following the same pattern:
/*
// Auth Store
export { 
  useAuthStore, 
  type User, 
  type AuthState 
} from './authStore'

// UI Store
export { 
  useUIStore, 
  type UIState, 
  type Notification 
} from './uiStore'

// User Store
export { 
  useUserStore, 
  type UserProfile, 
  type UserPreferences 
} from './userStore'
*/

// ============================================================================
// STORE CONFIGURATION & UTILITIES
// ============================================================================

// Store configuration constants
export const STORE_CONFIG = {
  PERSIST_KEY_PREFIX: 'gx-lms',
  REHYDRATION_TIMEOUT: 3000,
  DEBUG_MODE: process.env.NODE_ENV === 'development'
} as const

// Store persistence utilities
export const createPersistConfig = (name: string) => ({
  name: `${STORE_CONFIG.PERSIST_KEY_PREFIX}-${name}`,
  version: 1,
  migrate: (persistedState: any, version: number) => {
    // Add migration logic here if needed
    return persistedState
  }
})

// Store debugging utilities (development only)
export const debugStore = (storeName: string, action: string, payload?: any) => {
  if (STORE_CONFIG.DEBUG_MODE) {
    console.group(`🏪 ${storeName} Store`)
    console.log(`Action: ${action}`)
    if (payload) console.log('Payload:', payload)
    console.groupEnd()
  }
}
