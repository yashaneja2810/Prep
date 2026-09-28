"use client"

import * as React from "react"
import { AlertTriangle, User, Mail, Briefcase, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmDialog, DeleteConfirmDialog } from "@/components/ui/dialogs/confirm-dialog"
import { TrainerProfile } from "@/store/slices/trainers"
import { cn } from "@/lib/utils"

interface TrainerDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trainer?: TrainerProfile
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  disabled?: boolean
}

export const TrainerDeleteDialog = React.forwardRef<
  React.ElementRef<typeof ConfirmDialog>,
  TrainerDeleteDialogProps
>(({ 
  open, 
  onOpenChange, 
  trainer, 
  onConfirm, 
  onCancel, 
  loading = false, 
  disabled = false,
  ...props 
}, ref) => {
  
  // Prevent multiple clicks during loading
  const handleConfirm = React.useCallback(async () => {
    if (loading || disabled) return
    await onConfirm()
  }, [onConfirm, loading, disabled])
  
  const handleCancel = React.useCallback(() => {
    if (loading) return // Prevent cancel during loading
    onCancel?.()
  }, [onCancel, loading])
  
  // Prevent dialog from being closed during loading
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (loading && newOpen === false) return // Prevent closing during loading
    onOpenChange(newOpen)
  }, [onOpenChange, loading])
  
  // Helper functions
  const getTrainerName = () => {
    if (!trainer) return "Unknown Trainer"
    return trainer.first_name || `Trainer ${trainer.user_id.slice(0, 8)}`
  }

  const getTrainerInitials = () => {
    const name = getTrainerName()
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // If no trainer data, show basic delete dialog
  if (!trainer) {
    return (
      <DeleteConfirmDialog
        ref={ref}
        open={open}
        onOpenChange={handleOpenChange}
        itemName="this trainer"
        itemType="trainer profile"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={loading}
        disabled={disabled}
        {...props}
      />
    )
  }

  const trainerName = getTrainerName()
  
  return (
    <ConfirmDialog
      ref={ref}
      open={open}
      onOpenChange={handleOpenChange}
      type="destructive"
      title="Delete Trainer Profile"
      description={`Are you sure you want to delete ${trainerName}'s profile? This action cannot be undone and will permanently remove all trainer data.`}
      confirmText={loading ? "Deleting..." : "Delete Profile"}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      loading={loading}
      disabled={disabled}
      icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
      {...props}
    >
      {/* Trainer Information Display */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={trainer.profile_image} />
            <AvatarFallback className="text-sm font-semibold bg-red-100 text-red-600">
              {getTrainerInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{trainerName}</h4>
            {trainer.email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{trainer.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          {trainer.specialities && trainer.specialities.length > 0 && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-3 w-3 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {trainer.specialities.map((speciality) => (
                  <Badge key={speciality.id} variant="outline" className="text-xs">
                    {speciality.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {trainer.total_years_teaching && (
            <div className="text-xs text-muted-foreground">
              {trainer.total_years_teaching} year{trainer.total_years_teaching !== 1 ? 's' : ''} of teaching experience
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Profile ID: {trainer.id.slice(0, 8)}...
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-red-700">
          <p className="font-medium mb-1">This action is permanent</p>
          <ul className="list-disc list-inside space-y-0.5 text-red-600">
            <li>All profile information will be deleted</li>
            <li>Social links and expertise data will be lost</li>
            <li>This cannot be undone</li>
          </ul>
        </div>
      </div>
    </ConfirmDialog>
  )
})

TrainerDeleteDialog.displayName = "TrainerDeleteDialog"

// Simplified version for bulk delete operations
interface BulkTrainerDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trainerCount: number
  selectedTrainers?: TrainerProfile[]
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  disabled?: boolean
}

export const BulkTrainerDeleteDialog = React.forwardRef<
  React.ElementRef<typeof ConfirmDialog>,
  BulkTrainerDeleteDialogProps
>(({ 
  open, 
  onOpenChange, 
  trainerCount, 
  selectedTrainers = [], 
  onConfirm, 
  onCancel, 
  loading = false, 
  disabled = false,
  ...props 
}, ref) => {
  
  const title = `Delete ${trainerCount} Trainer Profile${trainerCount !== 1 ? 's' : ''}`
  const description = `Are you sure you want to delete ${trainerCount} trainer profile${trainerCount !== 1 ? 's' : ''}? This action cannot be undone.`

  return (
    <ConfirmDialog
      ref={ref}
      open={open}
      onOpenChange={onOpenChange}
      type="destructive"
      title={title}
      description={description}
      confirmText={loading ? "Deleting..." : `Delete ${trainerCount} Profile${trainerCount !== 1 ? 's' : ''}`}
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
      disabled={disabled}
      icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
      {...props}
    >
      {/* Selected Trainers Preview */}
      {selectedTrainers.length > 0 && (
        <div className="border rounded-lg p-3 bg-muted/30 max-h-40 overflow-y-auto">
          <h5 className="text-sm font-medium mb-2">Selected Trainers:</h5>
          <div className="space-y-2">
            {selectedTrainers.slice(0, 5).map((trainer) => {
              const name = trainer.first_name || `Trainer ${trainer.user_id.slice(0, 8)}`
              return (
                <div key={trainer.id} className="flex items-center gap-2 text-xs">
                  <div className="h-1.5 w-1.5 bg-red-500 rounded-full"></div>
                  <span className="font-medium">{name}</span>
                  {trainer.email && (
                    <span className="text-muted-foreground">({trainer.email})</span>
                  )}
                </div>
              )
            })}
            {selectedTrainers.length > 5 && (
              <div className="text-xs text-muted-foreground">
                ... and {selectedTrainers.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning Notice */}
      <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-red-700">
          <p className="font-medium mb-1">This action will permanently delete:</p>
          <ul className="list-disc list-inside space-y-0.5 text-red-600">
            <li>{trainerCount} trainer profile{trainerCount !== 1 ? 's' : ''}</li>
            <li>All associated profile data</li>
            <li>Social links and expertise information</li>
          </ul>
        </div>
      </div>
    </ConfirmDialog>
  )
})

BulkTrainerDeleteDialog.displayName = "BulkTrainerDeleteDialog" 