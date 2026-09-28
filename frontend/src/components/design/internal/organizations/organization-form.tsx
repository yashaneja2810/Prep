"use client";

import { forwardRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { 
  Building, 
  Building2, 
  Globe, 
  MapPin, 
  FileText, 
  Image,
  Save,
  X,
  Loader2,
  AlertCircle,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Import validation and form utilities
import { 
  createOrganizationProfileSchema, 
  updateOrganizationProfileSchema,
  CreateOrganizationProfileFormData,
  UpdateOrganizationProfileFormData
} from "@/helpers/validation/organization-profile";
import { 
  generateDefaultOrganizationFormValues,
  ORGANIZATION_TYPE_OPTIONS,
  COUNTRY_CODE_OPTIONS,
  OrganizationFormData
} from "@/helpers/form-utils";
import { Organization } from "@/lib/api/organizations";

// Form mode type
export type FormMode = 'create' | 'edit' | 'view'

interface OrganizationFormProps {
  mode: FormMode
  organizationId?: string | null
  initialData?: Organization
  onSubmit?: (data: CreateOrganizationProfileFormData | UpdateOrganizationProfileFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  className?: string
  hideActions?: boolean
  formId?: string
}

export const OrganizationForm = forwardRef<HTMLDivElement, OrganizationFormProps>(({ 
  mode, 
  organizationId, 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false, 
  className,
  hideActions = false,
  formId
}, ref) => {
  
  // Determine which schema to use based on mode
  const schema = mode === 'edit' ? updateOrganizationProfileSchema : createOrganizationProfileSchema
  
  // Setup form with default values
  const defaultValues = useMemo(() => 
    generateDefaultOrganizationFormValues(mode, initialData), 
    [mode, initialData]
  )
  
  const form = useForm<CreateOrganizationProfileFormData | UpdateOrganizationProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange"
  })
  
  const { handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form
  
  // Watch organization type to conditionally show/hide currently hiring field
  const organizationType = watch('type')
  
  // Update form when initial data changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const formData = generateDefaultOrganizationFormValues('edit', initialData)
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as keyof typeof formData, value)
      })
      
      // Clear is_currently_hiring field if organization is not hiring type
      if (initialData.type !== 'hiring') {
        setValue('is_currently_hiring', undefined)
      }
    }
  }, [initialData, mode, setValue])
  
  // Clear is_currently_hiring when organization type changes from hiring to training
  useEffect(() => {
    if (organizationType === 'training') {
      setValue('is_currently_hiring', undefined)
    }
  }, [organizationType, setValue])
  
  // Handle form submission
  const onFormSubmit = async (data: CreateOrganizationProfileFormData | UpdateOrganizationProfileFormData) => {
    if (onSubmit) {
      await onSubmit(data)
    }
  }
  
  // Header information based on mode
  const headerInfo = useMemo(() => {
    switch (mode) {
      case 'create':
        return {
          icon: <Building className="h-6 w-6 text-blue-600" />,
          title: "Create New Organization",
          description: "Add a new organization to the platform with their information and details."
        }
      case 'edit':
        return {
          icon: <Building2 className="h-6 w-6 text-green-600" />,
          title: "Edit Organization",
          description: "Update organization information and details."
        }
      case 'view':
        return {
          icon: <Building className="h-6 w-6 text-gray-600" />,
          title: "Organization Details",
          description: "View organization information and details."
        }
      default:
        return {
          icon: <Building className="h-6 w-6" />,
          title: "Organization Form",
          description: "Manage organization information."
        }
    }
  }, [mode])
  
  const isReadOnly = mode === 'view'
  const isLoading = loading || isSubmitting
  
  return (
    <div ref={ref} className={cn("w-full max-w-4xl mx-auto", className)}>
      <Form {...form}>
        <form id={formId} onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          
          {/* Header Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                {headerInfo.icon}
                <div>
                  <CardTitle className="text-foreground">{headerInfo.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {headerInfo.description}
                  </CardDescription>
                </div>
              </div>
              {mode === 'edit' && initialData && (
                <div className="flex gap-2 mt-2">
                  <Badge variant={initialData.is_active ? "default" : "secondary"}>
                    {initialData.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{initialData.type === 'hiring' ? 'Hiring' : 'Training'}</Badge>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Basic Information Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </div>
              <CardDescription>
                Essential organization details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Organization Name */}
                <FormField
                  control={form.control}
                  name="org_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter organization name"
                          disabled={isReadOnly || isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Organization Code */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Code *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="TECH001"
                          disabled={isReadOnly || isLoading}
                          className="uppercase"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        1-10 characters, uppercase letters and numbers only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Organization Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Type *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isReadOnly || isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORGANIZATION_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Industry */}
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Technology, Healthcare, Finance..."
                          disabled={isReadOnly || isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Currently Hiring - Conditional Field */}
              {organizationType === 'hiring' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormField
                    control={form.control}
                    name="is_currently_hiring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Currently Hiring *</FormLabel>
                          <FormDescription>
                            Is this organization currently hiring candidates?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isReadOnly || isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
              
              {/* Training Organization Notice */}
              {organizationType === 'training' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Training organizations do not have hiring status as they focus on providing educational services.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Contact & Online Presence Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Contact & Online Presence</CardTitle>
              </div>
              <CardDescription>
                Website and online presence information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Website */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com"
                          disabled={isReadOnly || isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Logo URL */}
                <FormField
                  control={form.control}
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/logo.png"
                          disabled={isReadOnly || isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg">Address Information</CardTitle>
              </div>
              <CardDescription>
                Physical location and address details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Address Lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main Street"
                          disabled={isReadOnly || isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address_line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Suite 100"
                          disabled={isReadOnly || isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* City, State, Postal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="New York"
                          disabled={isReadOnly || isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state_province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="NY"
                          disabled={isReadOnly || isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="10001"
                          disabled={isReadOnly || isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isReadOnly || isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRY_CODE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      ISO 3166-1 alpha-2 country code (2 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Description</CardTitle>
              </div>
              <CardDescription>
                Additional information about the organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the organization, its mission, services, and any other relevant information..."
                        className="min-h-[100px]"
                        disabled={isReadOnly || isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of the organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          {!isReadOnly && !hideActions && (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    disabled={isLoading}
                    className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {mode === 'edit' ? 'Update Organization' : 'Create Organization'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before submitting the form.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </div>
  )
})

OrganizationForm.displayName = "OrganizationForm" 