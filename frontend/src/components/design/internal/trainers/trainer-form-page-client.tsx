"use client";

import { notFound, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Edit3, Save, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/page-container";
import { useTrainers } from "@/hooks/store";
import { TrainerProfile } from "@/store/slices/trainers";
import { toast } from "sonner";
import { 
  CreateTrainerProfileFormData, 
  UpdateTrainerProfileFormData 
} from "@/helpers/validation/trainer-profile";
import { ROUTES, PAGE_TITLES, PAGE_DESCRIPTIONS, UI_TEXT } from "@/helpers/string_const";
import { TrainerForm } from "./trainer-form";

interface TrainerFormPageClientProps {
  profileId?: string;
  userId?: string;
  isEditMode: boolean;
}

// Enhanced loading component with better animations
function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="h-8 w-80 bg-muted rounded-md animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Form skeleton */}
      <Card className="bg-card border-border">
        <CardHeader className="space-y-4">
          <div className="h-6 w-48 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded-md animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="h-5 w-40 bg-muted rounded-md animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
                  <div className="h-11 bg-muted rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-6">
            <div className="h-5 w-32 bg-muted rounded-md animate-pulse" />
            <div className="h-32 bg-muted rounded-md animate-pulse" />
          </div>

          {/* Professional Information Section */}
          <div className="space-y-6">
            <div className="h-5 w-48 bg-muted rounded-md animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
                  <div className="h-11 bg-muted rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
            <div className="h-11 bg-muted rounded-md animate-pulse" />
            <div className="h-11 bg-muted rounded-md animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TrainerFormPageClient({ profileId, userId, isEditMode }: TrainerFormPageClientProps) {
  // Navigation and API hooks
  const router = useRouter();
  const { 
    createTrainer, 
    updateTrainer, 
    getTrainerById,
    isSubmitting
  } = useTrainers();

  // Local state for edit mode data
  const [trainerData, setTrainerData] = useState<TrainerProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch trainer data for edit mode
  useEffect(() => {
    if (isEditMode && profileId) {
      const fetchTrainerData = async () => {
        try {
          setIsLoadingData(true);
          setDataError(null);
          const data = await getTrainerById(profileId);
          setTrainerData(data);
        } catch (error) {
          console.error('Failed to fetch trainer data:', error);
          setDataError('Failed to load trainer data. Please try again.');
          toast.error('Failed to load trainer data');
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchTrainerData();
    }
  }, []);

  // Handle form submission
  const handleFormSubmit = async (data: CreateTrainerProfileFormData | UpdateTrainerProfileFormData) => {
    try {
      if (isEditMode && profileId) {
        // Edit mode - update existing trainer
        // Remove email from update data as per migration docs - only send fields being updated
        const { email, ...updateData } = data as any;
        await updateTrainer(profileId, updateData as UpdateTrainerProfileFormData);
        toast.success('Trainer profile updated successfully!');
        router.push(ROUTES.TRAINERS);
      } else {
        // Create mode - create new trainer
        const createData = data as CreateTrainerProfileFormData;
        const { email, ...profileData } = createData;
        await createTrainer(email, profileData);
        toast.success('Trainer profile created successfully!');
        router.push(ROUTES.TRAINERS);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(isEditMode ? 'Failed to update trainer profile' : 'Failed to create trainer profile');
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    router.push(ROUTES.TRAINERS);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

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
  };

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="min-h-screen" withPadding>
        <motion.div 
          className="max-w-5xl mx-auto space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="h-10 px-4 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors" 
                asChild
              >
                <Link href={ROUTES.TRAINERS}>
                  <ArrowLeft className="h-4 w-4 mr-2 text-foreground" />
                  <span className="hidden sm:inline text-foreground">{UI_TEXT.BACK_TO_TRAINERS}</span>
                  <span className="sm:hidden text-foreground">Back</span>
                </Link>
              </Button>
              
              <Badge 
                variant={isEditMode ? "default" : "secondary"} 
                className={`flex items-center gap-2 px-3 py-1.5 font-medium ${
                  isEditMode 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {isEditMode ? (
                  <>
                    <Edit3 className="h-3 w-3" />
                    <span>{UI_TEXT.EDIT_MODE}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3" />
                    <span>{UI_TEXT.CREATE_MODE}</span>
                  </>
                )}
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {isEditMode ? PAGE_TITLES.EDIT_TRAINER : PAGE_TITLES.CREATE_TRAINER}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                {isEditMode 
                  ? PAGE_DESCRIPTIONS.UPDATE_PROFILE_CHANGES
                  : PAGE_DESCRIPTIONS.FILL_DETAILS_CREATE
                }
              </p>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border bg-muted/25">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  {isEditMode ? (
                    <>
                      <Edit3 className="h-5 w-5 text-primary" />
                      {UI_TEXT.UPDATE_TRAINER_INFORMATION}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 text-primary" />
                      {UI_TEXT.NEW_TRAINER_INFORMATION}
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {isEditMode 
                    ? PAGE_DESCRIPTIONS.MODIFY_PROFILE_DETAILS 
                    : PAGE_DESCRIPTIONS.COMPLETE_REQUIRED_FIELDS
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <Suspense fallback={<div className="p-8"><FormSkeleton /></div>}>
                  <div className="p-6 sm:p-8">
                    {/* Show loading state while fetching data in edit mode */}
                    {isEditMode && isLoadingData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Loading trainer data...</span>
                        </div>
                      </div>
                    ) : isEditMode && dataError ? (
                      <div className="text-center py-12 max-w-md mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                          <X className="h-8 w-8 text-destructive" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">Failed to Load</h3>
                        <p className="text-muted-foreground mb-6">{dataError}</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                          <Button 
                            onClick={() => window.location.reload()} 
                            variant="outline"
                            className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            Try Again
                          </Button>
                          <Button 
                            asChild
                                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                                                  <Link href={ROUTES.TRAINERS}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {UI_TEXT.BACK_TO_TRAINERS}
                          </Link>
                      </Button>
                        </div>
                      </div>
                    ) : (
                      <TrainerForm 
                        mode={isEditMode ? "edit" : "create"}
                        profileId={profileId || undefined}
                        initialData={trainerData || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                        loading={isSubmitting}
                      />
                    )}
                  </div>
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </PageContainer>
    </div>
  );
} 