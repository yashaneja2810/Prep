import useSWR from 'swr'
import { usePPTsStore } from '@/store/slices/ppts'
import * as pptsApi from '@/lib/api/ppt'

// Return types for hooks
export interface UsePPTsReturn {
  ppts: pptsApi.PPT[] | undefined
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}

export interface UsePPTReturn {
  ppt: pptsApi.PPT | undefined | null
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}

export interface UsePPTsByTopicReturn {
  ppts: pptsApi.PPT[] | undefined
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}

// Hook for fetching all PPTs
export const usePPTs = (): UsePPTsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    pptsApi.PPTS_SWR_KEY,
    pptsApi.getAllPPTs
  )

  return {
    ppts: data,
    isLoading,
    error,
    mutate: () => mutate()
  }
}

// Hook for fetching a single PPT
export const usePPT = (id: string): UsePPTReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    pptsApi.PPT_BY_ID_SWR_KEY(id),
    () => pptsApi.getPPTById(id)
  )

  return {
    ppt: data,
    isLoading,
    error,
    mutate: () => mutate()
  }
}

// Hook for fetching PPTs by topic
export const usePPTsByTopic = (topicId: string): UsePPTsByTopicReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    topicId ? pptsApi.PPTS_BY_TOPIC_SWR_KEY(topicId) : null,
    () => topicId ? pptsApi.getPPTsByTopicId(topicId) : Promise.resolve(undefined)
  )

  return {
    ppts: data,
    isLoading,
    error,
    mutate: () => mutate()
  }
}

// Hook for PPT mutations (create, update, delete)
export const usePPTMutations = () => {
  const { setFormErrors, setIsSubmitting } = usePPTsStore()

  const handleError = (error: any) => {
    setIsSubmitting(false)
    if (error.response?.data?.errors) {
      setFormErrors(error.response.data.errors)
    } else {
      setFormErrors({ submit: error.message })
    }
    throw error
  }

  const create = async (data: pptsApi.CreatePPTDto) => {
    setIsSubmitting(true)
    setFormErrors(null)
    try {
      const result = await pptsApi.createPPT(data)
      setIsSubmitting(false)
      return result
    } catch (error) {
      return handleError(error)
    }
  }

  const update = async (id: string, data: pptsApi.UpdatePPTDto) => {
    setIsSubmitting(true)
    setFormErrors(null)
    try {
      const result = await pptsApi.updatePPT(id, data)
      setIsSubmitting(false)
      return result
    } catch (error) {
      return handleError(error)
    }
  }

  const remove = async (id: string) => {
    setIsSubmitting(true)
    setFormErrors(null)
    try {
      await pptsApi.deletePPT(id)
      setIsSubmitting(false)
    } catch (error) {
      return handleError(error)
    }
  }

  const uploadFile = async (file: File) => {
    setIsSubmitting(true)
    setFormErrors(null)
    try {
      const result = await pptsApi.uploadPPT(file)
      setIsSubmitting(false)
      return result
    } catch (error) {
      return handleError(error)
    }
  }

  const uploadTopicFile = async (topicId: string, file: File, title: string, description?: string) => {
    setIsSubmitting(true)
    setFormErrors(null)
    try {
      const result = await pptsApi.uploadTopicPPT(topicId, file, title, description)
      setIsSubmitting(false)
      return result
    } catch (error) {
      return handleError(error)
    }
  }

  return {
    create,
    update,
    remove,
    uploadFile,
    uploadTopicFile
  }
} 