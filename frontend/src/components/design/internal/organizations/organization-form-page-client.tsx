"use client";

import { OrganizationForm } from "@/components/design/internal/organizations/organization-form";
import { notFound, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Building, Edit3, Save, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/page-container";
import { useOrganization, useOrganizationsMutations } from "@/hooks/useOrganizations";
import { Organization, getOrganizationById } from "@/lib/api/organizations";
import { toast } from "sonner";
import { 
  CreateOrganizationProfileFormData, 
  UpdateOrganizationProfileFormData 
} from "@/helpers/validation/organization-profile";
import { API_MESSAGES, ROUTES } from "@/helpers/string_const";

interface OrganizationFormPageClientProps {
  organizationId?: string;
  isEditMode: boolean;
}

export default function OrganizationFormPageClient({ organizationId, isEditMode }: OrganizationFormPageClientProps) {
  const router = useRouter();
  const [organizationData, setOrganizationData] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  // Hooks for API operations
  const { 
    organization: fetchedOrganization, 
    isLoading: isFetchingOrganization, 
    error: fetchError 
  } = useOrganization(isEditMode ? organizationId || null : null);
  
  const { 
    createOrganization, 
    updateOrganization, 
    isSubmitting 
  } = useOrganizationsMutations();

  // Load organization data for edit mode
  useEffect(() => {
    if (isEditMode && organizationId) {
      setIsLoading(isFetchingOrganization);
      
      if (fetchError) {
        setError('Failed to load organization data');
        setOrganizationData(null);
      } else if (fetchedOrganization) {
        setOrganizationData(fetchedOrganization);
        setError(null);
      }
    } else {
      setIsLoading(false);
      setOrganizationData(null);
      setError(null);
    }
  }, [isEditMode, organizationId, fetchedOrganization, isFetchingOrganization, fetchError]);

  // Handle form submission
  const handleFormSubmit = async (data: CreateOrganizationProfileFormData | UpdateOrganizationProfileFormData) => {
    try {
      if (isEditMode && organizationId) {
        // Edit mode - update existing organization
        await updateOrganization(organizationId, data as UpdateOrganizationProfileFormData);
        router.push(ROUTES.ORGANIZATIONS);
      } else {
        // Create mode - create new organization
        await createOrganization(data as CreateOrganizationProfileFormData);
        router.push(ROUTES.ORGANIZATIONS);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Error toasts are handled by the mutations, no need to show additional ones
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    router.push(ROUTES.ORGANIZATIONS);
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
      <PageContainer>
        <motion.div 
          className="container p-6 max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Navigation Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" asChild className="hover:bg-white/50 dark:hover:bg-slate-800/50">
                <Link href={ROUTES.ORGANIZATIONS}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Organizations
                </Link>
              </Button>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center gap-2">
                {isEditMode ? (
                  <Edit3 className="h-5 w-5 text-green-600" />
                ) : (
                  <Building className="h-5 w-5 text-blue-600" />
                )}
                <h1 className="text-lg font-semibold text-foreground">
                  {isEditMode ? 'Edit Organization' : 'Create New Organization'}
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-0">
                <Suspense fallback={
                  <div className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <p className="text-muted-foreground">
                        {isEditMode ? 'Loading organization data...' : 'Preparing form...'}
                      </p>
                    </div>
                  </div>
                }>
                  <div className="p-6">
                    {error ? (
                      <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                          <div className="rounded-full w-16 h-16 bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Organization</h3>
                          <p className="text-muted-foreground mb-6">{error}</p>
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
                              <Link href={ROUTES.ORGANIZATIONS}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Organizations
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <p className="text-muted-foreground">Loading organization data...</p>
                        </div>
                      </div>
                    ) : (
                      <OrganizationForm 
                        mode={isEditMode ? "edit" : "create"}
                        organizationId={organizationId || undefined}
                        initialData={organizationData || undefined}
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