"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, ArrowLeft, Mail, User, Briefcase, Globe, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Form, FormField } from "@/components/ui/form"
import { EnhancedFormField } from "@/components/ui/form/form-field"
import { FormTextarea } from "@/components/ui/form/form-textarea"
import { FormSelect, EXPERIENCE_OPTIONS } from "@/components/ui/form/form-select"
import { SocialLinksInput } from "@/components/ui/form/social-links-input"
import { cn } from "@/lib/utils"
import { TrainerProfile } from "@/store/slices/trainers"
import { useSpecialities } from "@/hooks/store"
import { 
  createTrainerProfileSchema, 
  updateTrainerProfileSchema,
  type CreateTrainerProfileFormData,
  type UpdateTrainerProfileFormData 
} from "@/helpers/validation/trainer-profile"
import { PAGE_TITLES, PAGE_DESCRIPTIONS, UI_TEXT, FORM_LABELS } from "@/helpers/string_const"
import { SpecialityManagementDialog } from "./speciality-management-dialog"

export type FormMode = "create" | "edit" | "view"

interface TrainerFormProps {
  mode: FormMode
  profileId?: string | null
  initialData?: TrainerProfile
  onSubmit?: (data: CreateTrainerProfileFormData | UpdateTrainerProfileFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  className?: string
}

export const TrainerForm = React.forwardRef<
  HTMLDivElement,
  TrainerFormProps
>(({ 
  mode, 
  profileId, 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false, 
  className 
}, ref) => {
  // Form mode helpers
  const isCreateMode = mode === "create"
  const isEditMode = mode === "edit"
  const isViewMode = mode === "view"
  const isFormDisabled = isViewMode || loading

  // State for speciality management dialog
  const [isSpecialityManagerOpen, setSpecialityManagerOpen] = React.useState(false);

  // Fetch specialities data
  const { specialities, isLoading: isLoadingSpecialities, error: specialitiesError } = useSpecialities()

  console.log('🟣 [COMPONENT] TrainerForm specialities:', {
    count: Array.isArray(specialities) ? specialities.length : 0,
    isLoading: isLoadingSpecialities,
    error: specialitiesError,
    specialities: Array.isArray(specialities) ? specialities.slice(0, 3) : [] // Log first 3 for debugging
  })

  // Generate default values based on mode and initial data
  const getDefaultValues = () => {
    if (isCreateMode) {
      return {
        email: "",
        specialities: [],
        total_years_teaching: undefined,
        bio: "",
        expertise: "",
        linkedin_url: "",
        website: "",
        profile_image: "",
        social_links: {},
      }
    }
    
    // For edit/view mode, use initial data if provided
    return {
      email: initialData?.email || "",
      specialities: initialData?.specialities?.map(s => s.id) || [],
      total_years_teaching: initialData?.total_years_teaching,
      bio: initialData?.bio || "",
      expertise: initialData?.expertise || "",
      linkedin_url: initialData?.linkedin_url || "",
      website: initialData?.website || "",
      profile_image: initialData?.profile_image || "",
      social_links: initialData?.social_links || {},
    }
  }

  // Form setup with proper validation schema
  const validationSchema = isCreateMode ? createTrainerProfileSchema : updateTrainerProfileSchema
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: getDefaultValues(),
    mode: "onChange",
  })

  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting, isDirty }, 
    watch 
  } = form

  // Watch email for display purposes
  const emailValue = watch("email")
  const watchedSpecialities = watch("specialities")

  console.log('🟣 [COMPONENT] TrainerForm watched values:', {
    selectedSpecialityIds: watchedSpecialities,
    specialitiesCount: specialities.length
  })

  // Handle form submission
  const onFormSubmit = async (data: any) => {
    console.log('🟢 [COMPONENT] TrainerForm submitting data:', data)
    if (!onSubmit) return
    
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  // Helper to get form header info
  const getFormHeader = () => {
    switch (mode) {
      case "create":
        return {
          title: PAGE_TITLES.CREATE_NEW_TRAINER_PROFILE,
          description: PAGE_DESCRIPTIONS.ADD_NEW_TRAINER,
          icon: <User className="h-5 w-5" />
        }
      case "edit":
        return {
          title: PAGE_TITLES.EDIT_TRAINER_PROFILE,
          description: PAGE_DESCRIPTIONS.UPDATE_TRAINER_INFO,
          icon: <User className="h-5 w-5" />
        }
      case "view":
        return {
          title: PAGE_TITLES.TRAINER_PROFILE_DETAILS,
          description: PAGE_DESCRIPTIONS.VIEW_TRAINER_INFO,
          icon: <User className="h-5 w-5" />
        }
      default:
        return {
          title: PAGE_TITLES.TRAINER_PROFILE,
          description: PAGE_DESCRIPTIONS.MANAGE_TRAINER_INFO,
          icon: <User className="h-5 w-5" />
        }
    }
  }

  const headerInfo = getFormHeader()

  // Convert specialities to options format
  const specialityOptions = React.useMemo(() => {
    const safeSpecialities = Array.isArray(specialities) ? specialities : []
    const options = safeSpecialities.map(spec => ({
      value: spec.id.toString(),
      label: spec.name
    }))
    console.log('🟣 [COMPONENT] TrainerForm options:', {
      optionsCount: options.length,
      firstThree: options.slice(0, 3)
    })
    return options
  }, [specialities])

  // Get selected specialities for display
  const selectedSpecialities = React.useMemo(() => {
    const selectedIds = watchedSpecialities || []
    const safeSpecialities = Array.isArray(specialities) ? specialities : []
    const selected = safeSpecialities.filter(spec => selectedIds.includes(spec.id))
    console.log('🟣 [COMPONENT] TrainerForm selected specialities:', {
      selectedIds,
      selectedCount: selected.length,
      selected: selected.map(s => ({ id: s.id, name: s.name }))
    })
    return selected
  }, [specialities, watchedSpecialities])

  return (
    <>
    <div ref={ref} className={cn("w-full max-w-4xl mx-auto", className)}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          

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
            </CardHeader>
          </Card>

          {/* Personal Information Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4" />
                {UI_TEXT.PERSONAL_INFORMATION}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {UI_TEXT.BASIC_CONTACT_INFO}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email and Specialities Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Address */}
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <EnhancedFormField
                      label={UI_TEXT.EMAIL_ADDRESS}
                      description={isCreateMode ? UI_TEXT.ENTER_TRAINER_EMAIL : UI_TEXT.TRAINER_EMAIL_ADDRESS}
                      required={isCreateMode}
                    >
                      {isCreateMode ? (
                        <Input
                          type="email"
                          placeholder={UI_TEXT.TRAINER_EMAIL_PLACEHOLDER}
                          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                          {...field}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{emailValue || "No email provided"}</span>
                        </div>
                      )}
                    </EnhancedFormField>
                  )}
                />

                {/* Specialities */}
                <FormField
                  control={control}
                  name="specialities"
                  render={({ field }) => (
                    <EnhancedFormField
                      label={FORM_LABELS.SPECIALITIES}
                      description={UI_TEXT.AREAS_OF_EXPERTISE}
                      required={isCreateMode}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                        <div className="flex-grow">
                        <FormSelect
                          options={specialityOptions}
                          value=""
                          onValueChange={(value) => {
                            const currentValues = field.value || []
                            const numericValue = parseInt(value)
                            if (!currentValues.includes(numericValue)) {
                              field.onChange([...currentValues, numericValue])
                            }
                          }}
                          placeholder={isLoadingSpecialities ? UI_TEXT.LOADING : UI_TEXT.ADD_SPECIALITY_PLACEHOLDER}
                          searchable
                          disabled={isFormDisabled || isLoadingSpecialities}
                        />
                        </div>
                        <Button type="button" variant="outline" onClick={() => setSpecialityManagerOpen(true)}>Manage</Button>
                        </div>
                        
                        {/* Selected Specialities Display */}
                        {selectedSpecialities.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedSpecialities.map((speciality) => (
                              <Badge
                                key={speciality.id}
                                variant="secondary"
                                className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
                              >
                                {speciality.name}
                                {!isFormDisabled && (
                                  <button
                                    type="button"
                                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                                    onClick={() => {
                                      const currentValues = field.value || []
                                      field.onChange(currentValues.filter(id => id !== speciality.id))
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </EnhancedFormField>
                  )}
                />
              </div>

              {/* Teaching Experience */}
                              <FormField
                  control={control}
                  name="total_years_teaching"
                  render={({ field }) => (
                    <EnhancedFormField
                      label={FORM_LABELS.YEARS_TEACHING}
                      description={UI_TEXT.TEACHING_EXPERIENCE}
                    >
                      <FormSelect
                        options={EXPERIENCE_OPTIONS}
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        placeholder={UI_TEXT.EXPERIENCE_LEVEL_PLACEHOLDER}
                      disabled={isFormDisabled}
                    />
                  </EnhancedFormField>
                )}
              />
            </CardContent>
          </Card>

          {/* Professional Details Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Briefcase className="h-4 w-4" />
                {UI_TEXT.PROFESSIONAL_DETAILS}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {UI_TEXT.DETAILED_SKILLS_INFO}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bio */}
              <FormField
                control={control}
                name="bio"
                                  render={({ field }) => (
                    <EnhancedFormField
                      label={FORM_LABELS.BIO}
                      description={UI_TEXT.BIO_DESCRIPTION}
                    >
                      <FormTextarea
                        placeholder={UI_TEXT.BIO_PLACEHOLDER}
                      maxLength={1000}
                      rows={4}
                      disabled={isFormDisabled}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </EnhancedFormField>
                )}
              />

              {/* Expertise */}
              <FormField
                control={control}
                name="expertise"
                                  render={({ field }) => (
                    <EnhancedFormField
                      label={FORM_LABELS.EXPERTISE}
                      description={UI_TEXT.EXPERTISE_DESCRIPTION}
                    >
                      <FormTextarea
                        placeholder={UI_TEXT.EXPERTISE_PLACEHOLDER}
                      maxLength={500}
                      rows={3}
                      disabled={isFormDisabled}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </EnhancedFormField>
                )}
              />

              {/* Website */}
              <FormField
                control={control}
                name="website"
                                  render={({ field }) => (
                    <EnhancedFormField
                      label={UI_TEXT.PERSONAL_WEBSITE}
                      description={UI_TEXT.WEBSITE_DESCRIPTION}
                    >
                      <Input
                        type="url"
                        placeholder={UI_TEXT.WEBSITE_PLACEHOLDER}
                      disabled={isFormDisabled}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </EnhancedFormField>
                )}
              />
            </CardContent>
          </Card>

          {/* Social Links Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4" />
                {UI_TEXT.SOCIAL_LINKS}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {UI_TEXT.SOCIAL_MEDIA_PROFILES}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="social_links"
                render={({ field }) => (
                  <SocialLinksInput
                    value={field.value || {}}
                    onChange={field.onChange}
                    disabled={isFormDisabled}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          {!isViewMode && (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {isDirty ? "You have unsaved changes" : "No changes made"}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {onCancel && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Cancel
                      </Button>
                    )}
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting || (!isDirty && isEditMode)}
                      className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isCreateMode ? "Creating..." : "Updating..."}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {isCreateMode ? "Create Profile" : "Update Profile"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
    <SpecialityManagementDialog open={isSpecialityManagerOpen} onOpenChange={setSpecialityManagerOpen} />
    </>
  )
})

TrainerForm.displayName = "TrainerForm" 