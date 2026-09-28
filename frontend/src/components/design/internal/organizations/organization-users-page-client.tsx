"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  Search,
  ArrowLeft,
  Building2,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  UserMinus,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlossyHero } from "@/components/ui/glossy-hero";
import { PageContainer } from "@/components/page-container";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Import the API functions and types
import { 
  getOrganizationById, 
  getOrganizationUsers, 
  Organization, 
  OrganizationUser,
  deactivateUserInOrganization,
  activateUserInOrganization,
  bulkDeactivateUsersInOrganization,
  bulkActivateUsersInOrganization,
} from '@/lib/api/organizations';

// Import string constants
import {
  ORGANIZATION_UI_TEXT,
  ROUTE_HELPERS,
  ROUTES,
} from '@/helpers/string_const';

// Type for status filter
type StatusFilter = 'all' | 'active' | 'inactive';

// KPI Card Component
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

// Status Badge Component - Fixed to ensure proper boolean handling
const StatusBadge = ({ isActive }: { isActive: boolean | string | number }) => {
  // Ensure we have a proper boolean value and handle string values from API
  const status = isActive;
  const active = status === true || String(status) === 'true' || Number(status) === 1;
  
  return (
    <Badge className={active ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
};

// Helper function to safely get user initials
const getUserInitials = (user: OrganizationUser): string => {
  const firstName = user.first_name?.trim() || 'U';
  const lastName = user.last_name?.trim() || 'N';
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
};

// Helper function to get user display name
const getUserDisplayName = (user: OrganizationUser): string => {
  const firstName = user.first_name?.trim() || 'Unknown';
  const lastName = user.last_name?.trim() || 'Name';
  return `${firstName} ${lastName}`;
};

// Helper function to safely check if user is active
const isUserActive = (user: OrganizationUser): boolean => {
  const status = user.is_active;
  return status === true || String(status) === 'true' || Number(status) === 1;
};

// Contact Info Component
const ContactInfo = ({ user }: { user: OrganizationUser }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-xs">
        <Mail className="h-3 w-3 text-muted-foreground" />
        <span className="text-blue-600 dark:text-blue-400">{user.email || 'No email'}</span>
      </div>
      {user.phone && (
        <div className="flex items-center gap-1 text-xs">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span>{user.phone}</span>
        </div>
      )}
    </div>
  );
};

interface OrganizationUsersPageClientProps {
  organizationId: string;
}

export default function OrganizationUsersPageClient({ organizationId }: OrganizationUsersPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<OrganizationUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());
  
  // Bulk selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => isUserActive(user)).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
    };
  }, [users]);

  // Filter users based on search term and status filter
  useEffect(() => {
    let filtered = users;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        const active = isUserActive(user);
        return statusFilter === 'active' ? active : !active;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(user => {
        const fullName = getUserDisplayName(user).toLowerCase();
        const preferredName = user.preferred_name?.toLowerCase() || '';
        const email = (user.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        return (
          fullName.includes(search) ||
          preferredName.includes(search) ||
          email.includes(search)
        );
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter]);

  // Clear selection when filter changes
  useEffect(() => {
    setSelectedUsers(new Set());
  }, [statusFilter]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch organization and users in parallel
        const [orgData, usersData] = await Promise.all([
          getOrganizationById(organizationId),
          getOrganizationUsers(organizationId)
        ]);

        setOrganization(orgData);
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load organization users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

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

  // Helper function for date and time formatting
  const formatDateTime = (dateString: string): string => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      
      // Format: "Jan 15, 2024 at 10:30 AM"
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Handle user status change
  const handleUserStatusChange = async (user: OrganizationUser, action: 'activate' | 'deactivate') => {
    try {
      // Add user to loading set
      setLoadingUsers(prev => new Set(prev).add(user.id));

      if (action === 'activate') {
        await activateUserInOrganization(organizationId, user.id);
        toast({
          title: "User Activated",
          description: `${getUserDisplayName(user)} has been activated successfully.`,
          variant: "default",
        });
      } else {
        await deactivateUserInOrganization(organizationId, user.id);
        toast({
          title: "User Deactivated", 
          description: `${getUserDisplayName(user)} has been deactivated successfully.`,
          variant: "default",
        });
      }

      // Update the user status in the local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id 
            ? { ...u, is_active: action === 'activate' }
            : u
        )
      );

    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} user. Please try again.`,
        variant: "destructive",
      });
    } finally {
      // Remove user from loading set
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  // Handle bulk operations
  const handleBulkOperation = async (action: 'activate' | 'deactivate') => {
    if (selectedUsers.size === 0) return;

    try {
      setIsBulkLoading(true);
      
      // Get selected user emails
      const selectedUserEmails = filteredUsers
        .filter(user => selectedUsers.has(user.id))
        .map(user => user.email)
        .filter(email => email) as string[];

      if (selectedUserEmails.length === 0) {
        toast({
          title: "Error",
          description: "No valid user emails found for the selected users.",
          variant: "destructive",
        });
        return;
      }

      let result;
      if (action === 'activate') {
        result = await bulkActivateUsersInOrganization(organizationId, selectedUserEmails);
      } else {
        result = await bulkDeactivateUsersInOrganization(organizationId, selectedUserEmails);
      }

      // Update local state for successful operations
      const successfulEmails = selectedUserEmails.filter((email, index) => 
        index < result.successful
      );

      setUsers(prevUsers => 
        prevUsers.map(user => 
          successfulEmails.includes(user.email) 
            ? { ...user, is_active: action === 'activate' }
            : user
        )
      );

      // Clear selection
      setSelectedUsers(new Set());

      // Show success message
      toast({
        title: `Bulk ${action === 'activate' ? 'Activation' : 'Deactivation'} Complete`,
        description: `${result.successful} users ${action === 'activate' ? 'activated' : 'deactivated'} successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}.`,
        variant: result.failed > 0 ? "default" : "default",
      });

      // Show detailed error information if there are failures
      if (result.failed > 0 && result.failed_users?.length > 0) {
        console.warn('Failed operations:', result.failed_users);
      }

    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
      toast({
        title: "Bulk Operation Failed",
        description: `Failed to ${action} users. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Handle individual user selection
  const handleUserSelection = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      // Deselect all
      setSelectedUsers(new Set());
    } else {
      // Select all visible users
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  // Determine checkbox state for select all
  const getSelectAllState = () => {
    if (selectedUsers.size === 0) return 'none';
    if (selectedUsers.size === filteredUsers.length) return 'all';
    return 'some';
  };

  // Get appropriate bulk action label
  const getBulkActionLabel = () => {
    if (statusFilter === 'active') return 'Deactivate Selected';
    if (statusFilter === 'inactive') return 'Activate Selected';
    return 'Bulk Actions';
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="container p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">{ORGANIZATION_UI_TEXT.LOADING_ORGANIZATION_USERS}</p>
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
              {ORGANIZATION_UI_TEXT.ERROR_LOADING_ORGANIZATION_USERS}: {error}
            </AlertDescription>
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
            <AlertDescription>
              Organization not found.
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
          title={`${organization.org_name} - ${ORGANIZATION_UI_TEXT.ORGANIZATION_USERS_TITLE}`}
          subtitle={ORGANIZATION_UI_TEXT.ORGANIZATION_USERS_SUBTITLE}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Organizations</span>
            </Button>
            <Button 
              onClick={() => router.push(`${ROUTES.ORGANIZATIONS}/${organizationId}/users/add`)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Users</span>
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
        
        {/* KPI cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          variants={itemVariants}
        >
          <KPICard
            title={ORGANIZATION_UI_TEXT.TOTAL_USERS}
            value={stats.totalUsers}
            icon={Users}
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
          <KPICard
            title={ORGANIZATION_UI_TEXT.ACTIVE_USERS}
            value={stats.activeUsers}
            icon={UserCheck}
            className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          />
          <KPICard
            title={ORGANIZATION_UI_TEXT.INACTIVE_USERS}
            value={stats.inactiveUsers}
            icon={UserX}
            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          />
        </motion.div>
        
        {/* Users Table */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Organization Users</CardTitle>
              <CardDescription>Users assigned to this organization</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={ORGANIZATION_UI_TEXT.USER_SEARCH_PLACEHOLDER}
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Status Filter Tabs */}
                <Tabs value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as StatusFilter)}>
                  <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="all">All Users ({stats.totalUsers})</TabsTrigger>
                    <TabsTrigger value="active">Active ({stats.activeUsers})</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive ({stats.inactiveUsers})</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Bulk Actions */}
                {(statusFilter === 'active' || statusFilter === 'inactive') && filteredUsers.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      className="h-8 flex items-center gap-2"
                    >
                      {getSelectAllState() === 'all' ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : getSelectAllState() === 'some' ? (
                        <MinusSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                      <span>
                        {getSelectAllState() === 'all' ? 'Deselect All' : 'Select All'}
                      </span>
                    </Button>
                    
                    {selectedUsers.size > 0 && (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-muted-foreground">
                          {selectedUsers.size} selected
                        </span>
                        <Button
                          onClick={() => handleBulkOperation(statusFilter === 'active' ? 'deactivate' : 'activate')}
                          disabled={isBulkLoading}
                          size="sm"
                          variant={statusFilter === 'active' ? 'destructive' : 'default'}
                          className="flex items-center gap-2"
                        >
                          {isBulkLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : statusFilter === 'active' ? (
                            <UserMinus className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          <span>{getBulkActionLabel()}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Users Table */}
              <ScrollArea className="h-[calc(100vh-26rem)] rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-secondary">
                    <TableRow>
                      {(statusFilter === 'active' || statusFilter === 'inactive') && (
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={getSelectAllState() === 'all'}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all users"
                          />
                        </TableHead>
                      )}
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: OrganizationUser) => (
                        <TableRow key={user.id}>
                          {(statusFilter === 'active' || statusFilter === 'inactive') && (
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.has(user.id)}
                                onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                                aria-label={`Select ${getUserDisplayName(user)}`}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {getUserDisplayName(user)}
                                </div>
                                {user.preferred_name && (
                                  <div className="text-xs text-muted-foreground">
                                    Preferred: {user.preferred_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <ContactInfo user={user} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge isActive={isUserActive(user)} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDateTime(user.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0"
                                  disabled={loadingUsers.has(user.id)}
                                >
                                  {loadingUsers.has(user.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {isUserActive(user) ? (
                                  <DropdownMenuItem 
                                    onClick={() => handleUserStatusChange(user, 'deactivate')}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Deactivate User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => handleUserStatusChange(user, 'activate')}
                                    className="text-green-600 focus:text-green-600"
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Activate User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={(statusFilter === 'active' || statusFilter === 'inactive') ? 6 : 5} className="text-center py-6 text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' ? 
                            `No users found matching the current filters.` : 
                            ORGANIZATION_UI_TEXT.NO_USERS_FOUND
                          }
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