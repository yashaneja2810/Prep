"use client";

import { notFound, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Edit3, Share2, Download, Eye, Users, Calendar, MapPin, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageContainer } from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { useTrainers } from "@/hooks/store";
import { TrainerProfile } from "@/store/slices/trainers";
import { toast } from "sonner";
import { ROUTES, ROUTE_HELPERS } from "@/helpers/string_const";
import { TrainerDetailsView } from "./trainer-details-view";

interface TrainerDetailsPageClientProps {
  profileId: string;
}

// Enhanced loading component with better animations
function DetailsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="h-8 w-64 bg-muted rounded-md animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Profile Header Skeleton */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-64 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded-md animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
              <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
                  <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
                </div>
                <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded-md animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-4/6 bg-muted rounded-md animate-pulse" />
            </CardContent>
          </Card>

          {/* Expertise Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-5 w-40 bg-muted rounded-md animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Contact Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded-md animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function TrainerDetailsPageClient({ profileId }: TrainerDetailsPageClientProps) {
  const router = useRouter();

  // API hooks
  const { getTrainerById, deleteTrainer, isSubmitting } = useTrainers();
  
  // Local state
  const [trainerData, setTrainerData] = useState<TrainerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch trainer data
  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTrainerById(profileId);
        setTrainerData(data);
      } catch (error) {
        console.error('Failed to fetch trainer data:', error);
        setError('Failed to load trainer data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainerData();
  }, []);

  // Handle delete trainer
  const handleDelete = async () => {
    if (!trainerData) return;
    
    try {
      await deleteTrainer(trainerData.id);
      toast.success('Trainer profile deleted successfully');
      router.push(ROUTES.TRAINERS);
    } catch (error) {
      console.error('Failed to delete trainer:', error);
      toast.error('Failed to delete trainer profile');
    }
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
          className="max-w-7xl mx-auto space-y-6"
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
                  <span className="hidden sm:inline text-foreground">Back to Trainers</span>
                  <span className="sm:hidden text-foreground">Back</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="h-10 px-4 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors" 
                asChild
              >
                <Link href={ROUTE_HELPERS.getEditTrainerRoute(profileId)}>
                  <Edit3 className="h-4 w-4 mr-2 text-foreground" />
                  <span className="hidden sm:inline text-foreground">Edit Profile</span>
                  <span className="sm:hidden text-foreground">Edit</span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                className="h-10 px-4 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2 text-foreground" />
                <span className="hidden sm:inline text-foreground">Share</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                className="h-10 px-4 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Download className="h-4 w-4 mr-2 text-foreground" />
                <span className="hidden sm:inline text-foreground">Export</span>
              </Button>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Trainer Profile Details
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                View comprehensive trainer information and manage profile settings
              </p>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div variants={itemVariants}>
            {/* Loading State */}
            {isLoading ? (
              <DetailsLoading />
            ) : error ? (
              /* Error State */
              <Card className="bg-card border-border">
                <CardContent className="p-8 sm:p-12">
                  <div className="text-center max-w-md mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Error Loading Trainer</h3>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline"
                        className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                      <Button 
                        asChild
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Link href={ROUTES.TRAINERS}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Trainers
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : trainerData ? (
              /* Success State */
              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-0">
                  <TrainerDetailsView 
                    profileId={profileId}
                    trainer={trainerData}
                    onEdit={() => router.push(ROUTE_HELPERS.getEditTrainerRoute(profileId))}
                    onDelete={handleDelete}
                    loading={isSubmitting}
                  />
                </CardContent>
              </Card>
            ) : (
              /* No Data State */
              <Card className="bg-card border-border">
                <CardContent className="p-8 sm:p-12">
                  <div className="text-center max-w-md mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">No Trainer Found</h3>
                    <p className="text-muted-foreground mb-6">The trainer profile you're looking for doesn't exist.</p>
                    <Button 
                      asChild
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Link href={ROUTES.TRAINERS}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Trainers
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </PageContainer>
    </div>
  );
} 