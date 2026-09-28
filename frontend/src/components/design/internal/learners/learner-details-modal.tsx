"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { LearnerStatusBadge } from "@/components/ui/learner-status-badge"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Building2,
  Briefcase,
  Globe,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LearnerProfile } from "@/lib/types/learner"
import { LEARNER_FORM_LABELS } from "@/helpers/string_const"

interface LearnerDetailsModalProps {
  learner: LearnerProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (learner: LearnerProfile) => void
  onDeactivate?: (learner: LearnerProfile) => void
  onReactivate?: (learner: LearnerProfile) => void
  className?: string
}

const LearnerDetailsModal: React.FC<LearnerDetailsModalProps> = ({
  learner,
  open,
  onOpenChange,
  onEdit,
  onDeactivate,
  onReactivate,
  className
}) => {
  if (!learner) {
    return null
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletionIcon = (percentage: number) => {
    if (percentage >= 80) return CheckCircle2
    if (percentage >= 50) return Clock
    return AlertCircle
  }

  const InfoRow = ({ 
    icon: Icon, 
    label, 
    value, 
    href 
  }: { 
    icon: any
    label: string
    value: string | number | null | undefined
    href?: string 
  }) => {
    const displayValue = value || 'Not available'
    const isValueMissing = !value || (typeof value === 'string' && (value.includes('not available') || value.includes('not set') || value.includes('No ')))
    
    return (
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground min-w-0 flex-shrink-0">{label}:</span>
        {href && value ? (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            {displayValue}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className={cn(
            "text-sm font-medium min-w-0 break-all",
            isValueMissing && "text-red-600"
          )}>
            {displayValue}
          </span>
        )}
      </div>
    )
  }

  const completionPercentage = learner.completeness_status?.completion_percentage || 0
  const CompletionIcon = getCompletionIcon(completionPercentage)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Learner Profile Details
          </DialogTitle>
          <DialogDescription>
            Complete profile information and administrative details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt="" />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(
                  learner.users?.first_name || learner.user?.first_name, 
                  learner.users?.last_name || learner.user?.last_name
                )}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h3 className={cn(
                "text-xl font-semibold",
                (!(learner.users?.first_name || learner.user?.first_name) || 
                 !(learner.users?.last_name || learner.user?.last_name)) && "text-red-600"
              )}>
                {getLearnerName(learner)}
              </h3>
              <p className={cn(
                "text-muted-foreground",
                !(learner.users?.email || learner.user?.email) && "text-red-600"
              )}>
                {learner.users?.email || learner.user?.email || 'Email not available'}
              </p>
              <div className="flex flex-wrap gap-2">
                {learner.status ? (
                  <LearnerStatusBadge status={learner.status} />
                ) : (
                  <Badge variant="destructive">Status not set</Badge>
                )}
                {learner.learner_type ? (
                  <Badge variant="outline" className="capitalize">
                    {learner.learner_type}
                  </Badge>
                ) : (
                  <Badge variant="destructive">Type not set</Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(learner)}>
                  Edit Profile
                </Button>
              )}
              {(((learner as any).is_active ?? learner.users?.is_active) === true) && onDeactivate && (
                <Button variant="destructive" size="sm" onClick={() => onDeactivate(learner)}>
                  Deactivate
                </Button>
              )}
              {(((learner as any).is_active ?? learner.users?.is_active) === false) && onReactivate && (
                <Button variant="default" size="sm" onClick={() => onReactivate(learner)}>
                  Reactivate
                </Button>
              )}
            </div>
          </div>

          {/* Profile Completeness */}
          {learner.completeness_status && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CompletionIcon className={cn("h-4 w-4", getCompletionColor(completionPercentage))} />
                  Profile Completeness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className={getCompletionColor(completionPercentage)}>
                      {completionPercentage}%
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {learner.completeness_status.completion_message}
                </p>

                {learner.completeness_status.missing_fields.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Missing fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {learner.completeness_status.missing_fields.map((field, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={User} label="Full Name" value={getLearnerName(learner)} />
                <InfoRow icon={Mail} label="Email" value={learner.users?.email || learner.user?.email || 'Email not available'} />
                <InfoRow icon={Phone} label="Phone" value={learner.users?.phone || learner.user?.phone || 'Phone not available'} />
                <InfoRow icon={MapPin} label="Timezone" value={learner.users?.timezone || learner.user?.timezone || 'Timezone not set'} />
                <InfoRow icon={Calendar} label="Joined" value={learner.created_at ? formatDate(learner.created_at) : 'Date not available'} />
                <InfoRow icon={Clock} label="Last Updated" value={learner.updated_at ? formatDate(learner.updated_at) : 'Date not available'} />
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Career Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {learner.goals_text || 'No career goals specified'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conditional Details Based on Learner Type */}
          {learner.learner_type === 'student' && (learner.learner_student_details || learner.student_details) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const studentDetails = learner.learner_student_details || learner.student_details
                  return studentDetails ? (
                    <>
                      <InfoRow 
                        icon={Building2} 
                        label={LEARNER_FORM_LABELS.COLLEGE_NAME} 
                        value={studentDetails.college_name} 
                      />
                      <InfoRow 
                        icon={GraduationCap} 
                        label={LEARNER_FORM_LABELS.DEGREE_COURSE} 
                        value={studentDetails.degree_course} 
                      />
                      <InfoRow 
                        icon={Star} 
                        label={LEARNER_FORM_LABELS.CURRENT_GPA} 
                        value={studentDetails.current_gpa} 
                      />
                      <InfoRow 
                        icon={Calendar} 
                        label={LEARNER_FORM_LABELS.EXPECTED_GRAD_YEAR} 
                        value={studentDetails.expected_grad_year} 
                      />
                      <InfoRow 
                        icon={Target} 
                        label={LEARNER_FORM_LABELS.INTEREST} 
                        value={studentDetails.interest} 
                      />
                    </>
                  ) : null
                })()}
              </CardContent>
            </Card>
          )}

          {learner.learner_type === 'professional' && (learner.learner_professional_details || learner.professional_details) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const professionalDetails = learner.learner_professional_details || learner.professional_details
                  return professionalDetails ? (
                    <>
                      <InfoRow 
                        icon={Building2} 
                        label={LEARNER_FORM_LABELS.COMPANY_NAME} 
                        value={professionalDetails.company_name} 
                      />
                      <InfoRow 
                        icon={Briefcase} 
                        label={LEARNER_FORM_LABELS.JOB_TITLE} 
                        value={professionalDetails.job_title} 
                      />
                      <InfoRow 
                        icon={Clock} 
                        label={LEARNER_FORM_LABELS.YEARS_EXPERIENCE} 
                        value={`${professionalDetails.years_experience} years`} 
                      />
                      <InfoRow 
                        icon={Star} 
                        label={LEARNER_FORM_LABELS.PIPELINE_DEV_EXP} 
                        value={`${professionalDetails.pipeline_dev_exp} years`} 
                      />
                      <InfoRow 
                        icon={Globe} 
                        label={LEARNER_FORM_LABELS.PORTFOLIO_URL} 
                        value={professionalDetails.portfolio_url} 
                        href={professionalDetails.portfolio_url}
                      />
                    </>
                  ) : null
                })()}
              </CardContent>
            </Card>
          )}

          {/* No Additional Details Message */}
          {((learner.learner_type === 'student' && !learner.learner_student_details && !learner.student_details) ||
            (learner.learner_type === 'professional' && !learner.learner_professional_details && !learner.professional_details)) && (
            <Card>
              <CardContent className="py-6">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No additional {learner.learner_type} details provided</p>
                  <p className="text-sm mt-1">The learner hasn't completed their profile yet</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { LearnerDetailsModal } 