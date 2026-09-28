"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Users,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Book,
  Star,
  CheckCircle2,
  Clock,
  Plus,
  MoreVertical,
  BookOpen,
  Award,
  Puzzle,
  Calendar,
  ExternalLink,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  AlertCircle,
  RefreshCw,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GlossyHero } from "@/components/ui/glossy-hero";
import { PageHeader } from "@/components/page-header";
import { PageContainer } from "@/components/page-container";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTrainers } from "@/hooks/store";
import { getAllSpecialities } from "@/lib/api/specialities";
import { formatExpertise, formatTeachingExperience, formatSocialLinks } from "@/lib/api/profiles";
import { TrainerProfile } from "@/store/slices/trainers";
import { toast } from "sonner";
import useSWR from 'swr';
import { 
  SWR_KEYS, 
  UI_TEXT, 
  STATUS_TEXT, 
  TAB_LABELS, 
  TABLE_HEADERS, 
  ACTION_LABELS, 
  DIALOG_TEXT,
  BUTTON_LABELS,
  PAGE_TITLES,
  ROUTES,
  ROUTE_HELPERS
} from '@/helpers/string_const';

const TrainersClient = React.memo(function TrainersClient() {
  console.log('🔵 [COMPONENT] TrainersClient rendering')
  
  // Use the custom hook for data fetching and state management
  const {
    trainers: filteredTrainers,
    allTrainers,
    searchTerm,
    selectedSpecialty,
    activeTab,
    isLoading,
    error,
    setSearchTerm,
    setSelectedSpecialty,
    setActiveTab,
    getUniqueSpecialities,
    getTrainerCounts,
    refreshTrainers,
    deleteTrainer,
    reactivateTrainer,
    permanentlyDeleteTrainer,
    isSubmitting,
  } = useTrainers()
  
  // Get specialities for dropdown (direct SWR call for now)
  const { data: specialities = [] } = useSWR(SWR_KEYS.SPECIALITIES, getAllSpecialities, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })
  
  console.log('🔵 [COMPONENT] Hook data:', {
    filteredTrainersCount: filteredTrainers.length,
    allTrainersCount: allTrainers.length,
    isLoading,
    isSubmitting,
    error,
    searchTerm,
    selectedSpecialty,
    activeTab,
    sampleAllTrainer: allTrainers[0] ? {
      id: allTrainers[0].id,
      is_active: allTrainers[0].is_active,
      first_name: allTrainers[0].first_name,
      specialitiesCount: allTrainers[0].specialities?.length || 0
    } : 'NO_ALL_TRAINERS',
    sampleFilteredTrainer: filteredTrainers[0] ? {
      id: filteredTrainers[0].id,
      is_active: filteredTrainers[0].is_active,
      first_name: filteredTrainers[0].first_name
    } : 'NO_FILTERED_TRAINERS'
  })
  
  // State for action dialogs
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false)
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false)
  const [trainerToDeactivate, setTrainerToDeactivate] = useState<TrainerProfile | null>(null)
  const [trainerToReactivate, setTrainerToReactivate] = useState<TrainerProfile | null>(null)
  const [trainerToDelete, setTrainerToDelete] = useState<TrainerProfile | null>(null)
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState('')
  
  // State for dropdown management to prevent focus conflicts
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  
  // Debug re-renders
  useEffect(() => {
    console.log('🔵 [COMPONENT] useEffect triggered - State changed:', {
      deactivateDialogOpen,
      reactivateDialogOpen,
      permanentDeleteDialogOpen,
      trainerToDeactivate: trainerToDeactivate?.id || null,
      trainerToReactivate: trainerToReactivate?.id || null,
      trainerToDelete: trainerToDelete?.id || null,
      openDropdownId,
      isSubmitting,
      filteredTrainersCount: filteredTrainers.length
    })
  }, [deactivateDialogOpen, reactivateDialogOpen, permanentDeleteDialogOpen, trainerToDeactivate, trainerToReactivate, trainerToDelete, openDropdownId, isSubmitting, filteredTrainers.length])
  
  // Get trainer counts for KPI cards
  const { total: totalInstructors, active: activeTrainers, inactive: inactiveTrainers, withExpertise, withExperience, withSocialLinks } = getTrainerCounts()
  
  // Get all unique specialities for filter dropdown
  const allSpecialities = getUniqueSpecialities()
  
  // Animation variants with proper typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };
  
  // Helper functions for UI
  const getStatusBadge = (trainer: TrainerProfile) => {
    if (trainer.is_active) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">{STATUS_TEXT.ACTIVE}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">{STATUS_TEXT.INACTIVE}</Badge>;
    }
  };

  const getTrainerName = (trainer: TrainerProfile) => {
    // Use first_name if available, otherwise fallback to user_id
    return trainer.first_name || `Trainer ${trainer.user_id.slice(0, 8)}`
  }

  const renderSpecialities = (specialities: { id: number; name: string }[]) => {
    if (!specialities || specialities.length === 0) {
      return <span className="text-muted-foreground">{UI_TEXT.NO_SPECIALITIES_LISTED}</span>
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {specialities.slice(0, 3).map((speciality) => (
          <Badge key={speciality.id} variant="secondary" className="text-xs bg-secondary/50 text-foreground">
            {speciality.name}
          </Badge>
        ))}
        {specialities.length > 3 && (
          <Badge variant="outline" className="text-xs bg-background border-border text-foreground">
            +{specialities.length - 3} more
          </Badge>
        )}
      </div>
    )
  }

  const renderExpertise = (expertise?: string) => {
    if (!expertise) return <span className="text-muted-foreground">{UI_TEXT.NO_EXPERTISE_LISTED}</span>
    
    // Split expertise by common delimiters and show as badges
    const skills = expertise.split(/[,;|]/).map(skill => skill.trim()).filter(Boolean)
    return (
      <div className="flex flex-wrap gap-1">
        {skills.slice(0, 3).map((skill, index) => (
          <Badge key={index} variant="outline" className="text-xs bg-background border-border text-foreground">{skill}</Badge>
        ))}
        {skills.length > 3 && (
          <Badge variant="outline" className="text-xs bg-background border-border text-foreground">+{skills.length - 3} more</Badge>
        )}
      </div>
    )
  }

  // Handler functions for trainer actions
  const handleDeactivateTrainer = useCallback((trainer: TrainerProfile) => {
    console.log('🔴 [DEACTIVATE] handleDeactivateTrainer called for:', trainer.id)
    
    if (isSubmitting) {
      console.log('🔴 [DEACTIVATE] Already submitting, ignoring request')
      return
    }
    
    setOpenDropdownId(null)
    setTimeout(() => {
      console.log('🔴 [DEACTIVATE] Opening deactivate dialog')
      setTrainerToDeactivate(trainer)
      setDeactivateDialogOpen(true)
    }, 150)
  }, [isSubmitting])

  const handleReactivateTrainer = useCallback((trainer: TrainerProfile) => {
    console.log('🟢 [REACTIVATE] handleReactivateTrainer called for:', trainer.id)
    
    if (isSubmitting) {
      console.log('🟢 [REACTIVATE] Already submitting, ignoring request')
      return
    }
    
    setOpenDropdownId(null)
    setTimeout(() => {
      console.log('🟢 [REACTIVATE] Opening reactivate dialog')
      setTrainerToReactivate(trainer)
      setReactivateDialogOpen(true)
    }, 150)
  }, [isSubmitting])

  const handlePermanentDeleteTrainer = useCallback((trainer: TrainerProfile) => {
    console.log('🔴 [PERMANENT_DELETE] handlePermanentDeleteTrainer called for:', trainer.id)
    
    if (isSubmitting) {
      console.log('🔴 [PERMANENT_DELETE] Already submitting, ignoring request')
      return
    }
    
    setOpenDropdownId(null)
    setTimeout(() => {
      console.log('🔴 [PERMANENT_DELETE] Opening permanent delete dialog')
      setTrainerToDelete(trainer)
      setPermanentDeleteDialogOpen(true)
    }, 150)
  }, [isSubmitting])

  // Confirm action handlers
  const confirmDeactivateTrainer = useCallback(async () => {
    console.log('🔴 [DEACTIVATE] confirmDeactivateTrainer called:', {
      trainerToDeactivate: trainerToDeactivate?.id || 'NULL',
      isSubmitting
    })
    
    if (!trainerToDeactivate || isSubmitting) {
      console.log('🔴 [DEACTIVATE] Cannot proceed - missing trainer or already submitting')
      return
    }
    
    try {
      console.log('🔴 [DEACTIVATE] Starting deactivation process for:', trainerToDeactivate.id)
      await deleteTrainer(trainerToDeactivate.id)
      
      console.log('🔴 [DEACTIVATE] Deactivation successful, closing dialog')
      setDeactivateDialogOpen(false)
      setTrainerToDeactivate(null)
      
    } catch (error) {
      console.error('🔴 [DEACTIVATE] Failed to deactivate trainer:', error)
      // Error handling is done in the hook
    }
  }, [trainerToDeactivate, isSubmitting, deleteTrainer])

  const confirmReactivateTrainer = useCallback(async () => {
    console.log('🟢 [REACTIVATE] confirmReactivateTrainer called:', {
      trainerToReactivate: trainerToReactivate?.id || 'NULL',
      isSubmitting
    })
    
    if (!trainerToReactivate || isSubmitting) {
      console.log('🟢 [REACTIVATE] Cannot proceed - missing trainer or already submitting')
      return
    }
    
    try {
      console.log('🟢 [REACTIVATE] Starting reactivation process for:', trainerToReactivate.id)
      await reactivateTrainer(trainerToReactivate.id)
      
      console.log('🟢 [REACTIVATE] Reactivation successful, closing dialog')
      setReactivateDialogOpen(false)
      setTrainerToReactivate(null)
      
    } catch (error) {
      console.error('🟢 [REACTIVATE] Failed to reactivate trainer:', error)
      // Error handling is done in the hook
    }
  }, [trainerToReactivate, isSubmitting, reactivateTrainer])

  const confirmPermanentDeleteTrainer = useCallback(async () => {
    console.log('🔴 [PERMANENT_DELETE] confirmPermanentDeleteTrainer called:', {
      trainerToDelete: trainerToDelete?.id || 'NULL',
      confirmText: permanentDeleteConfirm,
      isSubmitting
    })
    
    if (!trainerToDelete || isSubmitting) {
      console.log('🔴 [PERMANENT_DELETE] Cannot proceed - missing trainer or already submitting')
      return
    }

    if (permanentDeleteConfirm !== UI_TEXT.DELETE_CONFIRMATION_TEXT) {
      toast.error(UI_TEXT.DELETE_CONFIRMATION_ERROR)
      return
    }
    
    try {
      console.log('🔴 [PERMANENT_DELETE] Starting permanent deletion process for:', trainerToDelete.id)
      await permanentlyDeleteTrainer(trainerToDelete.id)
      
      console.log('🔴 [PERMANENT_DELETE] Permanent deletion successful, closing dialog')
      setPermanentDeleteDialogOpen(false)
      setTrainerToDelete(null)
      setPermanentDeleteConfirm('')
      
    } catch (error) {
      console.error('🔴 [PERMANENT_DELETE] Failed to permanently delete trainer:', error)
      // Error handling is done in the hook
    }
  }, [trainerToDelete, permanentDeleteConfirm, isSubmitting, permanentlyDeleteTrainer])

  // Cancel handlers
  const cancelDeactivateTrainer = useCallback(() => {
    if (isSubmitting) return
    setDeactivateDialogOpen(false)
    setTrainerToDeactivate(null)
  }, [isSubmitting])

  const cancelReactivateTrainer = useCallback(() => {
    if (isSubmitting) return
    setReactivateDialogOpen(false)
    setTrainerToReactivate(null)
  }, [isSubmitting])

  const cancelPermanentDeleteTrainer = useCallback(() => {
    if (isSubmitting) return
    setPermanentDeleteDialogOpen(false)
    setTrainerToDelete(null)
    setPermanentDeleteConfirm('')
  }, [isSubmitting])

  // Handle dropdown open change - optimized with useCallback
  const handleDropdownOpenChange = useCallback((trainerId: string) => {
    return (open: boolean) => {
      console.log('🟡 [DROPDOWN] onOpenChange called:', { trainerId, open })
      setOpenDropdownId(open ? trainerId : null)
    }
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageContainer className="min-h-screen" withPadding>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-foreground" />
                <span className="text-foreground">{UI_TEXT.LOADING_TRAINER_PROFILES}</span>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <PageContainer className="min-h-screen" withPadding>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">{UI_TEXT.ERROR_LOADING_TRAINERS}</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button 
                onClick={refreshTrainers} 
                variant="outline"
                className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="min-h-screen" withPadding>
        <motion.div 
          className="max-w-7xl mx-auto space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Glossy Hero Section */}
          <motion.div variants={itemVariants}>
            <GlossyHero
                          title={UI_TEXT.TRAINER_PROFILES_TITLE}
            subtitle={UI_TEXT.TRAINER_PROFILES_SUBTITLE}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90" 
                  asChild
                >
                  <Link href={ROUTES.CREATE_TRAINER}>
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{BUTTON_LABELS.ADD_NEW_TRAINER}</span>
                    <span className="sm:hidden">{ACTION_LABELS.ADD}</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground" 
                  onClick={refreshTrainers}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">{ACTION_LABELS.REFRESH}</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">{ACTION_LABELS.EXPORT_DATA}</span>
                  <span className="sm:hidden">{ACTION_LABELS.EXPORT}</span>
                </Button>
              </div>
            </GlossyHero>
          </motion.div>
          
          {/* KPI cards */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            variants={itemVariants}
          >
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{UI_TEXT.TOTAL_TRAINERS}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-foreground">{totalInstructors}</div>
                  <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {activeTrainers} active, {inactiveTrainers} inactive
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{UI_TEXT.WITH_EXPERTISE}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-foreground">{withExpertise}</div>
                  <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/30">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{UI_TEXT.WITH_EXPERIENCE}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-foreground">{withExperience}</div>
                  <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900/30">
                    <GraduationCap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{UI_TEXT.WITH_SOCIAL_LINKS}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-foreground">{withSocialLinks}</div>
                  <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900/30">
                    <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Filters and Table */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">{UI_TEXT.TRAINER_PROFILES_TITLE}</CardTitle>
                <CardDescription className="text-muted-foreground">{UI_TEXT.TRAINER_PROFILES_DESCRIPTION}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={UI_TEXT.SEARCH_PLACEHOLDER}
                      className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground">
                      <SelectValue placeholder={UI_TEXT.SPECIALITY_PLACEHOLDER} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="all" className="text-foreground">{UI_TEXT.ALL_SPECIALITIES}</SelectItem>
                      {allSpecialities.map(speciality => (
                        <SelectItem key={speciality} value={speciality} className="text-foreground">{speciality}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Tabs for trainer status */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-muted">
                    <TabsTrigger value="active" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                      {TAB_LABELS.ACTIVE_TRAINERS} ({activeTrainers})
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                      {TAB_LABELS.INACTIVE_TRAINERS} ({inactiveTrainers})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                      {TAB_LABELS.ALL_TRAINERS} ({totalInstructors})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {/* Trainer Table */}
                <div className="rounded-md border border-border bg-background">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="border-border">
                          <TableHead className="min-w-[200px] text-foreground">{TABLE_HEADERS.TRAINER}</TableHead>
                          <TableHead className="min-w-[200px] text-foreground">{UI_TEXT.BIO}</TableHead>
                          <TableHead className="min-w-[80px] text-foreground">{TABLE_HEADERS.STATUS}</TableHead>
                          <TableHead className="min-w-[200px] text-foreground">{TABLE_HEADERS.SPECIALITIES} & {TABLE_HEADERS.EXPERTISE}</TableHead>
                          <TableHead className="min-w-[150px] text-foreground">{UI_TEXT.TEACHING} {TABLE_HEADERS.EXPERIENCE}</TableHead>
                          <TableHead className="min-w-[150px] text-foreground">{UI_TEXT.LINKS}</TableHead>
                          <TableHead className="min-w-[80px] text-foreground">{TABLE_HEADERS.ACTIONS}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrainers.length > 0 ? (
                          filteredTrainers.map((trainer) => (
                            <TableRow key={trainer.id} className="hover:bg-muted/50 border-border">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={trainer.profile_image || "/placeholder-user.jpg"} alt={getTrainerName(trainer)} />
                                    <AvatarFallback className="bg-primary/10 text-primary">{getTrainerName(trainer).charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-foreground">{getTrainerName(trainer)}</div>
                                    {trainer.email && (
                                      <div className="text-xs text-muted-foreground">{trainer.email}</div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  {trainer.bio && (
                                    <div className="text-xs text-muted-foreground max-w-xs truncate">
                                      {trainer.bio}
                                    </div>
                                  )}
                                  {!trainer.bio && (
                                    <div className="text-xs text-muted-foreground italic">
                                      {UI_TEXT.NO_BIO_PROVIDED}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(trainer)}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-2">
                                  {renderSpecialities(trainer.specialities)}
                                  {trainer.expertise && renderExpertise(trainer.expertise)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  {trainer.total_years_teaching && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <Briefcase className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-foreground">{formatTeachingExperience(trainer.total_years_teaching)}</span>
                                    </div>
                                  )}
                                  {!trainer.total_years_teaching && (
                                    <div className="text-xs text-muted-foreground italic">
                                      {UI_TEXT.EXPERIENCE_NOT_SPECIFIED}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  {trainer.linkedin_url && (
                                    <a 
                                      href={trainer.linkedin_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                    >
                                      <Linkedin className="h-3 w-3" />
                                      <span>{UI_TEXT.LINKEDIN}</span>
                                      <ExternalLink className="h-2 w-2" />
                                    </a>
                                  )}
                                  {trainer.website && (
                                    <a 
                                      href={trainer.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                    >
                                      <Globe className="h-3 w-3" />
                                      <span>{UI_TEXT.WEBSITE}</span>
                                      <ExternalLink className="h-2 w-2" />
                                    </a>
                                  )}
                                  {trainer.social_links && Object.entries(trainer.social_links)
                                    .filter(([_, url]) => url && url.trim() !== '')
                                    .map(([platform, url]) => {
                                      // Get appropriate icon for each platform
                                      const getSocialIcon = (platform: string) => {
                                        switch (platform.toLowerCase()) {
                                          case 'linkedin': return <Linkedin className="h-3 w-3" />
                                          case 'github': return <Github className="h-3 w-3" />
                                          case 'twitter': return <Twitter className="h-3 w-3" />
                                          case 'facebook': return <Facebook className="h-3 w-3" />
                                          case 'instagram': return <Instagram className="h-3 w-3" />
                                          case 'youtube': return <Youtube className="h-3 w-3" />
                                          case 'website': return <Globe className="h-3 w-3" />
                                          default: return <Globe className="h-3 w-3" />
                                        }
                                      }
                                      
                                      return (
                                        <a 
                                          key={platform}
                                          href={url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                        >
                                          {getSocialIcon(platform)}
                                          <span className="capitalize">{platform}</span>
                                          <ExternalLink className="h-2 w-2" />
                                        </a>
                                      )
                                    })}
                                  {!trainer.linkedin_url && !trainer.website && (!trainer.social_links || Object.keys(trainer.social_links).length === 0) && (
                                    <div className="text-xs text-muted-foreground italic">
                                      No links provided
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu 
                                  open={openDropdownId === trainer.id}
                                  onOpenChange={handleDropdownOpenChange(trainer.id)}
                                >
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-foreground hover:bg-accent">
                                      <span className="sr-only">{UI_TEXT.OPEN_MENU}</span>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-background border-border">
                                    <DropdownMenuLabel className="text-foreground">{ACTION_LABELS.ACTIONS}</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                      <Link href={ROUTE_HELPERS.getTrainerDetailsRoute(trainer.id)} className="text-foreground">
                                        {ACTION_LABELS.VIEW_PROFILE}
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href={ROUTE_HELPERS.getEditTrainerRoute(trainer.id)} className="text-foreground">
                                        {ACTION_LABELS.EDIT_DETAILS}
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    
                                    {/* Action buttons based on trainer status */}
                                    {trainer.is_active ? (
                                      <DropdownMenuItem 
                                        className="text-orange-600 focus:text-orange-600" 
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          console.log('🔴 [DROPDOWN] Deactivate clicked for:', trainer.id)
                                          handleDeactivateTrainer(trainer)
                                        }}
                                        disabled={isSubmitting}
                                      >
                                        {isSubmitting ? STATUS_TEXT.PROCESSING : ACTION_LABELS.DEACTIVATE_TRAINER}
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem 
                                        className="text-green-600 focus:text-green-600" 
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          console.log('🟢 [DROPDOWN] Reactivate clicked for:', trainer.id)
                                          handleReactivateTrainer(trainer)
                                        }}
                                        disabled={isSubmitting}
                                      >
                                        {isSubmitting ? STATUS_TEXT.PROCESSING : ACTION_LABELS.REACTIVATE_TRAINER}
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {/* NOTE: Permanent Delete functionality is commented out for now as it's not required, 
                                         but it has been tested and the backend route is working properly */}
                                    {/* Super Admin only - Permanent Delete */}
                                    {/*
                                    <DropdownMenuItem 
                                      className="text-red-600 focus:text-red-600" 
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        console.log('🔴 [DROPDOWN] Permanent Delete clicked for:', trainer.id)
                                        handlePermanentDeleteTrainer(trainer)
                                      }}
                                      disabled={isSubmitting}
                                    >
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      {isSubmitting ? STATUS_TEXT.PROCESSING : ACTION_LABELS.PERMANENT_DELETE}
                                    </DropdownMenuItem>
                                    */}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                              {UI_TEXT.NO_TRAINERS_FOUND}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Deactivate Trainer Dialog */}
        <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
          <AlertDialogContent className="bg-background border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">{DIALOG_TEXT.DEACTIVATE_TITLE}</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {DIALOG_TEXT.DEACTIVATE_MESSAGE}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={cancelDeactivateTrainer}
                disabled={isSubmitting}
                className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {BUTTON_LABELS.CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeactivateTrainer}
                disabled={isSubmitting}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                {isSubmitting ? BUTTON_LABELS.DEACTIVATING_TRAINER : BUTTON_LABELS.DEACTIVATE_TRAINER}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reactivate Trainer Dialog */}
        <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
          <AlertDialogContent className="bg-background border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">{DIALOG_TEXT.REACTIVATE_TITLE}</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {DIALOG_TEXT.REACTIVATE_MESSAGE}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={cancelReactivateTrainer}
                disabled={isSubmitting}
                className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {BUTTON_LABELS.CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmReactivateTrainer}
                disabled={isSubmitting}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {isSubmitting ? BUTTON_LABELS.REACTIVATING_TRAINER : BUTTON_LABELS.REACTIVATE_TRAINER}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Permanent Delete Trainer Dialog */}
        <AlertDialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
          <AlertDialogContent className="bg-background border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {DIALOG_TEXT.PERMANENT_DELETE_TITLE}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground space-y-3">
                <p>
                  {DIALOG_TEXT.PERMANENT_DELETE_MESSAGE}
                </p>
                <p>{DIALOG_TEXT.PERMANENT_DELETE_SUBTITLE} <code className="bg-muted px-1 py-0.5 rounded text-sm">{UI_TEXT.DELETE_CONFIRMATION_TEXT}</code></p>
                <Input
                  type="text"
                  value={permanentDeleteConfirm}
                  onChange={(e) => setPermanentDeleteConfirm(e.target.value)}
                  className="border-red-300 focus:border-red-500"
                  placeholder={DIALOG_TEXT.PLACEHOLDER_DELETE_CONFIRM}
                  disabled={isSubmitting}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={cancelPermanentDeleteTrainer}
                disabled={isSubmitting}
                className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {BUTTON_LABELS.CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmPermanentDeleteTrainer}
                disabled={isSubmitting || permanentDeleteConfirm !== UI_TEXT.DELETE_CONFIRMATION_TEXT}
                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? BUTTON_LABELS.DELETING_TRAINER : BUTTON_LABELS.DELETE_TRAINER}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageContainer>
    </div>
  );
})

export default TrainersClient;
