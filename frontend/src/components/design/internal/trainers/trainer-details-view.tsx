"use client"

import React, { useState } from "react"
import { 
  Edit, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Globe, 
  User, 
  Briefcase, 
  Calendar, 
  Award,
  Star,
  MapPin,
  Phone,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  Heart,
  Share2,
  Download,
  Eye,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrainerProfile } from "@/store/slices/trainers"
import { cn } from "@/lib/utils"

interface TrainerDetailsViewProps {
  profileId: string
  trainer: TrainerProfile
  onEdit?: () => void
  onDelete?: () => void
  loading?: boolean
  className?: string
}

export const TrainerDetailsView = React.forwardRef<
  HTMLDivElement,
  TrainerDetailsViewProps
>(({ profileId, trainer, onEdit, onDelete, loading = false, className }, ref) => {
  
  const [activeTab, setActiveTab] = useState("overview")

  // Helper functions
  const getInitials = () => {
    const name = trainer.first_name || trainer.email?.split('@')[0] || 'T'
    return name.charAt(0).toUpperCase()
  }

  const getExperienceLevel = () => {
    const years = trainer.total_years_teaching || 0
    if (years === 0) return { label: "New Trainer", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", level: 0 }
    if (years <= 2) return { label: "Junior Trainer", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", level: 1 }
    if (years <= 5) return { label: "Mid-level Trainer", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", level: 2 }
    if (years <= 10) return { label: "Senior Trainer", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", level: 3 }
    return { label: "Expert Trainer", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", level: 4 }
  }

  const experienceLevel = getExperienceLevel()

  // Helper to get social media icons
  const getSocialIcon = (platform: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      linkedin: Linkedin,
      github: Github,
      twitter: Twitter,
      facebook: Facebook,
      instagram: Instagram,
      youtube: Youtube,
    }
    return icons[platform.toLowerCase()] || Globe
  }

  // Process social links
  const socialLinks = React.useMemo(() => {
    if (!trainer.social_links || typeof trainer.social_links !== 'object') return []
    
    return Object.entries(trainer.social_links)
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([platform, url]) => {
        // Get color for each platform
        const getColor = (platform: string) => {
          switch (platform.toLowerCase()) {
            case 'linkedin': return 'text-blue-600'
            case 'github': return 'text-gray-800 dark:text-gray-200'
            case 'twitter': return 'text-blue-500'
            case 'facebook': return 'text-blue-700'
            case 'instagram': return 'text-pink-600'
            case 'youtube': return 'text-red-600'
            default: return 'text-gray-600'
          }
        }

        return {
          platform: platform.toLowerCase(),
          url: url as string,
          displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
          icon: getSocialIcon(platform),
          color: getColor(platform)
        }
      })
  }, [trainer.social_links])

  // Process expertise skills
  const expertiseSkills = React.useMemo(() => {
    if (!trainer.expertise) return []
    return trainer.expertise
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
  }, [trainer.expertise])

  // Helper to render specialities
  const renderSpecialities = () => {
    if (!trainer.specialities || trainer.specialities.length === 0) {
      return (
        <span className="text-muted-foreground italic">No specialities specified</span>
      )
    }

    return (
      <div className="flex flex-wrap gap-2">
        {trainer.specialities.map((speciality) => (
          <Badge
            key={speciality.id}
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            {speciality.name}
          </Badge>
        ))}
      </div>
    )
  }

  // Get trainer status info
  const getTrainerStatus = () => {
    return trainer.is_active ? {
      label: "Active",
      color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
      icon: CheckCircle2
    } : {
      label: "Inactive", 
      color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
      icon: XCircle
    }
  }

  const trainerStatus = getTrainerStatus()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }

  return (
    <motion.div 
      ref={ref}
      className={cn("space-y-6", className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-border shadow-md">
                <AvatarImage 
                  src={trainer.profile_image || undefined} 
                  alt={trainer.first_name || 'Trainer'} 
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl sm:text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {/* Basic Info */}
              <div className="flex-1 space-y-3 min-w-0">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold truncate text-foreground">
                    {trainer.first_name || 'Trainer Profile'}
                  </h1>
                  {trainer.specialities && trainer.specialities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-lg sm:text-xl text-muted-foreground">
                        {trainer.specialities.length === 1 
                          ? `${trainer.specialities[0].name} Specialist`
                          : `${trainer.specialities.length} Specialities`
                        }
                      </p>
                      {renderSpecialities()}
                    </div>
                  )}
                  {trainer.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{trainer.email}</span>
                    </div>
                  )}
                </div>

                {/* Status & Experience Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={trainerStatus.color}>
                    <trainerStatus.icon className="h-3 w-3 mr-1" />
                    {trainerStatus.label}
                  </Badge>
                  <Badge className={experienceLevel.color}>
                    <Award className="h-3 w-3 mr-1" />
                    {experienceLevel.label}
                  </Badge>
                  {trainer.total_years_teaching && (
                    <Badge variant="outline" className="bg-background border-border text-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {trainer.total_years_teaching} years experience
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start">
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onEdit}
                    disabled={loading}
                    className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Experience</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {trainer.total_years_teaching || 0}<span className="text-sm font-normal text-muted-foreground">y</span>
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skills</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{expertiseSkills.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Social Links</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{socialLinks.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {trainer.bio ? '100' : '75'}<span className="text-sm font-normal text-muted-foreground">%</span>
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger 
                  value="overview" 
                  className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="expertise" 
                  className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <Target className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Expertise</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="social" 
                  className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Social</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Bio Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">About</h3>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg border border-border">
                    <p className="text-muted-foreground leading-relaxed">
                      {trainer.bio || 'No bio provided yet. This trainer hasn\'t added a personal description to their profile.'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Professional Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Briefcase className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Professional Summary</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Specialities</p>
                      <div className="font-medium text-foreground">
                        {renderSpecialities()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Teaching Experience</p>
                      <p className="font-medium text-foreground">
                        {trainer.total_years_teaching ? `${trainer.total_years_teaching} years` : 'Not specified'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Experience Level</p>
                      <Badge className={experienceLevel.color}>
                        {experienceLevel.label}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={trainerStatus.color}>
                        <trainerStatus.icon className="h-3 w-3 mr-1" />
                        {trainerStatus.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Expertise Tab */}
              <TabsContent value="expertise" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Target className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Skills & Expertise</h3>
                  </div>
                  
                  {expertiseSkills.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {expertiseSkills.map((skill, index) => (
                          <Badge 
                            key={index}
                            variant="secondary" 
                            className="px-3 py-1.5 text-sm bg-secondary/50 text-foreground hover:bg-secondary/70 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="bg-muted/20 p-4 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground">
                          This trainer has expertise in <strong className="text-foreground">{expertiseSkills.length}</strong> different areas, 
                          ranging from core technologies to specialized skills.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
                        <Target className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-foreground">No Expertise Listed</h4>
                      <p className="text-muted-foreground">
                        This trainer hasn't added their areas of expertise yet.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Social Tab */}
              <TabsContent value="social" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Globe className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Social Presence</h3>
                  </div>
                  
                  {socialLinks.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {socialLinks.map((link, index) => {
                          const IconComponent = link.icon
                          return (
                            <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${link.color}`}>
                                  <IconComponent className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{link.displayName}</p>
                                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {link.url}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-foreground hover:bg-accent"
                              >
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                      
                      <div className="bg-muted/20 p-4 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground">
                          This trainer maintains <strong className="text-foreground">{socialLinks.length}</strong> social presence(s) 
                          to connect with students and the community.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
                        <Globe className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-foreground">No Social Links</h4>
                      <p className="text-muted-foreground">
                        This trainer hasn't added their social media profiles yet.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>

      {/* Action Section */}
      {(onEdit || onDelete) && (
        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Profile Actions</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage this trainer profile with the available actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Use the buttons below to edit the trainer information or remove this profile from the system.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {onEdit && (
                    <Button 
                      variant="outline" 
                      onClick={onEdit}
                      disabled={loading}
                      className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="destructive" 
                      onClick={onDelete}
                      disabled={loading}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deactivate Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
})

TrainerDetailsView.displayName = "TrainerDetailsView" 