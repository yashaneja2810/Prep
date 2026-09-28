"use client"

import React, { useState, useMemo } from 'react'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LearnerStatusBadge } from "@/components/ui/learner-status-badge"
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Loader2,
  UserCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LearnerProfile } from "@/lib/types/learner"

// Sorting configuration
type SortField = 'name' | 'email' | 'learner_type' | 'status' | 'created_at'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

interface AdminLearnersTableProps {
  learners: LearnerProfile[]
  loading?: boolean
  onRowClick?: (learner: LearnerProfile) => void
  onActionClick?: (learner: LearnerProfile, action: string) => void
  actionComponent?: (learner: LearnerProfile) => React.ReactNode
  className?: string
  emptyMessage?: string
}

const AdminLearnersTable: React.FC<AdminLearnersTableProps> = ({
  learners,
  loading = false,
  onRowClick,
  onActionClick,
  actionComponent,
  className,
  emptyMessage = "No learners found.",
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'created_at',
    direction: 'desc'
  })

  // Sort learners based on current sort configuration
  const sortedLearners = useMemo(() => {
    const sortedArray = [...learners]
    
    sortedArray.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortConfig.field) {
        case 'name':
          // Try new API field first, then fallback to legacy field
          aValue = `${a.users?.first_name || a.user?.first_name || ''} ${a.users?.last_name || a.user?.last_name || ''}`.toLowerCase()
          bValue = `${b.users?.first_name || b.user?.first_name || ''} ${b.users?.last_name || b.user?.last_name || ''}`.toLowerCase()
          break
        case 'email':
          // Try new API field first, then fallback to legacy field
          aValue = (a.users?.email || a.user?.email || '').toLowerCase()
          bValue = (b.users?.email || b.user?.email || '').toLowerCase()
          break
        case 'learner_type':
          aValue = a.learner_type || ''
          bValue = b.learner_type || ''
          break
        case 'status':
          aValue = a.status || ''
          bValue = b.status || ''
          break
        case 'created_at':
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0
          break
        default:
          return 0
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
    
    return sortedArray
  }, [learners, sortConfig])

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronsUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLearnerTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'NA'
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getLearnerName = (learner: LearnerProfile) => {
    // Try new API field first, then fallback to legacy field
    const firstName = learner.users?.first_name || learner.user?.first_name
    const lastName = learner.users?.last_name || learner.user?.last_name
    if (!firstName || !lastName) {
      return 'Name not available'
    }
    return `${firstName} ${lastName}`
  }

  const getLearnerEmail = (learner: LearnerProfile) => {
    // Try new API field first, then fallback to legacy field
    return learner.users?.email || learner.user?.email || 'Email not available'
  }

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading learners...</span>
        </div>
      </div>
    )
  }

  // Empty state
  if (!loading && sortedLearners.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <UserCircle2 className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Learner
                  {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('learner_type')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Type
                  {getSortIcon('learner_type')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('status')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Status
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('created_at')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Joined
                  {getSortIcon('created_at')}
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLearners.map((learner) => (
              <TableRow
                key={learner.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(learner)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt="" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(
                          learner.users?.first_name || learner.user?.first_name, 
                          learner.users?.last_name || learner.user?.last_name
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className={cn(
                        "font-medium",
                        (!(learner.users?.first_name || learner.user?.first_name) || 
                         !(learner.users?.last_name || learner.user?.last_name)) && "text-red-600"
                      )}>
                        {getLearnerName(learner)}
                      </div>
                      <div className={cn(
                        "text-sm text-muted-foreground",
                        !(learner.users?.email || learner.user?.email) && "text-red-600"
                      )}>
                        {getLearnerEmail(learner)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {learner.learner_type ? (
                    <Badge variant="outline" className="capitalize">
                      {getLearnerTypeLabel(learner.learner_type)}
                    </Badge>
                  ) : (
                    <span className="text-red-600 text-sm">Type not set</span>
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    // Determine active/inactive using multiple sources for compatibility
                    const activeFlag = (learner as any).is_active ?? learner.users?.is_active;
                    const derivedStatus: 'active' | 'inactive' | 'dropout' | 'graduate' | undefined =
                      activeFlag !== undefined
                        ? activeFlag
                          ? 'active'
                          : 'inactive'
                        : learner.status as any;
                    return derivedStatus ? (
                      <LearnerStatusBadge status={derivedStatus as any} />
                    ) : (
                      <span className="text-red-600 text-sm">Status not set</span>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {learner.created_at ? (
                    formatDate(learner.created_at)
                  ) : (
                    <span className="text-red-600 text-sm">Date not available</span>
                  )}
                </TableCell>
                <TableCell>
                  <div onClick={(e) => e.stopPropagation()}>
                    {actionComponent ? (
                      actionComponent(learner)
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onActionClick?.(learner, 'view')}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export { AdminLearnersTable } 