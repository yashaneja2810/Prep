"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import {
  Search,
  Download,
  Filter,
  Users,
  UserX,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  School,
  AlertTriangle,
  CheckCircle2,
  Building,
  X,
  Plus,
  MoreVertical,
  FileText,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { AdminLearnersTable } from "@/components/ui/admin-learners-table";
import { LearnerStatusBadge } from "@/components/ui/learner-status-badge";
import { LearnerDetailsModal } from "./learner-details-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { LearnerActions } from "./learner-actions";

// Hooks and stores
import { useLearners } from "@/hooks/useLearners";
import { useLearnersStore, StatusFilter, TypeFilter } from "@/store/slices/learners";
import { LearnerProfile } from "@/lib/types/learner";
import { useLearnersPerformance, usePerformanceMonitoring } from "@/hooks/use-learners-performance";

// Helper functions
import { formatLearnerStatus, formatLearnerType, getLearnerDisplayName } from "@/lib/api/learners";
import { ROUTES } from "@/helpers/string_const";

interface LearnersPageClientProps {
  // No props needed since we're using SWR and store
}

export default function sLearnersPageClient({}: LearnersPageClientProps) {
  const router = useRouter();
  
  // Performance monitoring
  usePerformanceMonitoring('LearnersPageClient');
  
  // SWR data fetching
  const { learners: allLearners, error: fetchError, isLoading: isFetching, mutate } = useLearners();
  
  // Store state and actions
  const {
    selectedLearner,
    searchTerm,
    statusFilter,
    learnerTypeFilter,
    isLoading: storeLoading,
    error: storeError,
    setSearchTerm,
    setStatusFilter,
    setLearnerTypeFilter,
    resetFilters,
    setSelectedLearner,
  } = useLearnersStore();

  // Filter out learners with completely missing data and add validation
  const validLearners = useMemo(() => {
    return (allLearners || []).filter((learner) => {
      // Basic validation - learner must have an ID
      return learner && learner.id;
    });
  }, [allLearners]);

  const invalidLearnersCount = useMemo(() => {
    return (allLearners || []).length - validLearners.length;
  }, [allLearners, validLearners.length]);

  // Performance optimized filtering and stats
  const {
    filteredLearners,
    learnersStats: stats,
    isSearching,
    debouncedSearchTerm,
  } = useLearnersPerformance({
    learners: validLearners,
    searchTerm,
    statusFilter,
    learnerTypeFilter,
    debounceMs: 300,
    enableMetrics: process.env.NODE_ENV === 'development',
  });

  // Local state for UI
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");

  

  // Combined loading and error states
  const isLoading = isFetching || storeLoading;
  const error = fetchError ? (typeof fetchError === 'string' ? fetchError : fetchError.message || 'Failed to load data') : storeError;

  // Handle tab changes
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as StatusFilter);
    setStatusFilter(tab as StatusFilter);
  }, [setStatusFilter]);

  // Handle learner selection
  const handleLearnerSelect = useCallback((learner: LearnerProfile) => {
    setSelectedLearner(learner);
    setShowDetailsModal(true);
  }, [setSelectedLearner]);

  // Handle add learner button
  const handleAddLearner = useCallback(() => {
    router.push(ROUTES.ADD_LEARNERS);
  }, [router]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // Animation variants
  const containerVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }), []);

  const itemVariants: Variants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }), []);

  return (
    <PageContainer>
      <motion.div 
        className="container p-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Glossy Hero Section */}
        <GlossyHero
          title="Learner Management"
          subtitle="Manage learner profiles, track progress, and oversee student operations"
        >
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleAddLearner}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Learner</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </GlossyHero>

        {/* Error Alert */}
        {error && (
          <motion.div variants={itemVariants}>
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Invalid Learners Warning */}
        {invalidLearnersCount > 0 && (
          <motion.div variants={itemVariants}>
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Warning: {invalidLearnersCount} learner record{invalidLearnersCount > 1 ? 's' : ''} 
                {invalidLearnersCount > 1 ? ' have' : ' has'} incomplete data and 
                {invalidLearnersCount > 1 ? ' are' : ' is'} not displayed. 
                Contact system administrator if this persists.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Statistics Cards (Total, Active, Inactive) */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-7 w-16" /> : stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                All registered learners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? <Skeleton className="h-7 w-16" /> : stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? <Skeleton className="h-7 w-16" /> : stats.inactive}
              </div>
              <p className="text-xs text-muted-foreground">
                Deactivated learners
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      {isSearching && (
                        <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      <Input
                        placeholder="Search learners by name, email, or goals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-8"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                {/* Learner Type Filter */}
                <Select value={learnerTypeFilter || "all"} onValueChange={(value) => setLearnerTypeFilter(value as TypeFilter)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Learner Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="professional">Professionals</SelectItem>
                  </SelectContent>
                </Select>

                {/* Reset Filters */}
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Learners Table with Status Tabs */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Learners</CardTitle>
                <Badge variant="secondary">
                  {filteredLearners?.length || 0} learners
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">
                    All ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active ({stats.active})
                  </TabsTrigger>
                  <TabsTrigger value="inactive">
                    Inactive ({stats.inactive})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab || "all"} className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredLearners && filteredLearners.length > 0 ? (
                    <AdminLearnersTable
                      learners={filteredLearners}
                      onRowClick={handleLearnerSelect}
                      loading={isLoading}
                      actionComponent={(learner) => (
                        <LearnerActions
                          learner={learner}
                          onView={handleLearnerSelect}
                          disabled={isLoading}
                          onRefresh={mutate}
                        />
                      )}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground mb-2">
                        No learners found
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== 'all' || learnerTypeFilter !== 'all'
                          ? "Try adjusting your filters or search terms"
                          : "Get started by adding your first learner"
                        }
                      </p>
                      {!searchTerm && statusFilter === 'all' && learnerTypeFilter === 'all' && (
                        <Button onClick={handleAddLearner}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Learner
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>



      {/* Learner Details Modal */}
      {showDetailsModal && selectedLearner && (
        <LearnerDetailsModal
          learner={selectedLearner}
          open={showDetailsModal}
          onOpenChange={(open) => {
            setShowDetailsModal(open);
            if (!open) setSelectedLearner(null);
          }}
          onEdit={() => {
            mutate(); // Refresh the data after any edit
          }}
        />
      )}
    </PageContainer>
  );
}

// Export the Student type for backward compatibility (can be removed later)
export type Student = LearnerProfile; 