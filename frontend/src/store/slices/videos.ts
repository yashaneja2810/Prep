import { create } from 'zustand'
import { Video } from '@/lib/api/videos'

// Form modes for Video management
export type FormMode = 'create' | 'edit' | 'view'

interface VideosState {
  // Data
  videos: Video[]
  filteredVideos: Video[]
  selectedVideo: Video | null
  
  // Filters
  searchTerm: string
  activeTab: string
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingVideoId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setVideos: (videos: Video[]) => void
  addVideo: (video: Video) => void
  updateVideo: (videoId: string, updates: Partial<Video>) => void
  removeVideo: (videoId: string) => void
  setSelectedVideo: (video: Video | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setActiveTab: (tab: string) => void
  filterVideos: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingVideoId: (videoId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getVideoById: (videoId: string) => Video | null
  getVideosByTopic: (topicId: string) => Video[]
}

export const useVideosStore = create<VideosState>((set, get) => ({
  // Initial state
  videos: [],
  filteredVideos: [],
  selectedVideo: null,
  searchTerm: "",
  activeTab: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingVideoId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setVideos: (videos) => {
    // Ensure videos is always an array
    const safeVideos = Array.isArray(videos) ? videos : []
    console.log('🟢 [VIDEO_STORE] setVideos called with', safeVideos.length, 'videos')
    const currentVideos = get().videos
    
    // Only update if data actually changed
    if (JSON.stringify(currentVideos) !== JSON.stringify(safeVideos)) {
      console.log('🟢 [VIDEO_STORE] Videos data changed, updating state')
      set({ videos: safeVideos })
      // Use setTimeout to prevent cascading updates
      setTimeout(() => {
        console.log('🟢 [VIDEO_STORE] Applying filters after state update')
        get().filterVideos()
      }, 0)
    } else {
      console.log('🟢 [VIDEO_STORE] Videos data unchanged, skipping update')
    }
  },

  addVideo: (video) => {
    console.log('🟢 [VIDEO_STORE] addVideo called for:', video.id)
    const { videos } = get()
    const safeVideos = Array.isArray(videos) ? videos : []
    const updatedVideos = [video, ...safeVideos]
    set({ videos: updatedVideos })
    get().filterVideos()
  },

  updateVideo: (videoId, updates) => {
    console.log('🟢 [VIDEO_STORE] updateVideo called for:', videoId)
    const { videos } = get()
    const safeVideos = Array.isArray(videos) ? videos : []
    const updatedVideos = safeVideos.map(video =>
      video.id === videoId ? { ...video, ...updates } : video
    )
    set({ videos: updatedVideos })
    get().filterVideos()
    
    // Update selected video if it's the one being updated
    const { selectedVideo } = get()
    if (selectedVideo && selectedVideo.id === videoId) {
      set({ selectedVideo: { ...selectedVideo, ...updates } })
    }
  },

  removeVideo: (videoId) => {
    console.log('🟢 [VIDEO_STORE] removeVideo called for:', videoId)
    const { videos, selectedVideo } = get()
    const safeVideos = Array.isArray(videos) ? videos : []
    const updatedVideos = safeVideos.filter(video => video.id !== videoId)
    set({ videos: updatedVideos })
    
    // Use setTimeout to prevent cascading updates
    setTimeout(() => {
      console.log('🟢 [VIDEO_STORE] Applying filters after video removal')
      get().filterVideos()
    }, 0)
    
    // Clear selected video if it's the one being removed
    if (selectedVideo && selectedVideo.id === videoId) {
      set({ selectedVideo: null })
    }
    
    // Clear editing video if it's the one being removed
    const { editingVideoId } = get()
    if (editingVideoId === videoId) {
      set({ editingVideoId: null })
    }
  },

  setSelectedVideo: (selectedVideo) => set({ selectedVideo }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterVideos()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterVideos()
  },

  filterVideos: () => {
    const { 
      videos, 
      searchTerm, 
      activeTab 
    } = get()
    
    console.log('🟢 [VIDEO_STORE] Filtering videos with filters:', {
      searchTerm,
      activeTab,
      total: videos.length
    })
    
    let filtered = Array.isArray(videos) ? [...videos] : []
    
    // Filter by tab (topic_id)
    if (activeTab !== "all") {
      const topicId = activeTab
      filtered = filtered.filter(video => video.topic_id === topicId)
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(video => 
        (video.title && video.title.toLowerCase().includes(searchLower)) ||
        (video.transcript && video.transcript.toLowerCase().includes(searchLower)) ||
        (video.summary && video.summary.toLowerCase().includes(searchLower))
      )
    }
    
    set({ filteredVideos: filtered })
  },

  resetFilters: () => {
    set({ 
      searchTerm: "",
      activeTab: "all"
    })
    get().filterVideos()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),
  
  toggleForm: (isFormOpen) => set({ isFormOpen }),
  
  setFormErrors: (formErrors) => set({ formErrors }),
  
  clearFormErrors: () => set({ formErrors: {} }),
  
  setEditingVideoId: (editingVideoId) => set({ editingVideoId }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  // Helper Functions
  getVideoById: (videoId) => {
    const { videos } = get()
    const safeVideos = Array.isArray(videos) ? videos : []
    return safeVideos.find(video => video.id === videoId) || null
  },
  
  getVideosByTopic: (topicId) => {
    const { videos } = get()
    const safeVideos = Array.isArray(videos) ? videos : []
    return safeVideos.filter(video => video.topic_id === topicId)
  }
}))

// Export selectors for common use cases
export const useFilteredVideos = () => useVideosStore(state => state.filteredVideos)
export const useVideosLoading = () => useVideosStore(state => state.isLoading)
export const useVideosError = () => useVideosStore(state => state.error)
export const useSelectedVideo = () => useVideosStore(state => state.selectedVideo)
export const useVideosFormState = () => useVideosStore(state => ({
  formMode: state.formMode,
  isFormOpen: state.isFormOpen,
  formErrors: state.formErrors,
  isSubmitting: state.isSubmitting,
  editingVideoId: state.editingVideoId,
  setFormMode: state.setFormMode,
  toggleForm: state.toggleForm,
  setFormErrors: state.setFormErrors,
  clearFormErrors: state.clearFormErrors,
  setEditingVideoId: state.setEditingVideoId,
  setSubmitting: state.setSubmitting
})) 