"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Download,
  Filter,
  Building,
  UserPlus,
  Globe,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  Clock,
  Plus,
  MoreVertical,
  Award,
  FileCheck,
  Link2,
  CheckSquare,
  Building2,
  AlertCircle,
  Loader2,
  ExternalLink,
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
import { PageContainer } from "@/components/page-container";
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "@/components/ui/alert-dialog";

// Import the API hooks and types
import { useOrganizations, useOrganizationsMutations, useOrganizationsPaginated } from '@/hooks/useOrganizations';
import { Organization, formatOrganizationType, formatAddress } from '@/lib/api/organizations';

// Import string constants
import {
  ROUTES,
  ROUTE_HELPERS,
  ORGANIZATION_UI_TEXT,
  ORGANIZATION_STATUS,
  ORGANIZATION_TYPES,
  ORGANIZATION_ACTION_LABELS,
  ORGANIZATION_DIALOG_TEXT,
  ORGANIZATION_TABLE_COLUMNS,
  type OrganizationStatusFilter,
  type OrganizationTabFilter,
} from '@/helpers/string_const';

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
} as const;

const STATUS_CONFIG = {
  active: {
    label: ORGANIZATION_UI_TEXT.ACTIVE_BADGE,
    className: "bg-green-500 text-white",
    icon: CheckSquare,
  },
  inactive: {
    label: ORGANIZATION_UI_TEXT.INACTIVE_BADGE,
    className: "bg-red-500 text-white",
    icon: AlertCircle,
  },
} as const;

const KPI_CARD_CONFIG = [
  {
    title: ORGANIZATION_UI_TEXT.TOTAL_ORGANIZATIONS,
    key: 'totalOrganizations' as const,
    icon: Building,
    className: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    title: ORGANIZATION_UI_TEXT.ACTIVE_ORGANIZATIONS,
    key: 'activeOrganizations' as const,
    icon: CheckSquare,
    className: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  {
    title: ORGANIZATION_UI_TEXT.HIRING_ORGANIZATIONS,
    key: 'hiringOrganizations' as const,
    icon: UserPlus,
    className: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    title: ORGANIZATION_UI_TEXT.TRAINING_ORGANIZATIONS,
    key: 'trainingOrganizations' as const,
    icon: Award,
    className: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  {
    title: ORGANIZATION_UI_TEXT.CURRENTLY_HIRING,
    key: 'currentlyHiring' as const,
    icon: Briefcase,
    className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  },
] as const;

const TAB_CONFIG = [
  { value: 'all', label: ORGANIZATION_UI_TEXT.ALL_ORGANIZATIONS },
  { value: 'training', label: ORGANIZATION_UI_TEXT.TRAINING },
  { value: 'recruiting', label: ORGANIZATION_UI_TEXT.RECRUITING },
  { value: 'not-recruiting', label: ORGANIZATION_UI_TEXT.NOT_RECRUITING },
] as const;

const STATUS_FILTER_OPTIONS = [
  { value: ORGANIZATION_STATUS.ALL, label: ORGANIZATION_UI_TEXT.ALL_STATUS },
  { value: ORGANIZATION_STATUS.ACTIVE, label: ORGANIZATION_UI_TEXT.ACTIVE_BADGE },
  { value: ORGANIZATION_STATUS.INACTIVE, label: ORGANIZATION_UI_TEXT.INACTIVE_BADGE },
] as const;

// Custom Hooks for Modular Logic
const useOrganizationFiltering = (organizations: Organization[]) => {
  return useMemo(() => {
    const safeOrganizations = Array.isArray(organizations) ? organizations : [];
    return {
      totalOrganizations: safeOrganizations.length,
      activeOrganizations: safeOrganizations.filter(org => org.is_active).length,
      inactiveOrganizations: safeOrganizations.filter(org => !org.is_active).length,
      hiringOrganizations: safeOrganizations.filter(org => org.type === ORGANIZATION_TYPES.HIRING).length,
      trainingOrganizations: safeOrganizations.filter(org => org.type === ORGANIZATION_TYPES.TRAINING).length,
      currentlyHiring: safeOrganizations.filter(org => org.is_currently_hiring === true).length,
      industries: Array.from(new Set(safeOrganizations.map(org => org.industry).filter((industry): industry is string => Boolean(industry)))).sort(),
      countries: Array.from(new Set(safeOrganizations.map(org => org.country).filter((country): country is string => Boolean(country)))).sort()
    };
  }, [organizations]);
};

const useOrganizationOperations = () => {
  const { deactivateOrganization, activateOrganization } = useOrganizationsMutations();
  const [operatingOrganizations, setOperatingOrganizations] = useState<Set<string>>(new Set());

  const handleOperation = useCallback(async (
    organizationId: string,
    operation: 'activate' | 'deactivate',
    mutateFunction: () => void
  ) => {
    try {
      setOperatingOrganizations(prev => new Set(prev).add(organizationId));
      if (operation === 'activate') {
        await activateOrganization(organizationId);
      } else {
        await deactivateOrganization(organizationId);
      }
      mutateFunction();
    } catch (error) {
      console.error(`Failed to ${operation} organization:`, error);
    } finally {
      setOperatingOrganizations(prev => {
        const newSet = new Set(prev);
        newSet.delete(organizationId);
        return newSet;
      });
    }
  }, [activateOrganization, deactivateOrganization]);

  return {
    operatingOrganizations,
    handleOperation,
  };
};

// UI Component Helpers
const OrganizationTypeBadge = ({ type, isCurrentlyHiring }: { type: string; isCurrentlyHiring?: boolean }) => {
  if (type === ORGANIZATION_TYPES.HIRING) {
    return (
      <Badge 
        variant={isCurrentlyHiring ? "default" : "secondary"} 
        className={isCurrentlyHiring ? "bg-blue-500 text-white" : ""}
      >
        {isCurrentlyHiring ? ORGANIZATION_UI_TEXT.CURRENTLY_HIRING_BADGE : ORGANIZATION_UI_TEXT.HIRING_PARTNER_BADGE}
      </Badge>
    );
  }
  
  const config = ORGANIZATION_TYPE_CONFIG[type as keyof typeof ORGANIZATION_TYPE_CONFIG];
  return (
    <Badge className={config?.className || ""}>
      {config?.label || type}
    </Badge>
  );
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  const config = STATUS_CONFIG[isActive ? 'active' : 'inactive'];
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

const KPICard = ({ title, value, icon: Icon, className }: {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  className: string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold">{value}</div>
        <div className={`rounded-full p-2 ${className}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ContactInfo = ({ organization }: { organization: Organization }) => {
  if (!organization.website) {
    return (
      <span className="text-muted-foreground text-xs">
        {ORGANIZATION_UI_TEXT.NO_CONTACT_INFO}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <Globe className="h-3 w-3 text-muted-foreground" />
      <a 
        href={organization.website} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
      >
        {ORGANIZATION_UI_TEXT.WEBSITE}
        <ExternalLink className="h-2.5 w-2.5" />
      </a>
    </div>
  );
};

const LocationInfo = ({ organization }: { organization: Organization }) => {
  const formattedAddress = formatAddress(organization);
  
  if (formattedAddress === ORGANIZATION_UI_TEXT.NO_ADDRESS_PROVIDED) {
    return (
      <span className="text-muted-foreground text-xs">
        {ORGANIZATION_UI_TEXT.NO_ADDRESS}
      </span>
    );
  }

  return (
    <div className="flex items-start gap-1">
      <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
      <span className="text-xs">{formattedAddress}</span>
    </div>
  );
};

const ActionDropdown = ({ 
  organization, 
  operatingOrganizations, 
  onOperation 
}: {
  organization: Organization;
  operatingOrganizations: Set<string>;
  onOperation: (id: string, operation: 'activate' | 'deactivate') => void;
}) => {
  const isOperating = operatingOrganizations.has(organization.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">{ORGANIZATION_UI_TEXT.OPEN_MENU}</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{ORGANIZATION_UI_TEXT.ACTIONS}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={ROUTE_HELPERS.getOrganizationDetailsRoute(organization.id)}>
            {ORGANIZATION_ACTION_LABELS.VIEW_DETAILS}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTE_HELPERS.getEditOrganizationRoute(organization.id)}>
            {ORGANIZATION_ACTION_LABELS.EDIT_ORGANIZATION}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTE_HELPERS.getOrganizationUsersRoute(organization.id)}>
            {ORGANIZATION_ACTION_LABELS.VIEW_USERS}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {organization.is_active ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem 
                className="text-red-600"
                onSelect={(e) => e.preventDefault()}
                disabled={isOperating}
              >
                {isOperating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{ORGANIZATION_UI_TEXT.DEACTIVATING}</span>
                  </div>
                ) : (
                  ORGANIZATION_UI_TEXT.DEACTIVATE
                )}
              </DropdownMenuItem>
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
                  onClick={() => onOperation(organization.id, 'deactivate')}
                  disabled={isOperating}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isOperating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{ORGANIZATION_UI_TEXT.DEACTIVATING}</span>
                    </div>
                  ) : (
                    ORGANIZATION_UI_TEXT.DEACTIVATE
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <DropdownMenuItem 
            className="text-green-600"
            onClick={() => onOperation(organization.id, 'activate')}
            disabled={isOperating}
          >
            {isOperating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{ORGANIZATION_UI_TEXT.ACTIVATING}</span>
              </div>
            ) : (
              ORGANIZATION_UI_TEXT.ACTIVATE
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function Organizations() {
  // Local state for status filter to avoid circular dependency
  const [statusFilter, setStatusFilter] = useState<OrganizationStatusFilter>('active');
  
  // Use the paginated hook with status='all' to get all organizations once
  const {
    organizations: allOrganizations,
    isLoading,
    error,
    searchTerm,
    selectedType,
    selectedIndustry,
    selectedStatus,
    activeTab,
    setSearchTerm,
    setSelectedType,
    setSelectedIndustry,
    setSelectedStatus: setStoreSelectedStatus,
    setActiveTab,
    mutate,
    filteredOrganizations,
  } = useOrganizationsPaginated({
    status: 'all', // Always fetch all organizations
    limit: 100,
  });

  // Sync local status filter with store
  const setSelectedStatus = useCallback((status: string) => {
    setStatusFilter(status as OrganizationStatusFilter);
    setStoreSelectedStatus(status);
  }, [setStoreSelectedStatus]);

  // Filter organizations locally based on status
  const organizations = useMemo(() => {
    if (!allOrganizations) return [];
    if (statusFilter === 'all') return allOrganizations;
    if (statusFilter === 'active') return allOrganizations.filter(org => org.is_active);
    if (statusFilter === 'inactive') return allOrganizations.filter(org => !org.is_active);
    return allOrganizations;
  }, [allOrganizations, statusFilter]);

  // Use custom hooks for modular logic
  const stats = useOrganizationFiltering(organizations);
  const { operatingOrganizations, handleOperation } = useOrganizationOperations();

  // Handle organization operations
  const handleOrganizationOperation = useCallback((organizationId: string, operation: 'activate' | 'deactivate') => {
    handleOperation(organizationId, operation, mutate);
  }, [handleOperation, mutate]);

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
  
  // Helper function for date formatting
  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">{ORGANIZATION_UI_TEXT.LOADING_ORGANIZATIONS}</p>
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
            <AlertDescription>
              {ORGANIZATION_UI_TEXT.ERROR_LOADING_ORGANIZATIONS}: {error}
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }
  
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
          title={ORGANIZATION_UI_TEXT.ORGANIZATIONS_DATABASE}
          subtitle={ORGANIZATION_UI_TEXT.ORGANIZATIONS_SUBTITLE}
        >
          <div className="flex items-center gap-2">
            <Button asChild className="flex items-center gap-2">
              <Link href={ROUTES.CREATE_ORGANIZATION}>
                <Plus className="h-4 w-4" />
                <span>{ORGANIZATION_UI_TEXT.ADD_NEW_ORGANIZATION}</span>
              </Link>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>{ORGANIZATION_UI_TEXT.EXPORT_DATA}</span>
            </Button>
          </div>
        </GlossyHero>
        
        {/* KPI cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
          variants={itemVariants}
        >
          {KPI_CARD_CONFIG.map((config) => (
            <KPICard
              key={config.key}
              title={config.title}
              value={stats[config.key]}
              icon={config.icon}
              className={config.className}
            />
          ))}
        </motion.div>
        
        {/* Filters and Table */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{ORGANIZATION_UI_TEXT.ORGANIZATION_RECORDS}</CardTitle>
              <CardDescription>{ORGANIZATION_UI_TEXT.ORGANIZATION_RECORDS_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={ORGANIZATION_UI_TEXT.SEARCH_PLACEHOLDER}
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{ORGANIZATION_UI_TEXT.ALL_INDUSTRIES}</SelectItem>
                    {(stats.industries || []).map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Tabs for different views */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                  {TAB_CONFIG.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              {/* Organizations Table */}
              <ScrollArea className="h-[calc(100vh-26rem)] rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-secondary">
                    <TableRow>
                      <TableHead>{ORGANIZATION_TABLE_COLUMNS.ORGANIZATION}</TableHead>
                      <TableHead>{ORGANIZATION_TABLE_COLUMNS.TYPE_INDUSTRY}</TableHead>
                      <TableHead>{ORGANIZATION_TABLE_COLUMNS.CONTACT}</TableHead>
                      <TableHead>{ORGANIZATION_TABLE_COLUMNS.LOCATION}</TableHead>
                      <TableHead>{ORGANIZATION_TABLE_COLUMNS.STATUS}</TableHead>
                      <TableHead>{ORGANIZATION_TABLE_COLUMNS.CREATED}</TableHead>
                      <TableHead>{ORGANIZATION_TABLE_COLUMNS.ACTIONS}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.length > 0 ? (
                      filteredOrganizations.map((org: Organization) => (
                        <TableRow key={org.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={org.logo_url || undefined} alt={org.org_name || 'Organization'} />
                                <AvatarFallback>{org.org_name?.charAt(0) || 'O'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{org.org_name}</div>
                                <div className="text-xs text-muted-foreground">Code: {org.code}</div>
                                {org.website && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Globe className="h-3 w-3" />
                                    <a 
                                      href={org.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                                    >
                                      {org.website.replace(/^https?:\/\//, '')}
                                      <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <OrganizationTypeBadge 
                                type={org.type} 
                                isCurrentlyHiring={org.is_currently_hiring} 
                              />
                              {org.industry && (
                                <div className="text-xs text-muted-foreground">{org.industry}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ContactInfo organization={org} />
                          </TableCell>
                          <TableCell>
                            <LocationInfo organization={org} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge isActive={org.is_active} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDate(org.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <ActionDropdown
                              organization={org}
                              operatingOrganizations={operatingOrganizations}
                              onOperation={handleOrganizationOperation}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          {ORGANIZATION_UI_TEXT.NO_ORGANIZATIONS_FOUND}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
