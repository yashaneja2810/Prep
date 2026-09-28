"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  UserPlus,
  Users,
  ArrowLeft,
  Building2,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  Send,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlossyHero } from "@/components/ui/glossy-hero";
import { PageContainer } from "@/components/page-container";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

// Import the API functions and types
import { 
  getOrganizationById, 
  addUserToOrganization, 
  bulkAddUsersToOrganization,
  Organization,
  AddUserToOrganizationData,
  BulkAddUsersToOrganizationData,
  BulkOperationResponse 
} from '@/lib/api/organizations';

// Import string constants
import {
  ORGANIZATION_UI_TEXT,
  API_MESSAGES,
  ROUTE_HELPERS,
} from '@/helpers/string_const';

interface AddUsersPageProps {}

export default function AddUsersPage({}: AddUsersPageProps) {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  // State management
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  
  // Results state
  const [lastResult, setLastResult] = useState<BulkOperationResponse | null>(null);

  // Fetch organization data on component mount
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const orgData = await getOrganizationById(organizationId);
        setOrganization(orgData);
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError('Failed to load organization details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      fetchOrganization();
    }
  }, [organizationId]);

  // Handle single user submission
  const handleSingleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!singleEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setLastResult(null);
      
      await addUserToOrganization(organizationId, { email: singleEmail.trim() });
      
      toast({
        title: "Success",
        description: ORGANIZATION_UI_TEXT.USER_ADDED_SUCCESS,
        variant: "default",
      });
      
      // Clear form and redirect after success
      setSingleEmail('');
      setTimeout(() => {
        router.push(ROUTE_HELPERS.getOrganizationUsersRoute(organizationId));
      }, 1500);
      
    } catch (err: any) {
      console.error('Error adding user:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bulk users submission
  const handleBulkUsersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkEmails.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    // Parse emails from textarea (comma-separated)
    const emailList = bulkEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setLastResult(null);
      
      const result = await bulkAddUsersToOrganization(organizationId, { emails: emailList });
      setLastResult(result);
      
      if (result.failed === 0) {
        toast({
          title: "Success",
          description: ORGANIZATION_UI_TEXT.USERS_ADDED_SUCCESS,
          variant: "default",
        });
        
        // Clear form and redirect after complete success
        setBulkEmails('');
        setTimeout(() => {
          router.push(ROUTE_HELPERS.getOrganizationUsersRoute(organizationId));
        }, 2000);
        
      } else if (result.successful > 0) {
        toast({
          title: "Partial Success",
          description: ORGANIZATION_UI_TEXT.SOME_USERS_FAILED,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "No users could be added. Please check the email addresses.",
          variant: "destructive",
        });
      }
      
    } catch (err: any) {
      console.error('Error adding users:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
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

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading organization details...</p>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <div className="container p-6 max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  if (!organization) {
    return (
      <PageContainer>
        <div className="container p-6 max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Organization not found.</AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div 
        className="container p-6 max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Glossy Hero Section */}
        <GlossyHero
          title={ORGANIZATION_UI_TEXT.ADD_USERS_TITLE}
          subtitle={ORGANIZATION_UI_TEXT.ADD_USERS_SUBTITLE}
        >
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(ROUTE_HELPERS.getOrganizationUsersRoute(organizationId))}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{ORGANIZATION_UI_TEXT.BACK_TO_USERS}</span>
            </Button>
          </div>
        </GlossyHero>

        {/* Organization Info Card */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={organization.logo_url || undefined} alt={organization.org_name} />
                  <AvatarFallback>
                    <Building2 className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{organization.org_name}</CardTitle>
                  <CardDescription>
                    {organization.code} • {organization.industry || 'Industry not specified'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Add Users Form */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add Users to Organization
              </CardTitle>
              <CardDescription>
                Choose whether to add a single user or multiple users at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'single' | 'bulk')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {ORGANIZATION_UI_TEXT.SINGLE_USER_TAB}
                  </TabsTrigger>
                  <TabsTrigger value="bulk" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {ORGANIZATION_UI_TEXT.BULK_USERS_TAB}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="single" className="mt-6">
                  <form onSubmit={handleSingleUserSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="single-email">{ORGANIZATION_UI_TEXT.EMAIL_ADDRESS}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="single-email"
                          type="email"
                          placeholder={ORGANIZATION_UI_TEXT.SINGLE_USER_EMAIL_PLACEHOLDER}
                          value={singleEmail}
                          onChange={(e) => setSingleEmail(e.target.value)}
                          className="pl-9"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !singleEmail.trim()}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {ORGANIZATION_UI_TEXT.ADDING_USER}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {ORGANIZATION_UI_TEXT.ADD_USER_BUTTON}
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="bulk" className="mt-6">
                  <form onSubmit={handleBulkUsersSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-emails">{ORGANIZATION_UI_TEXT.EMAIL_ADDRESSES}</Label>
                      <p className="text-sm text-muted-foreground">
                        {ORGANIZATION_UI_TEXT.EMAIL_ADDRESSES_DESCRIPTION}
                      </p>
                      <Textarea
                        id="bulk-emails"
                        placeholder={ORGANIZATION_UI_TEXT.BULK_USERS_EMAIL_PLACEHOLDER}
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                        rows={6}
                        disabled={isSubmitting}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !bulkEmails.trim()}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {ORGANIZATION_UI_TEXT.ADDING_USERS}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {ORGANIZATION_UI_TEXT.ADD_USERS_BUTTON}
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Bulk Operation Results */}
          {lastResult && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <CheckCircle className="h-5 w-5" />
                  Operation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {lastResult.total_attempted}
                    </div>
                    <div className="text-xs text-muted-foreground">Attempted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {lastResult.successful}
                    </div>
                    <div className="text-xs text-muted-foreground">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {lastResult.failed}
                    </div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                </div>
                
                {lastResult.failed_users.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-700 dark:text-red-300">Failed Users:</h4>
                    <div className="space-y-1">
                      {lastResult.failed_users.map((failedUser, index) => (
                        <div key={index} className="text-sm bg-red-100 dark:bg-red-950/30 p-2 rounded border-l-4 border-red-500">
                          <div className="font-medium">{failedUser.email}</div>
                          <div className="text-red-600 dark:text-red-400">{failedUser.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </PageContainer>
  );
} 