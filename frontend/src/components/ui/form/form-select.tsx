"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps {
  options: Option[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  error?: string
  className?: string
  emptyMessage?: string
}

export const FormSelect = React.forwardRef<
  HTMLButtonElement,
  FormSelectProps
>(({ 
  options, 
  value, 
  onValueChange, 
  placeholder = "Select an option...",
  searchable = false,
  disabled = false,
  error,
  className,
  emptyMessage = "No options found."
}, ref) => {
  const [open, setOpen] = React.useState(false)
  
  // For searchable selects
  if (searchable) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error && "border-destructive",
              className
            )}
            disabled={disabled}
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search options..." />
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={() => {
                    onValueChange?.(option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  // For non-searchable selects
  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        ref={ref}
        className={cn(
          error && "border-destructive focus:ring-destructive",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})

FormSelect.displayName = "FormSelect"

// Teaching experience options
export const EXPERIENCE_OPTIONS: Option[] = [
  { value: "0", label: "Less than 1 year" },
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "4", label: "4 years" },
  { value: "5", label: "5 years" },
  { value: "6", label: "6-10 years" },
  { value: "10", label: "10+ years" },
  { value: "15", label: "15+ years" },
  { value: "20", label: "20+ years" }
] 