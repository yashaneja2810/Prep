"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Building, 
  Globe, 
  Mail, 
  MapPin, 
  Phone,
  Users,
  Calendar,
  Clock,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileCheck,
  UserPlus,
  Award,
  Briefcase,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useOrganizationsMutations } from '@/hooks/useOrganizations'
import { Organization, formatOrganizationType, formatAddress, getOrganizationById } from '@/lib/api/organizations'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog'

import {
  ROUTES,
  ROUTE_HELPERS,
  ORGANIZATION_UI_TEXT,
  ORGANIZATION_STATUS,
  ORGANIZATION_TYPES,
  ORGANIZATION_ACTION_LABELS,
  ORGANIZATION_DIALOG_TEXT,
} from '@/helpers/string_const'

// Configuration Maps
const ORGANIZATION_TYPE_CONFIG = {
  [ORGANIZATION_TYPES.HIRING]: {
    label: ORGANIZATION_UI_TEXT.HIRING_BADGE,
    className: "bg-blue-500 text-white",
    icon: UserPlus,
  },
  [ORGANIZATION_TYPES.TRAINING]: {
    label: ORGANIZATION_UI_TEXT.TRAINING_BADGE,
    className: "bg-green-500 text-white",
    icon: Award,
  },
} as const

const STATUS_CONFIG = {
  active: {
    label: ORGANIZATION_UI_TEXT.ACTIVE_BADGE,
    className: "bg-green-500 text-white",
    icon: CheckCircle,
  },
  inactive: {
    label: ORGANIZATION_UI_TEXT.INACTIVE_BADGE,
    className: "bg-red-500 text-white",
    icon: AlertCircle,
  },
} as const

interface OrganizationDetailsPageClientProps {
  organizationId: string
}

export function OrganizationDetailsPageClient({ organizationId }: OrganizationDetailsPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOperating, setIsOperating] = useState(false)
  const { deactivateOrganization, activateOrganization } = useOrganizationsMutations()

  // Fetch organization data
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getOrganizationById(organizationId)
        setOrganization(data)
      } catch (err) {
        console.error('Failed to fetch organization:', err)
        setError(err instanceof Error ? err.message : 'Failed to load organization')
      } finally {
        setIsLoading(false)
      }
    }

    if (organizationId) {
      fetchOrganization()
    }
  }, [organizationId])

  const handleStatusChange = async (operation: 'activate' | 'deactivate') => {
    if (!organization) return
    
    try {
      setIsOperating(true)
      if (operation === 'activate') {
        await activateOrganization(organization.id)
        setOrganization(prev => prev ? { ...prev, is_active: true } : null)
        toast({
          title: "Organization activated",
          description: `${organization.org_name} has been successfully activated.`,
          variant: "default",
        })
      } else {
        await deactivateOrganization(organization.id)
        setOrganization(prev => prev ? { ...prev, is_active: false } : null)
        toast({
          title: "Organization deactivated",
          description: `${organization.org_name} has been successfully deactivated.`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error(`Failed to ${operation} organization:`, error)
      toast({
        title: `Failed to ${operation} organization`,
        description: `There was an error ${operation === 'activate' ? 'activating' : 'deactivating'} ${organization.org_name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsOperating(false)
    }
  }

  // Format date string to readable format
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">{ORGANIZATION_UI_TEXT.LOADING_ORGANIZATIONS}</p>
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{ORGANIZATION_UI_TEXT.ORGANIZATION_DETAILS}</h1>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {ORGANIZATION_UI_TEXT.ERROR_LOADING_ORGANIZATIONS}: {error}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/internal/organizations">
                Back to Organizations
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  // Organization not found
  if (!organization) {
    return (
      <PageContainer>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{ORGANIZATION_UI_TEXT.ORGANIZATION_DETAILS}</h1>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Organization not found.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/internal/organizations">
                Back to Organizations
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  const formattedAddress = formatAddress(organization)
  const TypeIcon = ORGANIZATION_TYPE_CONFIG[organization.type as keyof typeof ORGANIZATION_TYPE_CONFIG]?.icon || Building
  const StatusIcon = STATUS_CONFIG[organization.is_active ? 'active' : 'inactive'].icon

  return (
    <PageContainer>
      <div className="container max-w-7xl mx-auto p-6">
        {/* Back button and title bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{ORGANIZATION_UI_TEXT.ORGANIZATION_DETAILS}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              asChild
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Link href={ROUTE_HELPERS.getOrganizationUsersRoute(organization.id)}>
                <Users className="h-4 w-4" />
                <span>{ORGANIZATION_UI_TEXT.VIEW_USERS}</span>
              </Link>
            </Button>
            
            <Button 
              asChild
              className="flex items-center gap-2"
            >
              <Link href={ROUTE_HELPERS.getEditOrganizationRoute(organization.id)}>
                <Edit className="h-4 w-4" />
                <span>{ORGANIZATION_UI_TEXT.EDIT_ORGANIZATION}</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Organization header card */}
          <Card className="col-span-1 md:col-span-3">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border">
                    <AvatarImage src={organization.logo_url || undefined} alt={organization.org_name || 'Organization'} />
                    <AvatarFallback className="text-3xl">
                      {organization.org_name?.charAt(0) || 'O'}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{organization.org_name}</h2>
                      <Badge className={STATUS_CONFIG[organization.is_active ? 'active' : 'inactive'].className}>
                        <div className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          <span>{STATUS_CONFIG[organization.is_active ? 'active' : 'inactive'].label}</span>
                        </div>
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={ORGANIZATION_TYPE_CONFIG[organization.type as keyof typeof ORGANIZATION_TYPE_CONFIG]?.className}>
                        <div className="flex items-center gap-1">
                          <TypeIcon className="h-3 w-3" />
                          <span>{ORGANIZATION_TYPE_CONFIG[organization.type as keyof typeof ORGANIZATION_TYPE_CONFIG]?.label}</span>
                        </div>
                      </Badge>

                      {organization.type === 'hiring' && (
                        <Badge variant={organization.is_currently_hiring ? "default" : "secondary"} className={organization.is_currently_hiring ? "bg-blue-500 text-white" : ""}>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span>{organization.is_currently_hiring ? ORGANIZATION_UI_TEXT.CURRENTLY_HIRING_BADGE : ORGANIZATION_UI_TEXT.NOT_HIRING_BADGE}</span>
                          </div>
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className="bg-background">
                        <code className="text-xs">{organization.code}</code>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Status change buttons */}
                <div>
                  {organization.is_active ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          disabled={isOperating}
                          className="flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {isOperating ? ORGANIZATION_UI_TEXT.DEACTIVATING : ORGANIZATION_UI_TEXT.DEACTIVATE}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{ORGANIZATION_DIALOG_TEXT.DEACTIVATE_TITLE}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {ORGANIZATION_DIALOG_TEXT.DEACTIVATE_MESSAGE.replace('{name}', organization.org_name || '')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStatusChange('deactivate')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button 
                      variant="default" 
                      onClick={() => handleStatusChange('activate')} 
                      disabled={isOperating}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {isOperating ? ORGANIZATION_UI_TEXT.ACTIVATING : ORGANIZATION_UI_TEXT.ACTIVATE}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Organization details */}
          <div className="space-y-6 col-span-1 md:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    <span>{ORGANIZATION_UI_TEXT.BASIC_INFORMATION}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {organization.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {ORGANIZATION_UI_TEXT.DESCRIPTION}
                    </h4>
                    <p className="text-sm">{organization.description}</p>
                  </div>
                )}

                {organization.industry && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {ORGANIZATION_UI_TEXT.INDUSTRY}
                    </h4>
                    <p className="text-sm">{organization.industry}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {ORGANIZATION_UI_TEXT.TYPE}
                    </h4>
                    <p className="text-sm">{formatOrganizationType(organization.type)}</p>
                  </div>
                  
                  {organization.type === 'hiring' && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {ORGANIZATION_UI_TEXT.HIRING_STATUS}
                      </h4>
                      <p className="text-sm">
                        {organization.is_currently_hiring ? ORGANIZATION_UI_TEXT.IS_HIRING : ORGANIZATION_UI_TEXT.NOT_HIRING}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span>{ORGANIZATION_UI_TEXT.CONTACT_INFORMATION}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {organization.website ? (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <span>{ORGANIZATION_UI_TEXT.WEBSITE}</span>
                      </div>
                    </h4>
                    <a 
                      href={organization.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 text-sm"
                    >
                      {organization.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <span>{ORGANIZATION_UI_TEXT.WEBSITE}</span>
                      </div>
                    </h4>
                    <p className="text-sm text-muted-foreground">{ORGANIZATION_UI_TEXT.NO_WEBSITE_PROVIDED}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{ORGANIZATION_UI_TEXT.ADDRESS}</span>
                    </div>
                  </h4>
                  <p className="text-sm">
                    {formattedAddress === ORGANIZATION_UI_TEXT.NO_ADDRESS_PROVIDED ? (
                      <span className="text-muted-foreground">{formattedAddress}</span>
                    ) : (
                      formattedAddress
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    <span>{ORGANIZATION_UI_TEXT.SYSTEM_INFORMATION}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{ORGANIZATION_UI_TEXT.CREATED_AT}</span>
                      </div>
                    </h4>
                    <p className="text-sm">{formatDate(organization.created_at)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{ORGANIZATION_UI_TEXT.LAST_UPDATED}</span>
                      </div>
                    </h4>
                    <p className="text-sm">{formatDate(organization.updated_at)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{ORGANIZATION_UI_TEXT.STATUS}</span>
                      </div>
                    </h4>
                    <p className="text-sm">
                      {organization.is_active ? ORGANIZATION_UI_TEXT.STATUS_ACTIVE : ORGANIZATION_UI_TEXT.STATUS_INACTIVE}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{ORGANIZATION_UI_TEXT.USER_MANAGEMENT}</span>
                      </div>
                    </h4>
                    <Button 
                      asChild 
                      variant="link" 
                      className="p-0 h-auto text-blue-600 dark:text-blue-400"
                    >
                      <Link href={ROUTE_HELPERS.getOrganizationUsersRoute(organization.id)}>
                        {ORGANIZATION_UI_TEXT.VIEW_USERS}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions sidebar */}
          <div className="space-y-6 col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{ORGANIZATION_UI_TEXT.ACTIONS}</CardTitle>
                <CardDescription>{ORGANIZATION_UI_TEXT.ORGANIZATION_ACTIONS_DESCRIPTION}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  asChild 
                  className="w-full flex items-center gap-2 justify-start"
                >
                  <Link href={ROUTE_HELPERS.getEditOrganizationRoute(organization.id)}>
                    <Edit className="h-4 w-4" />
                    <span>{ORGANIZATION_ACTION_LABELS.EDIT_ORGANIZATION}</span>
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full flex items-center gap-2 justify-start"
                >
                  <Link href={ROUTE_HELPERS.getOrganizationUsersRoute(organization.id)}>
                    <Users className="h-4 w-4" />
                    <span>{ORGANIZATION_UI_TEXT.VIEW_USERS}</span>
                  </Link>
                </Button>
                
                <Separator />
                
                {organization.is_active ? null : (
                  <Button 
                    variant="default" 
                    onClick={() => handleStatusChange('activate')} 
                    disabled={isOperating}
                    className="w-full flex items-center gap-2 justify-start bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isOperating ? ORGANIZATION_UI_TEXT.ACTIVATING : ORGANIZATION_UI_TEXT.ACTIVATE}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}