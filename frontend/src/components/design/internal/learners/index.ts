// Pages and Main Components
export { default as LearnersPageClient } from './learners-page-client';
export type { Student } from './learners-page-client';

// Admin Learner Management Components
export { AddLearnersForm } from './add-learners-form'
export { LearnerDetailsModal } from './learner-details-modal'
export { LearnerActions } from './learner-actions'

// Error Handling
export { default as LearnersErrorBoundary, useErrorHandler } from './learners-error-boundary'

// UI Components (re-export for convenience)
export { LearnerStatusBadge } from '@/components/ui/learner-status-badge'
export { AdminLearnersTable } from '@/components/ui/admin-learners-table'

// Performance and Optimization Hooks (use directly from hooks folder to avoid server/client issues)
// export { default as useLearnersPerformance, usePerformanceMonitoring } from '@/hooks/use-learners-performance'
// export { useDebounce } from '@/hooks/use-debounce' 