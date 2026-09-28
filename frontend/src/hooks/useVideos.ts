import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  getAllVideos,
  getVideosByTopicId,
  getVideoById,
  createVideo,
  updateVideoById,
  deleteVideoById,
  VIDEOS_SWR_KEY,
  VIDEOS_BY_TOPIC_SWR_KEY,
  VIDEO_BY_ID_SWR_KEY,
  Video,
  UpdateVideoDto
} from '@/lib/api/videos'
import { useVideosStore } from '@/store/slices/videos'
import { handleError } from '@/helpers/helpers'
import { API_MESSAGES } from '@/helpers/string_const'

// Type for the Videos hook return
interface UseVideosReturn {
  videos: Video[]
  isLoading: boolean
  error: string | null
  mutate: () => Promise<Video[] | undefined>
  // Store state
  filteredVideos: Video[]
  selectedVideo: Video | null
  searchTerm: string
  activeTab: string
  // Store actions
  setSearchTerm: (term: string) => void
  setActiveTab: (tab: string) => void
  filterVideos: () => void
  resetFilters: () => void
  setVideos: (videos: Video[]) => void
  addVideo: (video: Video) => void
  updateVideo: (videoId: string, updates: Partial<Video>) => void
  removeVideo: (videoId: string) => void
  setSelectedVideo: (video: Video | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Simple Videos hook for basic listing
export const useVideos = (): UseVideosReturn => {
  const store = useVideosStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    VIDEOS_SWR_KEY,
    getAllVideos,
    {
      onSuccess: (data) => {
        console.log('🟢 [useVideos] SWR success, setting videos in store')
        store.setVideos(data || [])
        store.setLoading(false)
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useVideos] SWR error:', error)
        // Don't show toast here as handleError already shows it
        // Just extract the message for the store
        let errorMessage = 'Failed to load videos'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
        store.setLoading(false)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  // Update store loading state using useEffect to avoid setState during render
  useEffect(() => {
    if (isLoading !== store.isLoading) {
      store.setLoading(isLoading)
    }
  }, [isLoading, store.isLoading, store.setLoading])

  return {
    videos: data || [],
    isLoading,
    error: error ? 'Failed to load videos' : null,
    mutate,
    // Store state
    filteredVideos: store.filteredVideos,
    selectedVideo: store.selectedVideo,
    searchTerm: store.searchTerm,
    activeTab: store.activeTab,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    setActiveTab: store.setActiveTab,
    filterVideos: store.filterVideos,
    resetFilters: store.resetFilters,
    setVideos: store.setVideos,
    addVideo: store.addVideo,
    updateVideo: store.updateVideo,
    removeVideo: store.removeVideo,
    setSelectedVideo: store.setSelectedVideo,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

// Type for Videos by topic hook return
interface UseVideosByTopicReturn {
  videos: Video[]
  isLoading: boolean
  error: string | null
  mutate: () => Promise<Video[] | undefined>
  // Store state
  filteredVideos: Video[]
  selectedVideo: Video | null
  searchTerm: string
  // Store actions
  setSearchTerm: (term: string) => void
  filterVideos: () => void
  resetFilters: () => void
}

// Videos by topic hook
export const useVideosByTopic = (topicId: string | null): UseVideosByTopicReturn => {
  const store = useVideosStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    topicId ? VIDEOS_BY_TOPIC_SWR_KEY(topicId) : null,
    topicId ? () => getVideosByTopicId(topicId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useVideosByTopic] SWR success for topic:', topicId)
        if (data) {
          // We only want to set the videos for this topic, not all videos
          // This is different from the useVideos hook
          const currentVideos = store.videos.filter(video => video.topic_id !== topicId)
          const updatedVideos = [...currentVideos, ...data]
          store.setVideos(updatedVideos)
          
          // Set the active tab to filter by this topic
          if (topicId) {
            store.setActiveTab(topicId)
          }
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useVideosByTopic] SWR error:', error)
        let errorMessage = 'Failed to load videos for this topic'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    videos: data || [],
    isLoading,
    error: error ? 'Failed to load videos for this topic' : null,
    mutate,
    // Store state
    filteredVideos: store.filteredVideos,
    selectedVideo: store.selectedVideo,
    searchTerm: store.searchTerm,
    // Store actions
    setSearchTerm: store.setSearchTerm,
    filterVideos: store.filterVideos,
    resetFilters: store.resetFilters,
  }
}

// Type for single Video hook return
interface UseVideoReturn {
  video: Video | null
  isLoading: boolean
  error: string | null
  mutate: () => Promise<Video | undefined>
}

// Single Video hook
export const useVideo = (videoId: string | null): UseVideoReturn => {
  const store = useVideosStore()
  
  const { data, error, isLoading, mutate } = useSWR(
    videoId ? VIDEO_BY_ID_SWR_KEY(videoId) : null,
    videoId ? () => getVideoById(videoId) : null,
    {
      onSuccess: (data) => {
        console.log('🟢 [useVideo] SWR success for video:', videoId)
        if (data) {
          store.setSelectedVideo(data)
          
          // Update the video in the store if it exists
          const existingVideo = store.getVideoById(data.id)
          if (existingVideo) {
            store.updateVideo(data.id, data)
          } else {
            store.addVideo(data)
          }
        }
        store.setError(null)
      },
      onError: (error) => {
        console.error('🔴 [useVideo] SWR error:', error)
        let errorMessage = 'Failed to load video'
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        store.setError(errorMessage)
      },
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    video: data || null,
    isLoading,
    error: error ? 'Failed to load video' : null,
    mutate,
  }
}

// Type for Video mutations hook return
interface UseVideoMutationsReturn {
  uploadVideo: (formData: FormData) => Promise<Video>
  updateVideo: (videoId: string, videoData: UpdateVideoDto) => Promise<Video>
  deleteVideo: (videoId: string) => Promise<void>
  // Store state
  isSubmitting: boolean
  formErrors: Record<string, string>
  formMode: 'create' | 'edit' | 'view'
  isFormOpen: boolean
  editingVideoId: string | null
}

// Video mutations hook
export const useVideoMutations = (): UseVideoMutationsReturn => {
  const store = useVideosStore()
  
  const uploadVideoMutation = useCallback(async (formData: FormData): Promise<Video> => {
    store.setSubmitting(true)
    try {
      const result = await createVideo(formData)
      toast.success('Video uploaded successfully')
      
      // Update store with the new video
      store.addVideo(result)
      
      return result
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const updateVideoMutation = useCallback(async (videoId: string, videoData: UpdateVideoDto): Promise<Video> => {
    store.setSubmitting(true)
    try {
      const result = await updateVideoById(videoId, videoData)
      toast.success('Video updated successfully')
      
      // Update store with the updated video
      store.updateVideo(videoId, result)
      
      return result
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  const deleteVideoMutation = useCallback(async (videoId: string): Promise<void> => {
    store.setSubmitting(true)
    try {
      await deleteVideoById(videoId)
      toast.success('Video deleted successfully')
      
      // Remove the video from the store
      store.removeVideo(videoId)
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  return {
    uploadVideo: uploadVideoMutation,
    updateVideo: updateVideoMutation,
    deleteVideo: deleteVideoMutation,
    // Store state
    isSubmitting: store.isSubmitting,
    formErrors: store.formErrors,
    formMode: store.formMode,
    isFormOpen: store.isFormOpen,
    editingVideoId: store.editingVideoId,
  }
} 