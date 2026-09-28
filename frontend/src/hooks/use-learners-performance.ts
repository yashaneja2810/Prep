"use client"
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { LearnerProfile } from '@/lib/types/learner'
import { StatusFilter, TypeFilter } from '@/store/slices/learners'

interface PerformanceMetrics {
  filterTime: number
  renderTime: number
  totalItems: number
  filteredItems: number
}

interface UseLearnersPerformanceOptions {
  learners: LearnerProfile[]
  searchTerm: string
  statusFilter: StatusFilter
  learnerTypeFilter: TypeFilter
  debounceMs?: number
  enableMetrics?: boolean
}

export const useLearnersPerformance = ({
  learners,
  searchTerm,
  statusFilter,
  learnerTypeFilter,
  debounceMs = 300,
  enableMetrics = false,
}: UseLearnersPerformanceOptions) => {
  // Debounced search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)
  
  // Performance metrics
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    filterTime: 0,
    renderTime: 0,
    totalItems: 0,
    filteredItems: 0,
  })

  // Memoized filtered and sorted learners for performance
  const filteredLearners = useMemo(() => {
    const startTime = enableMetrics ? performance.now() : 0
    
    let filtered = [...learners]

    // Apply search filter (using debounced term)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(learner => {
        // Safely access user properties with null checks - using 'users' field from API
        const firstName = learner.users?.first_name?.toLowerCase() || learner.user?.first_name?.toLowerCase() || ''
        const lastName = learner.users?.last_name?.toLowerCase() || learner.user?.last_name?.toLowerCase() || ''
        const email = learner.users?.email?.toLowerCase() || learner.user?.email?.toLowerCase() || ''
        const goals = learner.goals_text?.toLowerCase() || ''
        
        return firstName.includes(searchLower) ||
               lastName.includes(searchLower) ||
               email.includes(searchLower) ||
               goals.includes(searchLower)
      })
    }

    // Apply status filter (active / inactive)
    if (statusFilter !== 'all') {
      const isActiveFn = (lr: LearnerProfile) => {
        const flag = (lr as any).is_active ?? lr.users?.is_active;
        return flag === true;
      };

      if (statusFilter === 'active') {
        filtered = filtered.filter(isActiveFn);
      } else {
        filtered = filtered.filter((lr) => !isActiveFn(lr));
      }
    }

    // Apply learner type filter
    if (learnerTypeFilter !== 'all') {
      filtered = filtered.filter(learner => learner.learner_type === learnerTypeFilter)
    }

    // Sort by creation date (newest first) for consistency
    filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

    // Record performance metrics
    if (enableMetrics) {
      const filterTime = performance.now() - startTime
      setMetrics(prev => ({
        ...prev,
        filterTime,
        totalItems: learners.length,
        filteredItems: filtered.length,
      }))
    }

    return filtered
  }, [learners, debouncedSearchTerm, statusFilter, learnerTypeFilter, enableMetrics])

  // Memoized statistics for performance
  const learnersStats = useMemo(() => ({
    total: learners.length,
    active: learners.filter((l: LearnerProfile) => ((l as any).is_active ?? l.users?.is_active) === true).length,
    inactive: learners.filter((l: LearnerProfile) => ((l as any).is_active ?? l.users?.is_active) === false).length,
    dropout: learners.filter((l: LearnerProfile) => l.status === 'dropout').length,
    graduate: learners.filter((l: LearnerProfile) => l.status === 'graduate').length,
    students: learners.filter((l: LearnerProfile) => l.learner_type === 'student').length,
    professionals: learners.filter((l: LearnerProfile) => l.learner_type === 'professional').length,
    filtered: filteredLearners.length,
  }), [learners, filteredLearners.length])

  // Optimized pagination
  const usePagination = useCallback((pageSize = 20) => {
    const [currentPage, setCurrentPage] = useState(1)
    
    const totalPages = Math.ceil(filteredLearners.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedLearners = filteredLearners.slice(startIndex, endIndex)

    // Reset to first page when filters change
    useEffect(() => {
      setCurrentPage(1)
    }, [debouncedSearchTerm, statusFilter, learnerTypeFilter])

    return {
      currentPage,
      totalPages,
      pageSize,
      paginatedLearners,
      setCurrentPage,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      totalItems: filteredLearners.length,
    }
  }, [filteredLearners, debouncedSearchTerm, statusFilter, learnerTypeFilter])

  // Virtual scrolling helper (for very large lists)
  const useVirtualScrolling = useCallback((itemHeight = 80, containerHeight = 600) => {
    const [scrollTop, setScrollTop] = useState(0)
    
    const visibleItems = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + visibleItems + 1, filteredLearners.length)
    
    const visibleLearners = filteredLearners.slice(startIndex, endIndex)
    const totalHeight = filteredLearners.length * itemHeight
    const offsetY = startIndex * itemHeight

    return {
      visibleLearners,
      totalHeight,
      offsetY,
      onScroll: (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
      },
    }
  }, [filteredLearners])

  // Performance logger
  useEffect(() => {
    if (enableMetrics && console.groupCollapsed) {
      console.groupCollapsed('🚀 Learners Performance Metrics')
      console.log('Filter Time:', `${metrics.filterTime.toFixed(2)}ms`)
      console.log('Total Items:', metrics.totalItems)
      console.log('Filtered Items:', metrics.filteredItems)
      console.log('Filter Efficiency:', `${((metrics.filteredItems / metrics.totalItems) * 100).toFixed(1)}%`)
      console.groupEnd()
    }
  }, [metrics, enableMetrics])

  return {
    filteredLearners,
    learnersStats,
    metrics,
    usePagination,
    useVirtualScrolling,
    debouncedSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm,
  }
}

// Performance monitoring hook
export const usePerformanceMonitoring = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 16) { // Slower than 60fps
        console.warn(`⚠️ [${componentName}] Slow render detected: ${renderTime.toFixed(2)}ms`)
      }
    }
  })
}

export default useLearnersPerformance 