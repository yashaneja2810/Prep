"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number
  showCharacterCount?: boolean
  error?: string
  resize?: boolean
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ 
  className, 
  maxLength, 
  showCharacterCount = true, 
  error, 
  resize = true,
  value = "",
  onChange,
  ...props 
}, ref) => {
  const [currentLength, setCurrentLength] = React.useState(
    typeof value === 'string' ? value.length : 0
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    
    // Enforce max length if specified
    if (maxLength && newValue.length > maxLength) {
      return
    }
    
    setCurrentLength(newValue.length)
    onChange?.(e)
  }

  // Update current length when value prop changes
  React.useEffect(() => {
    if (typeof value === 'string') {
      setCurrentLength(value.length)
    }
  }, [value])

  const isNearLimit = maxLength && currentLength > maxLength * 0.8
  const isAtLimit = maxLength && currentLength >= maxLength

  return (
    <div className="space-y-2">
      <Textarea
        ref={ref}
        className={cn(
          resize ? "" : "resize-none",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
      
      {(showCharacterCount && maxLength) && (
        <div className="flex justify-end">
          <span className={cn(
            "text-xs",
            isAtLimit ? "text-destructive" : 
            isNearLimit ? "text-amber-600" : 
            "text-muted-foreground"
          )}>
            {currentLength}/{maxLength}
          </span>
        </div>
      )}
    </div>
  )
})

FormTextarea.displayName = "FormTextarea" 