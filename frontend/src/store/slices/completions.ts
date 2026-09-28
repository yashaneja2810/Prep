import { create } from 'zustand'
import { 
  TopicCompletion, 
  CpCompletion, 
  ObjectiveCompletion, 
  OutcomeCompletion,
  TOPIC_COMPLETIONS_SWR_KEY,
  CP_COMPLETIONS_SWR_KEY,
  OBJECTIVE_COMPLETIONS_SWR_KEY,
  OUTCOME_COMPLETIONS_SWR_KEY
} from '@/lib/api/completions'

// Completions state interface
interface CompletionsState {
  // Data
  topicCompletions: TopicCompletion[]
  cpCompletions: CpCompletion[]
  objectiveCompletions: ObjectiveCompletion[]
  outcomeCompletions: OutcomeCompletion[]
  
  // Loading and error states
  isLoadingTopicCompletions: boolean
  isLoadingCpCompletions: boolean
  isLoadingObjectiveCompletions: boolean
  isLoadingOutcomeCompletions: boolean
  
  topicCompletionsError: string | null
  cpCompletionsError: string | null
  objectiveCompletionsError: string | null
  outcomeCompletionsError: string | null
  
  // Selected user
  selectedUserId: string | null
  
  // Data Actions
  setTopicCompletions: (completions: TopicCompletion[]) => void
  setCpCompletions: (completions: CpCompletion[]) => void
  setObjectiveCompletions: (completions: ObjectiveCompletion[]) => void
  setOutcomeCompletions: (completions: OutcomeCompletion[]) => void
  
  addTopicCompletion: (completion: TopicCompletion) => void
  addCpCompletion: (completion: CpCompletion) => void
  addObjectiveCompletion: (completion: ObjectiveCompletion) => void
  addOutcomeCompletion: (completion: OutcomeCompletion) => void
  
  removeTopicCompletion: (topicId: string) => void
  removeCpCompletion: (cpId: string) => void
  removeObjectiveCompletion: (objectiveId: string) => void
  removeOutcomeCompletion: (outcomeId: string) => void
  
  // Loading Actions
  setLoadingTopicCompletions: (loading: boolean) => void
  setLoadingCpCompletions: (loading: boolean) => void
  setLoadingObjectiveCompletions: (loading: boolean) => void
  setLoadingOutcomeCompletions: (loading: boolean) => void
  
  // Error Actions
  setTopicCompletionsError: (error: string | null) => void
  setCpCompletionsError: (error: string | null) => void
  setObjectiveCompletionsError: (error: string | null) => void
  setOutcomeCompletionsError: (error: string | null) => void
  
  // User Actions
  setSelectedUserId: (userId: string | null) => void
  
  // Helper Functions
  isTopicCompleted: (topicId: string) => boolean
  isCpCompleted: (cpId: string) => boolean
  isObjectiveCompleted: (objectiveId: string) => boolean
  isOutcomeCompleted: (outcomeId: string) => boolean
  
  getTopicCompletion: (topicId: string) => TopicCompletion | undefined
  getCpCompletion: (cpId: string) => CpCompletion | undefined
  getObjectiveCompletion: (objectiveId: string) => ObjectiveCompletion | undefined
  getOutcomeCompletion: (outcomeId: string) => OutcomeCompletion | undefined
  
  getCompletionStats: () => {
    totalTopics: number
    completedTopics: number
    topicCompletionPercentage: number
    totalCps: number
    completedCps: number
    cpCompletionPercentage: number
    totalObjectives: number
    completedObjectives: number
    objectiveCompletionPercentage: number
    totalOutcomes: number
    completedOutcomes: number
    outcomeCompletionPercentage: number
    overallCompletionPercentage: number
  }
  
  resetState: () => void
}

export const useCompletionsStore = create<CompletionsState>((set, get) => ({
  // Initial state
  topicCompletions: [],
  cpCompletions: [],
  objectiveCompletions: [],
  outcomeCompletions: [],
  
  isLoadingTopicCompletions: false,
  isLoadingCpCompletions: false,
  isLoadingObjectiveCompletions: false,
  isLoadingOutcomeCompletions: false,
  
  topicCompletionsError: null,
  cpCompletionsError: null,
  objectiveCompletionsError: null,
  outcomeCompletionsError: null,
  
  selectedUserId: null,
  
  // Data Actions
  setTopicCompletions: (completions) => {
    console.log('🟢 [COMPLETIONS_STORE] setTopicCompletions called with', completions.length, 'completions')
    set({ topicCompletions: completions })
  },
  
  setCpCompletions: (completions) => {
    console.log('🟢 [COMPLETIONS_STORE] setCpCompletions called with', completions.length, 'completions')
    set({ cpCompletions: completions })
  },
  
  setObjectiveCompletions: (completions) => {
    console.log('🟢 [COMPLETIONS_STORE] setObjectiveCompletions called with', completions.length, 'completions')
    set({ objectiveCompletions: completions })
  },
  
  setOutcomeCompletions: (completions) => {
    console.log('🟢 [COMPLETIONS_STORE] setOutcomeCompletions called with', completions.length, 'completions')
    set({ outcomeCompletions: completions })
  },
  
  addTopicCompletion: (completion) => {
    console.log('🟢 [COMPLETIONS_STORE] addTopicCompletion called for:', completion.topic_id)
    const { topicCompletions } = get()
    const updatedCompletions = [...topicCompletions, completion]
    set({ topicCompletions: updatedCompletions })
  },
  
  addCpCompletion: (completion) => {
    console.log('🟢 [COMPLETIONS_STORE] addCpCompletion called for:', completion.cp_id)
    const { cpCompletions } = get()
    const updatedCompletions = [...cpCompletions, completion]
    set({ cpCompletions: updatedCompletions })
  },
  
  addObjectiveCompletion: (completion) => {
    console.log('🟢 [COMPLETIONS_STORE] addObjectiveCompletion called for:', completion.objective_item_id)
    const { objectiveCompletions } = get()
    const updatedCompletions = [...objectiveCompletions, completion]
    set({ objectiveCompletions: updatedCompletions })
  },
  
  addOutcomeCompletion: (completion) => {
    console.log('🟢 [COMPLETIONS_STORE] addOutcomeCompletion called for:', completion.outcome_item_id)
    const { outcomeCompletions } = get()
    const updatedCompletions = [...outcomeCompletions, completion]
    set({ outcomeCompletions: updatedCompletions })
  },
  
  removeTopicCompletion: (topicId) => {
    console.log('🟢 [COMPLETIONS_STORE] removeTopicCompletion called for:', topicId)
    const { topicCompletions } = get()
    const updatedCompletions = topicCompletions.filter(
      completion => completion.topic_id !== topicId
    )
    set({ topicCompletions: updatedCompletions })
  },
  
  removeCpCompletion: (cpId) => {
    console.log('🟢 [COMPLETIONS_STORE] removeCpCompletion called for:', cpId)
    const { cpCompletions } = get()
    const updatedCompletions = cpCompletions.filter(
      completion => completion.cp_id !== cpId
    )
    set({ cpCompletions: updatedCompletions })
  },
  
  removeObjectiveCompletion: (objectiveId) => {
    console.log('🟢 [COMPLETIONS_STORE] removeObjectiveCompletion called for:', objectiveId)
    const { objectiveCompletions } = get()
    const updatedCompletions = objectiveCompletions.filter(
      completion => completion.objective_item_id !== objectiveId
    )
    set({ objectiveCompletions: updatedCompletions })
  },
  
  removeOutcomeCompletion: (outcomeId) => {
    console.log('🟢 [COMPLETIONS_STORE] removeOutcomeCompletion called for:', outcomeId)
    const { outcomeCompletions } = get()
    const updatedCompletions = outcomeCompletions.filter(
      completion => completion.outcome_item_id !== outcomeId
    )
    set({ outcomeCompletions: updatedCompletions })
  },
  
  // Loading Actions
  setLoadingTopicCompletions: (loading) => set({ isLoadingTopicCompletions: loading }),
  setLoadingCpCompletions: (loading) => set({ isLoadingCpCompletions: loading }),
  setLoadingObjectiveCompletions: (loading) => set({ isLoadingObjectiveCompletions: loading }),
  setLoadingOutcomeCompletions: (loading) => set({ isLoadingOutcomeCompletions: loading }),
  
  // Error Actions
  setTopicCompletionsError: (error) => set({ topicCompletionsError: error }),
  setCpCompletionsError: (error) => set({ cpCompletionsError: error }),
  setObjectiveCompletionsError: (error) => set({ objectiveCompletionsError: error }),
  setOutcomeCompletionsError: (error) => set({ outcomeCompletionsError: error }),
  
  // User Actions
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),
  
  // Helper Functions
  isTopicCompleted: (topicId) => {
    const { topicCompletions } = get()
    return topicCompletions.some(completion => completion.topic_id === topicId)
  },
  
  isCpCompleted: (cpId) => {
    const { cpCompletions } = get()
    return cpCompletions.some(completion => completion.cp_id === cpId)
  },
  
  isObjectiveCompleted: (objectiveId) => {
    const { objectiveCompletions } = get()
    return objectiveCompletions.some(completion => completion.objective_item_id === objectiveId)
  },
  
  isOutcomeCompleted: (outcomeId) => {
    const { outcomeCompletions } = get()
    return outcomeCompletions.some(completion => completion.outcome_item_id === outcomeId)
  },
  
  getTopicCompletion: (topicId) => {
    const { topicCompletions } = get()
    return topicCompletions.find(completion => completion.topic_id === topicId)
  },
  
  getCpCompletion: (cpId) => {
    const { cpCompletions } = get()
    return cpCompletions.find(completion => completion.cp_id === cpId)
  },
  
  getObjectiveCompletion: (objectiveId) => {
    const { objectiveCompletions } = get()
    return objectiveCompletions.find(completion => completion.objective_item_id === objectiveId)
  },
  
  getOutcomeCompletion: (outcomeId) => {
    const { outcomeCompletions } = get()
    return outcomeCompletions.find(completion => completion.outcome_item_id === outcomeId)
  },
  
  getCompletionStats: () => {
    const { 
      topicCompletions, 
      cpCompletions, 
      objectiveCompletions, 
      outcomeCompletions 
    } = get()
    
    // These would typically come from course data, but for now we'll just use the completions
    const totalTopics = 0 // This should come from course data
    const totalCps = 0 // This should come from course data
    const totalObjectives = 0 // This should come from course data
    const totalOutcomes = 0 // This should come from course data
    
    const completedTopics = topicCompletions.length
    const completedCps = cpCompletions.length
    const completedObjectives = objectiveCompletions.length
    const completedOutcomes = outcomeCompletions.length
    
    const calculatePercentage = (completed: number, total: number) => {
      if (total === 0) return 0
      return Math.round((completed / total) * 100)
    }
    
    const topicCompletionPercentage = calculatePercentage(completedTopics, totalTopics)
    const cpCompletionPercentage = calculatePercentage(completedCps, totalCps)
    const objectiveCompletionPercentage = calculatePercentage(completedObjectives, totalObjectives)
    const outcomeCompletionPercentage = calculatePercentage(completedOutcomes, totalOutcomes)
    
    const totalItems = totalTopics + totalCps + totalObjectives + totalOutcomes
    const completedItems = completedTopics + completedCps + completedObjectives + completedOutcomes
    const overallCompletionPercentage = calculatePercentage(completedItems, totalItems)
    
    return {
      totalTopics,
      completedTopics,
      topicCompletionPercentage,
      totalCps,
      completedCps,
      cpCompletionPercentage,
      totalObjectives,
      completedObjectives,
      objectiveCompletionPercentage,
      totalOutcomes,
      completedOutcomes,
      outcomeCompletionPercentage,
      overallCompletionPercentage,
    }
  },
  
  resetState: () => {
    set({
      topicCompletions: [],
      cpCompletions: [],
      objectiveCompletions: [],
      outcomeCompletions: [],
      isLoadingTopicCompletions: false,
      isLoadingCpCompletions: false,
      isLoadingObjectiveCompletions: false,
      isLoadingOutcomeCompletions: false,
      topicCompletionsError: null,
      cpCompletionsError: null,
      objectiveCompletionsError: null,
      outcomeCompletionsError: null,
      selectedUserId: null,
    })
  }
}))

// Selector hooks for easier access to specific parts of the store
export const useTopicCompletions = () => useCompletionsStore(state => state.topicCompletions)
export const useCpCompletions = () => useCompletionsStore(state => state.cpCompletions)
export const useObjectiveCompletions = () => useCompletionsStore(state => state.objectiveCompletions)
export const useOutcomeCompletions = () => useCompletionsStore(state => state.outcomeCompletions)

export const useTopicCompletionsLoading = () => useCompletionsStore(state => state.isLoadingTopicCompletions)
export const useCpCompletionsLoading = () => useCompletionsStore(state => state.isLoadingCpCompletions)
export const useObjectiveCompletionsLoading = () => useCompletionsStore(state => state.isLoadingObjectiveCompletions)
export const useOutcomeCompletionsLoading = () => useCompletionsStore(state => state.isLoadingOutcomeCompletions)

export const useTopicCompletionsError = () => useCompletionsStore(state => state.topicCompletionsError)
export const useCpCompletionsError = () => useCompletionsStore(state => state.cpCompletionsError)
export const useObjectiveCompletionsError = () => useCompletionsStore(state => state.objectiveCompletionsError)
export const useOutcomeCompletionsError = () => useCompletionsStore(state => state.outcomeCompletionsError)

export const useSelectedUserId = () => useCompletionsStore(state => state.selectedUserId)
export const useCompletionStats = () => useCompletionsStore(state => state.getCompletionStats()) 