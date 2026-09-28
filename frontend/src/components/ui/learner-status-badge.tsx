import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LearnerProfile } from "@/lib/types/learner"

const learnerStatusVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      status: {
        active: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
        dropout: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
        graduate: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
        inactive: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
)

interface LearnerStatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof learnerStatusVariants> {
  status: LearnerProfile['status'] | 'inactive'
  showIcon?: boolean
}

const StatusIcon = ({ status }: { status: LearnerProfile['status'] }) => {
  switch (status) {
    case 'active':
      return (
        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
      )
    case 'dropout':
      return (
        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
      )
    case 'graduate':
      return (
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
      )
    case 'inactive':
      return (
        <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
      )
    default:
      return null
  }
}

const getStatusLabel = (status: LearnerProfile['status']): string => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'dropout':
      return 'Dropout'
    case 'graduate':
      return 'Graduate'
    case 'inactive':
      return 'Inactive'
    default:
      return 'Unknown'
  }
}

function LearnerStatusBadge({ 
  className, 
  status, 
  showIcon = true,
  ...props 
}: LearnerStatusBadgeProps) {
  return (
    <span 
      className={cn(learnerStatusVariants({ status }), className)} 
      {...props}
    >
      {showIcon && <StatusIcon status={status} />}
      {getStatusLabel(status)}
    </span>
  )
}

export { LearnerStatusBadge, learnerStatusVariants, getStatusLabel } 