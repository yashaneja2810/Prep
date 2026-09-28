import { create } from 'zustand'
import { 
  CohortSession, 
  SessionAttendance, 
  SessionSummary,
  LearnerNotes,
  SessionResource
} from '@/lib/api/cohort-sessions'

// Cohort Sessions state interface
interface CohortSessionsState {
  // Data
  cohortSessions: CohortSession[]
  sessionAttendance: SessionAttendance[]
  sessionSummary: SessionSummary | null
  learnerNotes: LearnerNotes[]
  sessionResources: SessionResource[]
  
  // Loading and error states
  isLoadingCohortSessions: boolean
  isLoadingSessionAttendance: boolean
  isLoadingSessionSummary: boolean
  isLoadingLearnerNotes: boolean
  isLoadingSessionResources: boolean
  
  cohortSessionsError: string | null
  sessionAttendanceError: string | null
  sessionSummaryError: string | null
  learnerNotesError: string | null
  sessionResourcesError: string | null
  
  // Selected IDs
  selectedCohortId: string | null
  selectedSessionId: string | null
  selectedTrainerId: string | null
  
  // Data Actions
  setCohortSessions: (sessions: CohortSession[]) => void
  setSessionAttendance: (attendance: SessionAttendance[]) => void
  setSessionSummary: (summary: SessionSummary | null) => void
  setLearnerNotes: (notes: LearnerNotes[]) => void
  setSessionResources: (resources: SessionResource[]) => void
  
  addCohortSession: (session: CohortSession) => void
  updateCohortSession: (sessionId: string, updatedSession: CohortSession) => void
  removeCohortSession: (sessionId: string) => void
  
  addSessionAttendance: (attendance: SessionAttendance) => void
  updateSessionAttendance: (attendanceId: string, updatedAttendance: SessionAttendance) => void
  
  addLearnerNote: (note: LearnerNotes) => void
  updateLearnerNote: (userId: string, updatedNote: LearnerNotes) => void
  
  addSessionResource: (resource: SessionResource) => void
  removeSessionResource: (resourceId: string) => void
  
  // Loading Actions
  setLoadingCohortSessions: (loading: boolean) => void
  setLoadingSessionAttendance: (loading: boolean) => void
  setLoadingSessionSummary: (loading: boolean) => void
  setLoadingLearnerNotes: (loading: boolean) => void
  setLoadingSessionResources: (loading: boolean) => void
  
  // Error Actions
  setCohortSessionsError: (error: string | null) => void
  setSessionAttendanceError: (error: string | null) => void
  setSessionSummaryError: (error: string | null) => void
  setLearnerNotesError: (error: string | null) => void
  setSessionResourcesError: (error: string | null) => void
  
  // Filter & Selection Actions
  setSelectedCohortId: (cohortId: string | null) => void
  setSelectedSessionId: (sessionId: string | null) => void
  setSelectedTrainerId: (trainerId: string | null) => void
  
  // Helper Functions
  getSessionById: (sessionId: string) => CohortSession | undefined
  getSessionsByTrainerId: (trainerId: string) => CohortSession[]
  getSessionsByCohortId: (cohortId: string) => CohortSession[]
  getLearnerNoteByUserId: (userId: string) => LearnerNotes | undefined
  
  resetState: () => void
}

export const useCohortSessionsStore = create<CohortSessionsState>((set, get) => ({
  // Initial state
  cohortSessions: [],
  sessionAttendance: [],
  sessionSummary: null,
  learnerNotes: [],
  sessionResources: [],
  
  isLoadingCohortSessions: false,
  isLoadingSessionAttendance: false,
  isLoadingSessionSummary: false,
  isLoadingLearnerNotes: false,
  isLoadingSessionResources: false,
  
  cohortSessionsError: null,
  sessionAttendanceError: null,
  sessionSummaryError: null,
  learnerNotesError: null,
  sessionResourcesError: null,
  
  selectedCohortId: null,
  selectedSessionId: null,
  selectedTrainerId: null,
  
  // Data Actions
  setCohortSessions: (sessions) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] setCohortSessions called with', sessions.length, 'sessions')
    set({ cohortSessions: sessions })
  },
  
  setSessionAttendance: (attendance) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] setSessionAttendance called with', attendance.length, 'attendance records')
    set({ sessionAttendance: attendance })
  },
  
  setSessionSummary: (summary) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] setSessionSummary called')
    set({ sessionSummary: summary })
  },
  
  setLearnerNotes: (notes) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] setLearnerNotes called with', notes.length, 'notes')
    set({ learnerNotes: notes })
  },
  
  setSessionResources: (resources) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] setSessionResources called with', resources.length, 'resources')
    set({ sessionResources: resources })
  },
  
  addCohortSession: (session) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] addCohortSession called for:', session.id)
    const { cohortSessions } = get()
    const updatedSessions = [...cohortSessions, session]
    set({ cohortSessions: updatedSessions })
  },
  
  updateCohortSession: (sessionId, updatedSession) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] updateCohortSession called for:', sessionId)
    const { cohortSessions } = get()
    const updatedSessions = cohortSessions.map(session => 
      session.id === sessionId ? updatedSession : session
    )
    set({ cohortSessions: updatedSessions })
  },
  
  removeCohortSession: (sessionId) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] removeCohortSession called for:', sessionId)
    const { cohortSessions } = get()
    const updatedSessions = cohortSessions.filter(session => session.id !== sessionId)
    set({ cohortSessions: updatedSessions })
  },
  
  addSessionAttendance: (attendance) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] addSessionAttendance called for:', attendance.id)
    const { sessionAttendance } = get()
    const updatedAttendance = [...sessionAttendance, attendance]
    set({ sessionAttendance: updatedAttendance })
  },
  
  updateSessionAttendance: (attendanceId, updatedAttendance) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] updateSessionAttendance called for:', attendanceId)
    const { sessionAttendance } = get()
    const updatedAttendanceRecords = sessionAttendance.map(record => 
      record.id === attendanceId ? updatedAttendance : record
    )
    set({ sessionAttendance: updatedAttendanceRecords })
  },
  
  addLearnerNote: (note) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] addLearnerNote called for user:', note.user_id)
    const { learnerNotes } = get()
    const updatedNotes = [...learnerNotes, note]
    set({ learnerNotes: updatedNotes })
  },
  
  updateLearnerNote: (userId, updatedNote) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] updateLearnerNote called for user:', userId)
    const { learnerNotes } = get()
    const updatedNotesList = learnerNotes.map(note => 
      note.user_id === userId ? updatedNote : note
    )
    set({ learnerNotes: updatedNotesList })
  },
  
  addSessionResource: (resource) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] addSessionResource called for:', resource.id)
    const { sessionResources } = get()
    const updatedResources = [...sessionResources, resource]
    set({ sessionResources: updatedResources })
  },
  
  removeSessionResource: (resourceId) => {
    console.log('🟢 [COHORT_SESSIONS_STORE] removeSessionResource called for:', resourceId)
    const { sessionResources } = get()
    const updatedResources = sessionResources.filter(resource => resource.id !== resourceId)
    set({ sessionResources: updatedResources })
  },
  
  // Loading Actions
  setLoadingCohortSessions: (loading) => set({ isLoadingCohortSessions: loading }),
  setLoadingSessionAttendance: (loading) => set({ isLoadingSessionAttendance: loading }),
  setLoadingSessionSummary: (loading) => set({ isLoadingSessionSummary: loading }),
  setLoadingLearnerNotes: (loading) => set({ isLoadingLearnerNotes: loading }),
  setLoadingSessionResources: (loading) => set({ isLoadingSessionResources: loading }),
  
  // Error Actions
  setCohortSessionsError: (error) => set({ cohortSessionsError: error }),
  setSessionAttendanceError: (error) => set({ sessionAttendanceError: error }),
  setSessionSummaryError: (error) => set({ sessionSummaryError: error }),
  setLearnerNotesError: (error) => set({ learnerNotesError: error }),
  setSessionResourcesError: (error) => set({ sessionResourcesError: error }),
  
  // Selection Actions
  setSelectedCohortId: (cohortId) => set({ selectedCohortId: cohortId }),
  setSelectedSessionId: (sessionId) => set({ selectedSessionId: sessionId }),
  setSelectedTrainerId: (trainerId) => set({ selectedTrainerId: trainerId }),
  
  // Helper Functions
  getSessionById: (sessionId) => {
    const { cohortSessions } = get()
    return cohortSessions.find(session => session.id === sessionId)
  },
  
  getSessionsByTrainerId: (trainerId) => {
    const { cohortSessions } = get()
    return cohortSessions.filter(session => session.trainer_id === trainerId)
  },
  
  getSessionsByCohortId: (cohortId) => {
    const { cohortSessions } = get()
    return cohortSessions.filter(session => session.cohort_id === cohortId)
  },
  
  getLearnerNoteByUserId: (userId) => {
    const { learnerNotes } = get()
    return learnerNotes.find(note => note.user_id === userId)
  },
  
  resetState: () => {
    set({
      cohortSessions: [],
      sessionAttendance: [],
      sessionSummary: null,
      learnerNotes: [],
      sessionResources: [],
      
      isLoadingCohortSessions: false,
      isLoadingSessionAttendance: false,
      isLoadingSessionSummary: false,
      isLoadingLearnerNotes: false,
      isLoadingSessionResources: false,
      
      cohortSessionsError: null,
      sessionAttendanceError: null,
      sessionSummaryError: null,
      learnerNotesError: null,
      sessionResourcesError: null,
      
      selectedCohortId: null,
      selectedSessionId: null,
      selectedTrainerId: null
    })
  }
}))

// Selector hooks for easier access to specific parts of the state
export const useCohortSessions = () => useCohortSessionsStore(state => state.cohortSessions)
export const useSessionAttendance = () => useCohortSessionsStore(state => state.sessionAttendance)
export const useSessionSummary = () => useCohortSessionsStore(state => state.sessionSummary)
export const useLearnerNotes = () => useCohortSessionsStore(state => state.learnerNotes)
export const useSessionResources = () => useCohortSessionsStore(state => state.sessionResources)

export const useCohortSessionsLoading = () => useCohortSessionsStore(state => state.isLoadingCohortSessions)
export const useSessionAttendanceLoading = () => useCohortSessionsStore(state => state.isLoadingSessionAttendance)
export const useSessionSummaryLoading = () => useCohortSessionsStore(state => state.isLoadingSessionSummary)
export const useLearnerNotesLoading = () => useCohortSessionsStore(state => state.isLoadingLearnerNotes)
export const useSessionResourcesLoading = () => useCohortSessionsStore(state => state.isLoadingSessionResources)

export const useCohortSessionsError = () => useCohortSessionsStore(state => state.cohortSessionsError)
export const useSessionAttendanceError = () => useCohortSessionsStore(state => state.sessionAttendanceError)
export const useSessionSummaryError = () => useCohortSessionsStore(state => state.sessionSummaryError)
export const useLearnerNotesError = () => useCohortSessionsStore(state => state.learnerNotesError)
export const useSessionResourcesError = () => useCohortSessionsStore(state => state.sessionResourcesError)

export const useSelectedCohortId = () => useCohortSessionsStore(state => state.selectedCohortId)
export const useSelectedSessionId = () => useCohortSessionsStore(state => state.selectedSessionId)
export const useSelectedTrainerId = () => useCohortSessionsStore(state => state.selectedTrainerId) 