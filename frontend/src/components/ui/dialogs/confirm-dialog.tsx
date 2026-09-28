"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ConfirmationType = "default" | "destructive" | "warning" | "success" | "info"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  type?: ConfirmationType
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

const typeConfig = {
  default: {
    icon: Info,
    confirmVariant: "default" as const,
    iconColor: "text-blue-500"
  },
  destructive: {
    icon: AlertTriangle,
    confirmVariant: "destructive" as const,
    iconColor: "text-red-500"
  },
  warning: {
    icon: AlertTriangle,
    confirmVariant: "default" as const,
    iconColor: "text-amber-500"
  },
  success: {
    icon: CheckCircle,
    confirmVariant: "default" as const,
    iconColor: "text-green-500"
  },
  info: {
    icon: Info,
    confirmVariant: "default" as const,
    iconColor: "text-blue-500"
  }
}

export const ConfirmDialog = React.forwardRef<
  React.ElementRef<typeof Dialog>,
  ConfirmDialogProps
>(({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default",
  onConfirm,
  onCancel,
  loading = false,
  disabled = false,
  icon,
  children,
  ...props
}, ref) => {
  const config = typeConfig[type]
  const Icon = icon ? null : config.icon

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      // Error handling can be done by the parent component
      console.error("Confirmation action failed:", error)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
      {...props}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          if (loading) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (loading) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {icon ? (
              <span className="flex-shrink-0">{icon}</span>
            ) : Icon ? (
              <Icon className={cn("h-5 w-5 flex-shrink-0", config.iconColor)} />
            ) : null}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading || disabled}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={loading || disabled}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

ConfirmDialog.displayName = "ConfirmDialog"

// Specialized confirmation dialogs for common use cases
interface DeleteConfirmDialogProps extends Omit<ConfirmDialogProps, 'type' | 'title' | 'description' | 'confirmText'> {
  itemName: string
  itemType?: string
  title?: string
  description?: string
  confirmText?: string
}

export const DeleteConfirmDialog = React.forwardRef<
  React.ElementRef<typeof ConfirmDialog>,
  DeleteConfirmDialogProps
>(({
  itemName,
  itemType = "item",
  title,
  description,
  confirmText = "Delete",
  ...props
}, ref) => {
  const defaultTitle = title || `Delete ${itemType}`
  const defaultDescription = description || 
    `Are you sure you want to delete "${itemName}"? This action cannot be undone.`

  return (
    <ConfirmDialog
      ref={ref}
      type="destructive"
      title={defaultTitle}
      description={defaultDescription}
      confirmText={confirmText}
      {...props}
    />
  )
})

DeleteConfirmDialog.displayName = "DeleteConfirmDialog" 