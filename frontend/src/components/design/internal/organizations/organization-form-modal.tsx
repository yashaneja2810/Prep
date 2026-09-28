"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, AlertCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrganizationForm } from "@/components/design/internal/organizations/organization-form";
import { useOrganizations, useOrganizationsMutations } from "@/hooks/useOrganizations";
import { Organization } from "@/lib/api/organizations";
import { 
  CreateOrganizationProfileFormData, 
  UpdateOrganizationProfileFormData 
} from "@/helpers/validation/organization-profile";

interface OrganizationFormModalProps {
  organizationId?: string;
  isEditMode: boolean;
}

export default function OrganizationFormModal({ organizationId, isEditMode }: OrganizationFormModalProps) {
  const router = useRouter();
  const [organizationData, setOrganizationData] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  // Hooks for API operations
  const { organizations } = useOrganizations();
  const { 
    createOrganization, 
    updateOrganization, 
    isSubmitting 
  } = useOrganizationsMutations();

  // Load organization data for edit mode
  useEffect(() => {
    if (isEditMode && organizationId) {
      const fetchOrganization = async () => {
        try {
          setIsLoading(true);
          
          // First try to find in the cached organizations
          const cachedOrganization = organizations.find(org => org.id === organizationId);
          if (cachedOrganization) {
            setOrganizationData(cachedOrganization);
            setIsLoading(false);
            return;
          }
          
          // If not found in cache, show error
          setError('Organization not found');
          setIsLoading(false);
        } catch (err) {
          console.error('Failed to load organization:', err);
          setError('Failed to load organization data');
          setIsLoading(false);
        }
      };

      fetchOrganization();
    } else {
      setIsLoading(false);
    }
  }, [isEditMode, organizationId, organizations]);

  // Handle form submission
  const handleFormSubmit = async (data: CreateOrganizationProfileFormData | UpdateOrganizationProfileFormData) => {
    try {
      if (isEditMode && organizationId) {
        // Edit mode - update existing organization
        await updateOrganization(organizationId, data as UpdateOrganizationProfileFormData);
        handleClose();
      } else {
        // Create mode - create new organization
        await createOrganization(data as CreateOrganizationProfileFormData);
        handleClose();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Error toasts are handled by the mutations, no need to show additional ones
    }
  };

  // Handle modal close
  const handleClose = () => {
    setOpen(false);
    // Small delay to allow animation to complete before navigation
    setTimeout(() => {
      router.back();
    }, 150);
  };

  // Handle cancel action
  const handleCancel = () => {
    handleClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden border-border bg-background">
            <DialogHeader className="px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold text-foreground">
                  {isEditMode ? 'Edit Organization' : 'Create New Organization'}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="rounded-full h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6 pb-6 bg-background">
              {error ? (
                <div className="py-12">
                  <div className="max-w-md mx-auto">
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error}
                      </AlertDescription>
                    </Alert>
                    <div className="text-center">
                      <div className="rounded-full w-16 h-16 bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Organization</h3>
                      <p className="text-muted-foreground mb-6">Unable to load the organization data. Please try again.</p>
                      <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Button 
                          onClick={() => window.location.reload()} 
                          variant="outline"
                          className="border-border hover:bg-accent hover:text-accent-foreground"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                        <Button 
                          onClick={handleClose}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full w-16 h-16 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-1">Loading Organization</h3>
                      <p className="text-muted-foreground">Please wait while we fetch the organization data...</p>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="py-6"
                >
                  <OrganizationForm 
                    mode={isEditMode ? "edit" : "create"}
                    organizationId={organizationId || undefined}
                    initialData={organizationData || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                    loading={isSubmitting}
                    className="max-w-none"
                    hideActions={true}
                    formId="organization-form"
                  />
                </motion.div>
              )}
            </ScrollArea>
            
            {!error && !isLoading && (
              <DialogFooter className="px-6 py-4 border-t border-border bg-card">
                <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    form="organization-form"
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isEditMode ? 'Update Organization' : 'Create Organization'}
                  </Button>
                </div>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 