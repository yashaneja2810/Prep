import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import { 
  // API functions
  getAllCohortSessions,
  getCohortSessionById,
  createCohortSession,
  updateCohortSession,
  deleteCohortSession,
  getCohortSessions,
  getTrainerSessions,
  getSessionAttendance,
  recordSessionAttendance,
  getSessionSummary,
  updateSessionSummary,
  getSessionLearnerNotes,
  getUserSessionNotes,
  addLearnerNotes,
  updateLearnerNotes,
  getSessionResources,
  addSessionResource,
  deleteSessionResource,
  
  // SWR keys
  COHORT_SESSIONS_SWR_KEY,
  COHORT_SESSION_BY_ID_SWR_KEY,
  COHORT_SESSIONS_BY_COHORT_ID_SWR_KEY,
  SESSIONS_BY_TRAINER_ID_SWR_KEY,
  SESSION_ATTENDANCE_SWR_KEY,
  SESSION_SUMMARY_SWR_KEY,
  SESSION_LEARNER_NOTES_SWR_KEY,
  USER_SESSION_NOTES_SWR_KEY,
  SESSION_RESOURCES_SWR_KEY,
  
  // Types
  CohortSession,
  SessionAttendance,
  SessionSummary,
  LearnerNotes,
  SessionResource,
  CreateSessionDto,
  UpdateSessionDto,
  SessionAttendanceDto,
  SessionSummaryDto,
  LearnerNotesDto,
  UpdateLearnerNotesDto,
  SessionResourceDto
} from '@/lib/api/cohort-sessions'

import { useCohortSessionsStore } from '@/store/slices/cohort-sessions'
import { handleError } from '@/helpers/helpers'

/**
 * Hook for fetching all cohort sessions with optional filters
 */
export const useAllCohortSessions = (filters?: {
  cohortId?: string;
  trainerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const store = useCohortSessionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    COHORT_SESSIONS_SWR_KEY,
    () => getAllCohortSessions(filters),
    {
      onSuccess: (data) => {
        console.log('🟢 [useAllCohortSessions] SWR success, setting sessions in store')
        store.setCohortSessions(data || [])
        store.setLoadingCohortSessions(false)
        store.setCohortSessionsError(null)
      },
      onError: (error) => {
        console.error('🔴 [useAllCohortSessions] SWR error:', error)
        let errorMessage = 'Failed to load cohort sessions'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setCohortSessionsError(errorMessage)
        store.setLoadingCohortSessions(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state
  useEffect(() => {
    if (isLoading !== store.isLoadingCohortSessions) {
      store.setLoadingCohortSessions(isLoading)
    }
  }, [isLoading, store.isLoadingCohortSessions, store.setLoadingCohortSessions])

  // Update filter selections in store if provided
  useEffect(() => {
    if (filters?.cohortId && filters.cohortId !== store.selectedCohortId) {
      store.setSelectedCohortId(filters.cohortId)
    }
    if (filters?.trainerId && filters.trainerId !== store.selectedTrainerId) {
      store.setSelectedTrainerId(filters.trainerId)
    }
  }, [filters?.cohortId, filters?.trainerId, store])

  return {
    cohortSessions: data || [],
    isLoading,
    error: error ? 'Failed to load cohort sessions' : null,
    mutate,
    // Store helper functions
    getSessionById: store.getSessionById,
    getSessionsByTrainerId: store.getSessionsByTrainerId,
    getSessionsByCohortId: store.getSessionsByCohortId,
  }
}

/**
 * Hook for fetching sessions for a specific cohort
 */
export const useCohortSessions = (cohortId: string) => {
  const { setCohortSessionsError } = useCohortSessionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    cohortId ? COHORT_SESSIONS_BY_COHORT_ID_SWR_KEY(cohortId) : null,
    async () => {
      try {
        return await getCohortSessions(cohortId)
      } catch (err) {
        const errorMessage = handleError(err)
        setCohortSessionsError(errorMessage)
        throw err
      }
    }
  )
  
  return {
    cohortSessions: data || [],
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook for fetching sessions for a specific trainer
 */
export const useTrainerSessions = (trainerId: string | null, filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const store = useCohortSessionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    trainerId ? SESSIONS_BY_TRAINER_ID_SWR_KEY(trainerId) : null,
    trainerId ? () => getTrainerSessions(trainerId, filters) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useTrainerSessions] SWR success, setting sessions in store')
        store.setCohortSessions(data || [])
        store.setLoadingCohortSessions(false)
        store.setCohortSessionsError(null)
      },
      onError: (error) => {
        console.error('🔴 [useTrainerSessions] SWR error:', error)
        let errorMessage = 'Failed to load trainer sessions'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setCohortSessionsError(errorMessage)
        store.setLoadingCohortSessions(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state
  useEffect(() => {
    if (isLoading !== store.isLoadingCohortSessions) {
      store.setLoadingCohortSessions(isLoading)
    }
  }, [isLoading, store.isLoadingCohortSessions, store.setLoadingCohortSessions])

  // Update selected trainer ID in store
  useEffect(() => {
    if (trainerId && trainerId !== store.selectedTrainerId) {
      store.setSelectedTrainerId(trainerId)
    }
  }, [trainerId, store.selectedTrainerId, store.setSelectedTrainerId])

  return {
    trainerSessions: data || [],
    isLoading,
    error: error ? 'Failed to load trainer sessions' : null,
    mutate,
  }
}

/**
 * Hook for fetching a single session by ID
 */
export const useCohortSession = (sessionId: string | null) => {
  const { setCohortSessionsError } = useCohortSessionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    sessionId ? COHORT_SESSION_BY_ID_SWR_KEY(sessionId) : null,
    async () => {
      try {
        return await getCohortSessionById(sessionId!)
      } catch (err) {
        const errorMessage = handleError(err)
        setCohortSessionsError(errorMessage)
        throw err
      }
    }
  )
  
  return {
    session: data,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook for fetching session attendance
 */
export const useSessionAttendance = (sessionId: string | null) => {
  const { setSessionAttendanceError } = useCohortSessionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    sessionId ? SESSION_ATTENDANCE_SWR_KEY(sessionId) : null,
    async () => {
      try {
        return await getSessionAttendance(sessionId!)
      } catch (err) {
        const errorMessage = handleError(err)
        setSessionAttendanceError(errorMessage)
        throw err
      }
    }
  )
  
  return {
    attendance: data,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook for fetching session summary
 */
export const useSessionSummary = (sessionId: string | null) => {
  const { setSessionSummaryError } = useCohortSessionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    sessionId ? SESSION_SUMMARY_SWR_KEY(sessionId) : null,
    async () => {
      try {
        return await getSessionSummary(sessionId!)
      } catch (err) {
        const errorMessage = handleError(err)
        setSessionSummaryError(errorMessage)
        throw err
      }
    }
  )
  
  return {
    summary: data,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook for fetching session learner notes
 */
export const useSessionLearnerNotes = (sessionId: string | null) => {
  const store = useCohortSessionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    sessionId ? SESSION_LEARNER_NOTES_SWR_KEY(sessionId) : null,
    sessionId ? () => getSessionLearnerNotes(sessionId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useSessionLearnerNotes] SWR success, setting learner notes in store')
        store.setLearnerNotes(data || [])
        store.setLoadingLearnerNotes(false)
        store.setLearnerNotesError(null)
      },
      onError: (error) => {
        console.error('🔴 [useSessionLearnerNotes] SWR error:', error)
        let errorMessage = `Failed to load learner notes for session ${sessionId}`
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setLearnerNotesError(errorMessage)
        store.setLoadingLearnerNotes(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state
  useEffect(() => {
    if (isLoading !== store.isLoadingLearnerNotes) {
      store.setLoadingLearnerNotes(isLoading)
    }
  }, [isLoading, store.isLoadingLearnerNotes, store.setLoadingLearnerNotes])

  // Update selected session ID in store
  useEffect(() => {
    if (sessionId && sessionId !== store.selectedSessionId) {
      store.setSelectedSessionId(sessionId)
    }
  }, [sessionId, store.selectedSessionId, store.setSelectedSessionId])

  return {
    learnerNotes: data || [],
    isLoading,
    error: error ? `Failed to load learner notes for session ${sessionId}` : null,
    mutate,
    getLearnerNoteByUserId: store.getLearnerNoteByUserId,
  }
}

/**
 * Hook for fetching user's session notes
 */
export const useUserSessionNotes = (sessionId: string | null, userId: string | null) => {
  const store = useCohortSessionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    sessionId && userId ? USER_SESSION_NOTES_SWR_KEY(sessionId, userId) : null,
    sessionId && userId ? () => getUserSessionNotes(sessionId, userId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useUserSessionNotes] SWR success, updating learner note in store')
        if (data) {
          // Check if we already have this note in our store
          const existingNote = store.getLearnerNoteByUserId(data.user_id)
          
          if (existingNote) {
            // Update existing note
            store.updateLearnerNote(data.user_id, data)
          } else {
            // Add new note to store
            store.addLearnerNote(data)
          }
        }
        store.setLoadingLearnerNotes(false)
        store.setLearnerNotesError(null)
      },
      onError: (error) => {
        console.error('🔴 [useUserSessionNotes] SWR error:', error)
        let errorMessage = `Failed to load user notes for session ${sessionId}`
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setLearnerNotesError(errorMessage)
        store.setLoadingLearnerNotes(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state
  useEffect(() => {
    if (isLoading !== store.isLoadingLearnerNotes) {
      store.setLoadingLearnerNotes(isLoading)
    }
  }, [isLoading, store.isLoadingLearnerNotes, store.setLoadingLearnerNotes])

  // Update selected session ID in store
  useEffect(() => {
    if (sessionId && sessionId !== store.selectedSessionId) {
      store.setSelectedSessionId(sessionId)
    }
  }, [sessionId, store.selectedSessionId, store.setSelectedSessionId])

  return {
    userNote: data,
    isLoading,
    error: error ? `Failed to load user notes for session ${sessionId}` : null,
    mutate,
  }
}

/**
 * Hook for fetching session resources
 */
export const useSessionResources = (sessionId: string | null) => {
  const store = useCohortSessionsStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    sessionId ? SESSION_RESOURCES_SWR_KEY(sessionId) : null,
    sessionId ? () => getSessionResources(sessionId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useSessionResources] SWR success, setting resources in store')
        store.setSessionResources(data || [])
        store.setLoadingSessionResources(false)
        store.setSessionResourcesError(null)
      },
      onError: (error) => {
        console.error('🔴 [useSessionResources] SWR error:', error)
        let errorMessage = `Failed to load resources for session ${sessionId}`
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setSessionResourcesError(errorMessage)
        store.setLoadingSessionResources(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state
  useEffect(() => {
    if (isLoading !== store.isLoadingSessionResources) {
      store.setLoadingSessionResources(isLoading)
    }
  }, [isLoading, store.isLoadingSessionResources, store.setLoadingSessionResources])

  // Update selected session ID in store
  useEffect(() => {
    if (sessionId && sessionId !== store.selectedSessionId) {
      store.setSelectedSessionId(sessionId)
    }
  }, [sessionId, store.selectedSessionId, store.setSelectedSessionId])

  return {
    resources: data || [],
    isLoading,
    error: error ? `Failed to load resources for session ${sessionId}` : null,
    mutate,
  }
}

/**
 * Hook for session mutations (create, update, delete)
 */
export const useCohortSessionMutations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { 
    setCohortSessionsError, 
    setSessionSummaryError, 
    setSessionAttendanceError,
    setSessionResourcesError
  } = useCohortSessionsStore()
  
  // Create a new session
  const createSession = useCallback(async (data: CreateSessionDto) => {
    setIsSubmitting(true)
    try {
      const result = await createCohortSession(data)
      return result
    } catch (err) {
      handleError(err)
      setCohortSessionsError('Failed to create session. Please try again.')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [setCohortSessionsError])
  
  // Update an existing session
  const updateSession = useCallback(async (sessionId: string, data: UpdateSessionDto) => {
    setIsSubmitting(true)
    try {
      const result = await updateCohortSession(sessionId, data)
      return result
    } catch (err) {
      handleError(err)
      setCohortSessionsError('Failed to update session. Please try again.')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [setCohortSessionsError])
  
  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    setIsSubmitting(true)
    try {
      await deleteCohortSession(sessionId)
      return true
    } catch (err) {
      handleError(err)
      setCohortSessionsError('Failed to delete session. Please try again.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [setCohortSessionsError])
  
  // Update session summary
  const updateSummary = useCallback(async (sessionId: string, data: SessionSummaryDto) => {
    setIsSubmitting(true)
    try {
      const result = await updateSessionSummary(sessionId, data)
      return result
    } catch (err) {
      handleError(err)
      setSessionSummaryError('Failed to update session summary. Please try again.')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [setSessionSummaryError])
  
  // Record session attendance
  const recordAttendance = useCallback(async (sessionId: string, data: SessionAttendanceDto) => {
    setIsSubmitting(true)
    try {
      const result = await recordSessionAttendance(sessionId, data)
      return result
    } catch (err) {
      handleError(err)
      setSessionAttendanceError('Failed to record attendance. Please try again.')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [setSessionAttendanceError])
  
  // Add session resource
  const addResource = useCallback(async (sessionId: string, data: SessionResourceDto) => {
    setIsSubmitting(true)
    try {
      const result = await addSessionResource(sessionId, data)
      return result
    } catch (err) {
      handleError(err)
      setSessionResourcesError('Failed to add resource. Please try again.')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [setSessionResourcesError])
  
  // Remove session resource
  const removeResource = useCallback(async (sessionId: string, resourceId: string) => {
    setIsSubmitting(true)
    try {
      const success = await deleteSessionResource(sessionId, resourceId)
      return success
    } catch (err) {
      handleError(err)
      setSessionResourcesError('Failed to remove resource. Please try again.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [setSessionResourcesError])
  
  return {
    createSession,
    updateSession,
    deleteSession,
    updateSummary,
    recordAttendance,
    addResource,
    removeResource,
    isSubmitting
  }
} 