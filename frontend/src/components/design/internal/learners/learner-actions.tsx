"use client"

import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  UserX, 
  UserCheck,
  Loader2
} from "lucide-react"
import { LearnerProfile } from "@/lib/types/learner"
import { useDeactivateLearner, useReactivateLearner } from "@/hooks/useLearners"
import { toast } from "sonner"
import { API_MESSAGES } from "@/helpers/string_const"

interface LearnerActionsProps {
  learner: LearnerProfile
  onView?: (learner: LearnerProfile) => void
  onEdit?: (learner: LearnerProfile) => void
  disabled?: boolean
  onRefresh?: () => void
}

const LearnerActions: React.FC<LearnerActionsProps> = ({
  learner,
  onView,
  onEdit,
  disabled = false,
  onRefresh
}) => {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showReactivateDialog, setShowReactivateDialog] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Hooks for learner actions
  const { deactivateLearner, isLoading: isDeactivating } = useDeactivateLearner()
  const { reactivateLearner, isLoading: isReactivating } = useReactivateLearner()

  const isLoading = isDeactivating || isReactivating

  const handleView = () => {
    setDropdownOpen(false)
    onView?.(learner)
  }

  const handleEdit = () => {
    setDropdownOpen(false)
    onEdit?.(learner)
  }

  const handleDeactivateClick = () => {
    setDropdownOpen(false)
    setShowDeactivateDialog(true)
  }

  const handleReactivateClick = () => {
    setDropdownOpen(false)
    setShowReactivateDialog(true)
  }

  const handleDeactivateConfirm = async () => {
    try {
      await deactivateLearner(learner.user_id)
      toast.success(API_MESSAGES.LEARNER_DEACTIVATED_SUCCESS)
      setShowDeactivateDialog(false)
      onRefresh?.()
    } catch (error) {
      console.error('Failed to deactivate learner:', error)
    }
  }

  const handleReactivateConfirm = async () => {
    try {
      await reactivateLearner(learner.user_id)
      toast.success(API_MESSAGES.LEARNER_REACTIVATED_SUCCESS)
      setShowReactivateDialog(false)
      onRefresh?.()
    } catch (error) {
      console.error('Failed to reactivate learner:', error)
    }
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            disabled={disabled || isLoading}
          >
            <span className="sr-only">Open menu</span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {onView && (
            <DropdownMenuItem onClick={handleView}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          
          {onEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </DropdownMenuItem>
          )}
          
          {(onView || onEdit) && <DropdownMenuSeparator />}
          
          {(((learner as any).is_active ?? learner.users?.is_active) === true) ? (
            <DropdownMenuItem 
              onClick={handleDeactivateClick}
              className="text-red-600 focus:text-red-600"
            >
              <UserX className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={handleReactivateClick}
              className="text-green-600 focus:text-green-600"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Reactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Learner</AlertDialogTitle>
            <AlertDialogDescription>
              {API_MESSAGES.LEARNER_DEACTIVATE_CONFIRM}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateConfirm}
              disabled={isDeactivating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                'Deactivate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Learner</AlertDialogTitle>
            <AlertDialogDescription>
              {API_MESSAGES.LEARNER_REACTIVATE_CONFIRM}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReactivating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivateConfirm}
              disabled={isReactivating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isReactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reactivating...
                </>
              ) : (
                'Reactivate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { LearnerActions } 