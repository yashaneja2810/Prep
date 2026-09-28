"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField } from "@/components/ui/form"

interface FormFieldWrapperProps {
  label?: string
  description?: string
  required?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}

export const FormFieldWrapper = React.forwardRef<
  HTMLDivElement,
  FormFieldWrapperProps
>(({ label, description, required, error, className, children }, ref) => {
  const id = React.useId()

  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-destructive",
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id,
              className: cn(
                child.props.className,
                error && "border-destructive focus-visible:ring-destructive"
              ),
              'aria-invalid': !!error,
              'aria-describedby': error ? `${id}-error` : description ? `${id}-description` : undefined,
            } as any)
          }
          return child
        })}
      </div>

      {description && !error && (
        <p id={`${id}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
})

FormFieldWrapper.displayName = "FormFieldWrapper"

// Enhanced form field that integrates with React Hook Form
interface EnhancedFormFieldProps {
  label?: string
  description?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export const EnhancedFormField = React.forwardRef<
  HTMLDivElement,
  EnhancedFormFieldProps
>(({ label, description, required, className, children }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <FormItem ref={ref} className={className}>
      {label && (
        <FormLabel className={cn(
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}>
          {label}
        </FormLabel>
      )}
      
      <FormControl>
        {children}
      </FormControl>

      {description && (
        <FormDescription>
          {description}
        </FormDescription>
      )}

      <FormMessage />
    </FormItem>
  )
})

EnhancedFormField.displayName = "EnhancedFormField" 