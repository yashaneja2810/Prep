"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Calendar,
  Users,
  Edit,
  Trash,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  LayoutGrid,
  List,
  BookOpen,
  Layers,
  Download,
  Upload,
  Building,
  MoreVertical,
  Video,
  Presentation,
  XCircle,
  Eye,
  Settings,
  Archive,
  Activity,
  ChevronDown,
  FileX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

// Import data from data.ts
import { getAllTopics, TopicResponse } from "@/lib/api/topics";
import { toast } from "sonner";
import { getAllCohorts, deleteCohort, Cohort } from "@/lib/api/cohorts";
import { useTopics } from "@/hooks/useTopics";

// Statistics Overview Box Component
function StatisticsOverviewBox({ cohorts }: { cohorts: Cohort[] }) {
  const totalCohorts = cohorts.length;
  const activeCohorts = cohorts.filter(c => c.status === 'active').length;
  const upcomingCohorts = cohorts.filter(c => c.status === 'upcoming').length;
  const completedCohorts = cohorts.filter(c => c.status === 'completed').length;
  const totalHeads = cohorts.reduce((sum, c) => sum + (c.cohort_learners?.length || 0), 0);

  const stats = [
    { 
      label: 'Total Cohorts', 
      value: totalCohorts, 
      icon: BookOpen, 
      iconColor: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-blue-50 dark:bg-blue-950/30' 
    },
    { 
      label: 'Active Cohorts', 
      value: activeCohorts, 
      icon: Activity, 
      iconColor: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-50 dark:bg-green-950/30' 
    },
    { 
      label: 'Upcoming Cohorts', 
      value: upcomingCohorts, 
      icon: Calendar, 
      iconColor: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-blue-50 dark:bg-blue-950/30' 
    },
    { 
      label: 'Completed Cohorts', 
      value: completedCohorts, 
      icon: CheckCircle, 
      iconColor: 'text-gray-600 dark:text-gray-400', 
      bgColor: 'bg-gray-50 dark:bg-gray-800/30' 
    },
    { 
      label: 'Total Heads', 
      value: totalHeads, 
      icon: Users, 
      iconColor: 'text-purple-600 dark:text-purple-400', 
      bgColor: 'bg-purple-50 dark:bg-purple-950/30' 
    },
  ];

  return (
    <Card className="w-full shadow-sm mt-3">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-sm font-medium">Statistics Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4 py-2">
        {stats.map(stat => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.label}
              className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-card text-xs font-normal cursor-default select-none transition-all hover:shadow-sm"
              style={{ pointerEvents: 'none', opacity: 1 }}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                  <IconComponent className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                </div>
                <span className="font-normal">{stat.label}</span>
              </div>
              <span className="font-medium text-xs">{stat.value}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Quick Actions Box Component
function QuickActionsBox() {
  const router = useRouter();

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-1 pt-2 px-4">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-4 py-2">
        <Button 
          className="w-full justify-start gap-2 h-8 text-xs font-normal bg-card hover:bg-muted/50 border border-border"
          onClick={() => router.push("/content-management/cohorts/create")}
          variant="secondary"
        >
          <Plus className="h-4 w-4" />
          Create New Cohort
        </Button>
        <Button 
          className="w-full justify-start gap-2 h-8 text-xs font-normal bg-card hover:bg-muted/50 border border-border"
          variant="secondary"
        >
          <Users className="h-4 w-4" />
          Bulk Enroll Students
        </Button>
        <Button 
          className="w-full justify-start gap-2 h-8 text-xs font-normal bg-card hover:bg-muted/50 border border-border"
          variant="secondary"
        >
          <FileText className="h-4 w-4" />
          Schedule Assessment
        </Button>
        <Button 
          className="w-full justify-start gap-2 h-8 text-xs font-normal bg-card hover:bg-muted/50 border border-border"
          variant="secondary"
        >
          <Download className="h-4 w-4" />
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );
}

// Cohorts Tab Content
export function CohortsTabContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [selectedOrganization, setSelectedOrganization] = useState("all");
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchCohorts();
  }, []);
  
  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const data = await getAllCohorts();
      setCohorts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch cohorts:", err);
      setError("Failed to load cohorts. Please try again.");
      toast.error("Failed to load cohorts");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to check view mode
  const isViewMode = (mode: string) => viewMode === mode;
  
  // Filter cohorts based on search term, active tab, and organization
  const filteredCohorts = cohorts.filter(cohort => {
    const matchesSearch = 
      cohort.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cohort.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      cohort.cohort_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "active" && cohort.status === "active") ||
      (activeTab === "upcoming" && cohort.status === "upcoming") ||
      (activeTab === "completed" && cohort.status === "completed");
    
    const matchesOrganization = 
      selectedOrganization === "all" ||
      (selectedOrganization === "direct" && !cohort.organization?.org_name) ||
      (selectedOrganization !== "all" && selectedOrganization !== "direct" && cohort.organization?.org_name === selectedOrganization);
      
    return matchesSearch && matchesTab && matchesOrganization;
  });
  
  const handleDeleteCohort = async (id: string) => {
    try {
      await deleteCohort(id);
      toast.success("Cohort deleted successfully");
      // Refresh the cohorts list
      fetchCohorts();
    } catch (err) {
      console.error("Failed to delete cohort:", err);
      toast.error("Failed to delete cohort");
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active':
        return {
          border: 'border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/10',
          bg: 'bg-green-500 dark:bg-green-600',
          badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'upcoming':
        return {
          border: 'border-blue-200 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/10',
          bg: 'bg-blue-500 dark:bg-blue-600',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        };
      case 'completed':
        return {
          border: 'border-gray-200 bg-gray-50/50 dark:border-gray-800/50 dark:bg-gray-950/10',
          bg: 'bg-gray-500 dark:bg-gray-600',
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
      default:
        return {
          border: 'border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/10',
          bg: 'bg-amber-500 dark:bg-amber-600',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
        };
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 bg-card rounded-lg border shadow-sm">
      {isViewMode('card') && (
          <>
            <div className="px-4 pt-4 pb-3 flex flex-col gap-2 border-b">
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 md:gap-4">
                <div className="min-w-[180px]">
                  <h2 className="text-xl font-semibold leading-tight">Cohort Records</h2>
                  <p className="text-sm text-muted-foreground leading-tight">View, filter, and manage all cohorts</p>
            </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
              <div className="border rounded-md p-1 flex bg-muted/30">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('card') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('list') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
                <Button 
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => fetchCohorts()}
                >
                  <span>Refresh</span>
                </Button>
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button asChild className="gap-2">
                  <Link href="/content-management/cohorts/create">
                    <Plus className="h-4 w-4" />
                    <span>Create Cohort</span>
                  </Link>
                </Button>
              </div>
            </div>
              <div className="flex items-center justify-between">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start rounded-none h-9 bg-transparent p-0">
                    <TabsTrigger
                      value="all"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      All Cohorts
                    </TabsTrigger>
                    <TabsTrigger
                      value="active"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Active
                    </TabsTrigger>
                    <TabsTrigger
                      value="upcoming"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Upcoming
                    </TabsTrigger>
                    <TabsTrigger
                      value="completed"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Completed
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search cohorts..."
                      className="pl-9 w-[300px] h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        {selectedOrganization === "all" ? "All Organizations" : 
                         selectedOrganization === "direct" ? "Direct" : selectedOrganization}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by Organization</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedOrganization("all")}>
                        All Organizations
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedOrganization("direct")}>
                        Direct
                      </DropdownMenuItem>
                      {Array.from(new Set(cohorts.map(c => c.organization?.org_name).filter(Boolean))).map(orgName => (
                        <DropdownMenuItem key={orgName} onClick={() => setSelectedOrganization(orgName!)}>
                          {orgName}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-25 border-t-primary rounded-full" />
              </div>
            ) : error ? (
              <div className="text-center p-8">
                <p className="text-red-500">{error}</p>
                <Button onClick={fetchCohorts} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : filteredCohorts.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-2">No cohorts found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || activeTab !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by creating your first cohort"}
                </p>
                {!searchTerm && activeTab === "all" && (
                  <Button asChild className="mt-4">
                    <Link href="/content-management/cohorts/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Cohort
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCohorts.map((cohort) => {
                  const statusColors = getStatusColor(cohort.status);
                  return (
                    <Card 
                      key={cohort.id}
                      className={`overflow-hidden hover:shadow-lg transition-all duration-200 border ${statusColors.border}`}
                    >
                      <div className={`h-1.5 w-full ${statusColors.bg}`} />
                      <CardHeader className="py-2 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-foreground">{cohort.cohort_code}</span>
                          <p className="text-xs mt-0.5 font-semibold line-clamp-2">{cohort.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(cohort.start_date).toLocaleDateString()} - {new Date(cohort.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[9px] text-muted-foreground line-clamp-1">{cohort.program?.title || "No program"}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-2 pt-0">
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-foreground">{cohort.organization?.org_name || "Direct"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-foreground">{cohort.cohort_learners?.length || 0} Learners</span>
                          </div>
                          <Badge className={statusColors.badge + ' text-xs px-2 py-0.5'}>
                            {cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Link href={`/content-management/cohorts/${cohort.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs px-2 py-1"
                            >
                              View Details
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-muted text-xs">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild className="text-xs">
                                <Link href={`/content-management/cohorts/${cohort.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>Edit</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive text-xs"
                                onClick={() => {
                                  if(window.confirm("Are you sure you want to delete this cohort?")) {
                                    handleDeleteCohort(cohort.id);
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            </div>
          </>
      )}
      
      {isViewMode('list') && (
          <>
            <div className="px-4 pt-4 pb-3 flex flex-col gap-2 border-b">
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 md:gap-4">
                <div className="min-w-[180px]">
                  <h2 className="text-xl font-semibold leading-tight">Cohort Records</h2>
                  <p className="text-sm text-muted-foreground leading-tight">View, filter, and manage all cohorts</p>
            </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
              <div className="border rounded-md p-1 flex bg-muted/30">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('card') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('list') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
                <Button 
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => fetchCohorts()}
                >
                  <span>Refresh</span>
                </Button>
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                  <Button asChild className="gap-2">
                <Link href="/content-management/cohorts/create">
                      <Plus className="h-4 w-4" />
                      <span>Create Cohort</span>
                </Link>
                  </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start rounded-none h-9 bg-transparent p-0">
                  <TabsTrigger
                    value="all"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    All Cohorts
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger
                    value="upcoming"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Completed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search cohorts..."
                    className="pl-9 w-[300px] h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1">
                      {selectedOrganization === "all" ? "All Organizations" : 
                       selectedOrganization === "direct" ? "Direct" : selectedOrganization}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Organization</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedOrganization("all")}>
                      All Organizations
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedOrganization("direct")}>
                      Direct
                    </DropdownMenuItem>
                    {Array.from(new Set(cohorts.map(c => c.organization?.org_name).filter(Boolean))).map(orgName => (
                      <DropdownMenuItem key={orgName} onClick={() => setSelectedOrganization(orgName!)}>
                        {orgName}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            </div>
            <div className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-25 border-t-primary rounded-full" />
              </div>
            ) : error ? (
              <div className="text-center p-8">
                <p className="text-red-500">{error}</p>
                <Button onClick={fetchCohorts} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : filteredCohorts.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-2">No cohorts found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || activeTab !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by creating your first cohort"}
                </p>
                {!searchTerm && activeTab === "all" && (
                  <Button asChild className="mt-4">
                    <Link href="/content-management/cohorts/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Cohort
                </Link>
                  </Button>
                )}
              </div>
            ) : (
            <Table className="border-collapse">
                <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold w-[180px] text-left">Cohort</TableHead>
                  <TableHead className="font-semibold w-[90px] text-center">Status</TableHead>
                  <TableHead className="font-semibold w-[140px] text-center">Organization</TableHead>
                  <TableHead className="font-semibold w-[80px] text-center">Learners</TableHead>
                  <TableHead className="font-semibold w-[160px] text-center">Trainers</TableHead>
                  <TableHead className="font-semibold w-[110px] text-center">Start Date</TableHead>
                  <TableHead className="font-semibold w-[120px] text-center">Location & Format</TableHead>
                  <TableHead className="font-semibold w-[60px] text-center">Edit</TableHead>
                  <TableHead className="font-semibold w-[60px] text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCohorts.length > 0 ? (
                  filteredCohorts.map((cohort) => (
                    <TableRow 
                      key={cohort.id}
                      style={{
                        borderLeft: cohort.status === 'active' ? '4px solid rgb(34, 197, 94)' : 
                                  cohort.status === 'upcoming' ? '4px solid rgb(59, 130, 246)' : 
                                  '4px solid rgb(107, 114, 128)'
                      }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                          {/* Cohort */}
                          <TableCell className="py-1 px-2 text-xs align-middle w-[180px] text-left">
                        <div className="flex flex-col gap-0.5 justify-center">
                          <span className="text-sm font-semibold text-foreground">{cohort.cohort_code}</span>
                          <span className="font-semibold text-xs">{cohort.title}</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">{cohort.program?.title || "No program"}</span>
                        </div>
                      </TableCell>
                          {/* Status */}
                      <TableCell className="py-1 px-2 text-xs align-middle w-[90px] text-center">
                        <div className="flex items-center justify-center h-full min-h-[28px]">
                        {cohort.status === "active" && (
                            <span className="font-medium px-3 py-1 rounded-full bg-green-500 dark:bg-green-600 text-white">Active</span>
                        )}
                        {cohort.status === "upcoming" && (
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Clock className="h-4 w-4" />
                            <span className="font-medium">Upcoming</span>
                          </div>
                        )}
                        {cohort.status === "completed" && (
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Completed</span>
                          </div>
                        )}
                        </div>
                      </TableCell>
                          {/* Organization */}
                          <TableCell className="py-1 px-2 text-xs align-middle w-[140px] text-center">
                        <div className="flex items-center justify-center h-full min-h-[28px]">
                          <span className="truncate max-w-full" title={cohort.organization?.org_name || "Direct"}>
                            {cohort.organization?.org_name || "Direct"}
                          </span>
                        </div>
                      </TableCell>
                          {/* Learners */}
                          <TableCell className="py-1 px-2 text-xs align-middle w-[80px] text-center">
                        <div className="flex items-center justify-center h-full min-h-[28px] gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{cohort.cohort_learners?.length || 0}</span>
                        </div>
                      </TableCell>
                          {/* Instructors */}
                          <TableCell className="py-1 px-2 text-xs align-middle w-[160px] text-center">
                        <div className="flex items-center justify-center h-full min-h-[28px] gap-1 flex-wrap">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="break-words text-xs">
                            {cohort.cohort_trainers && cohort.cohort_trainers.length > 0
                              ? cohort.cohort_trainers.map(t => [t.user?.first_name, t.user?.last_name].filter(Boolean).join(' ')).join(', ')
                              : '—'}
                          </span>
                        </div>
                      </TableCell>
                          {/* Start Date */}
                          <TableCell className="py-1 px-2 text-xs align-middle w-[110px] text-center">
                        <div className="flex items-center justify-center h-full min-h-[28px]">
                          <span className="text-xs">{cohort.start_date}</span>
                        </div>
                      </TableCell>
                          {/* Location & Format */}
                          <TableCell className="py-1 px-2 text-xs align-middle w-[120px] text-center">
                        <div className="flex items-center justify-center h-full min-h-[28px]">
                          <span className="text-xs">—</span>
                        </div>
                      </TableCell>
                          {/* Edit */}
                          <TableCell className="text-right py-1 px-2 text-xs align-middle w-[60px] text-center">
                        <div className="flex items-center justify-center h-full min-h-[28px]">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-card">
                                <DialogHeader className="p-6 pb-2">
                                  <DialogTitle className="text-xl">Manage Cohort: {cohort.title}</DialogTitle>
                                  <DialogDescription className="text-sm opacity-90">
                                    {cohort.description}
                                  </DialogDescription>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {cohort.cohort_code}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{cohort.organization?.org_name || "Direct"}</span>
                                  </div>
                                </DialogHeader>
                                
                                <Tabs defaultValue="sessions" className="mt-2">
                                  <div className="border-b">
                                    <div className="overflow-x-auto px-6">
                                      <TabsList className="mb-0 w-full md:w-auto h-auto p-0 bg-transparent">
                                        <TabsTrigger 
                                          value="sessions" 
                                          className="flex-1 md:flex-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-4 bg-transparent"
                                        >
                                          Training Sessions
                                        </TabsTrigger>
                                        <TabsTrigger 
                                          value="students" 
                                          className="flex-1 md:flex-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-4 bg-transparent"
                                        >
                                          Learners
                                        </TabsTrigger>
                                        <TabsTrigger 
                                          value="settings" 
                                          className="flex-1 md:flex-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-4 bg-transparent"
                                        >
                                          Cohort Settings
                                        </TabsTrigger>
                                      </TabsList>
                                    </div>
                                  </div>
                                  
                                  {/* Sessions Tab */}
                                  <TabsContent value="sessions" className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-lg font-medium">Live Training Sessions</h3>
                                      <Button size="sm">
                                        <Plus className="h-4 w-4 sm:mr-1" />
                                        <span className="hidden sm:inline">Add Session</span>
                                      </Button>
                                    </div>
                                    
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                      <Calendar className="h-12 w-12 mb-3 text-muted-foreground/50" />
                                      <p>No sessions scheduled yet. Add your first session.</p>
                                    </div>
                                  </TabsContent>
                                  
                                  {/* Learners Tab */}
                                  <TabsContent value="students" className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-lg font-medium">Enrolled Learners</h3>
                                      <Button size="sm">
                                        <Plus className="h-4 w-4 sm:mr-1" />
                                        <span className="hidden sm:inline">Add Learners</span>
                                      </Button>
                                    </div>
                                    
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                      <Users className="h-12 w-12 mb-3 text-muted-foreground/50" />
                                      <p>No learners enrolled yet. Add learners to this cohort.</p>
                                    </div>
                                  </TabsContent>
                                  
                                  {/* Settings Tab */}
                                  <TabsContent value="settings" className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <h3 className="text-lg font-medium">Cohort Settings</h3>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="cohortTitle">Cohort Title</Label>
                                          <Input id="cohortTitle" defaultValue={cohort.title} />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="cohortCode">Cohort Code</Label>
                                          <Input id="cohortCode" defaultValue={cohort.cohort_code} />
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="cohortDesc">Description</Label>
                                        <Textarea id="cohortDesc" defaultValue={cohort.description} />
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="startDate">Start Date</Label>
                                          <Input id="startDate" type="date" defaultValue={cohort.start_date} />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="endDate">End Date</Label>
                                          <Input id="endDate" type="date" defaultValue={cohort.end_date} />
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select defaultValue={cohort.status}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                      <Button variant="outline">Cancel</Button>
                                      <Button>Save Changes</Button>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>
                        </div>
                          </TableCell>
                      {/* Action */}
                      <TableCell className="py-1 px-2 text-xs align-middle w-[60px] text-center">
                        <div className="flex items-center justify-center h-full min-h-[28px]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-muted text-xs">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild className="text-xs">
                                <Link href={`/content-management/cohorts/${cohort.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  <span>View All Cohort Details</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs" onSelect={(e) => e.preventDefault()}>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <div className="flex items-center w-full">
                                      <Edit className="h-4 w-4 mr-2" />
                                      <span>Edit Information</span>
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-card">
                                    <DialogHeader className="p-6 pb-2">
                                      <DialogTitle className="text-xl">Manage Cohort: {cohort.title}</DialogTitle>
                                      <DialogDescription className="text-sm opacity-90">
                                        {cohort.description}
                                      </DialogDescription>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="font-mono text-xs">
                                          {cohort.cohort_code}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{cohort.organization?.org_name || "Direct"}</span>
                                      </div>
                                    </DialogHeader>
                                    
                                    <Tabs defaultValue="sessions" className="mt-2">
                                      <div className="border-b">
                                        <div className="overflow-x-auto px-6">
                                          <TabsList className="mb-0 w-full md:w-auto h-auto p-0 bg-transparent">
                                            <TabsTrigger 
                                              value="sessions" 
                                              className="flex-1 md:flex-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-4 bg-transparent"
                                            >
                                              Training Sessions
                                            </TabsTrigger>
                                            <TabsTrigger 
                                              value="students" 
                                              className="flex-1 md:flex-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-4 bg-transparent"
                                            >
                                              Learners
                                            </TabsTrigger>
                                            <TabsTrigger 
                                              value="settings" 
                                              className="flex-1 md:flex-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-4 bg-transparent"
                                            >
                                              Cohort Settings
                                            </TabsTrigger>
                                          </TabsList>
                                        </div>
                                      </div>
                                      
                                      {/* Sessions Tab */}
                                      <TabsContent value="sessions" className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                        <div className="flex items-center justify-between">
                                          <h3 className="text-lg font-medium">Live Training Sessions</h3>
                                          <Button size="sm">
                                            <Plus className="h-4 w-4 sm:mr-1" />
                                            <span className="hidden sm:inline">Add Session</span>
                                          </Button>
                                        </div>
                                        
                                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                          <Calendar className="h-12 w-12 mb-3 text-muted-foreground/50" />
                                          <p>No sessions scheduled yet. Add your first session.</p>
                                        </div>
                                      </TabsContent>
                                      
                                      {/* Learners Tab */}
                                      <TabsContent value="students" className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                        <div className="flex items-center justify-between">
                                          <h3 className="text-lg font-medium">Enrolled Learners</h3>
                                          <Button size="sm">
                                            <Plus className="h-4 w-4 sm:mr-1" />
                                            <span className="hidden sm:inline">Add Learners</span>
                                          </Button>
                                        </div>
                                        
                                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                          <Users className="h-12 w-12 mb-3 text-muted-foreground/50" />
                                          <p>No learners enrolled yet. Add learners to this cohort.</p>
                                        </div>
                                      </TabsContent>
                                      
                                      {/* Settings Tab */}
                                      <TabsContent value="settings" className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                        <h3 className="text-lg font-medium">Cohort Settings</h3>
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="cohortTitle">Cohort Title</Label>
                                              <Input id="cohortTitle" defaultValue={cohort.title} />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="cohortCode">Cohort Code</Label>
                                              <Input id="cohortCode" defaultValue={cohort.cohort_code} />
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor="cohortDesc">Description</Label>
                                            <Textarea id="cohortDesc" defaultValue={cohort.description} />
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="startDate">Start Date</Label>
                                              <Input id="startDate" type="date" defaultValue={cohort.start_date} />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="endDate">End Date</Label>
                                              <Input id="endDate" type="date" defaultValue={cohort.end_date} />
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select defaultValue={cohort.status}>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                        
                                        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                          <Button variant="outline">Cancel</Button>
                                          <Button>Save Changes</Button>
                                        </div>
                                      </TabsContent>
                                    </Tabs>
                                  </DialogContent>
                                </Dialog>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>View Schedule</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs">
                                <Settings className="h-4 w-4 mr-2" />
                                <span>Cohort Settings</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span>Change Status</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">
                                <Archive className="h-4 w-4 mr-2" />
                                <span>Archive Cohort</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                    ) : null}
                </TableBody>
              </Table>
            )}
            </div>
          </>
      )}
      </div>
      <div className="w-72 flex flex-col">
        <QuickActionsBox />
        <StatisticsOverviewBox cohorts={cohorts} />
      </div>
    </div>
  );
}

// Courses Tab Content
export function ProgramsTabContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch programs data from API
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const { getAllPrograms, getProgramById } = await import("@/lib/api/programs");
        const programsList = await getAllPrograms();
        
        // Fetch detailed program data with modules for each program
        const programsWithModules = await Promise.all(
          programsList.map(async (program) => {
            try {
              // Get detailed program data including modules
              const detailedProgram = await getProgramById(program.id);
              return detailedProgram;
            } catch (error) {
              console.error(`Failed to fetch details for program ${program.id}:`, error);
              return program; // Return the basic program data if detailed fetch fails
            }
          })
        );
        
        setPrograms(programsWithModules || []);
      } catch (error) {
        console.error("Failed to load programs:", error);
        toast.error("Failed to load programs. Please try again.");
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrograms();
  }, []);
  
  // Helper function to check view mode
  const isViewMode = (mode: string) => viewMode === mode;
  
  // Filter courses based on search term, status, type, and source
  const filteredCourses = loading ? [] : programs.filter(program => {
    const matchesSearch = 
      program.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.program_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "published" && program.status === "published") ||
      (filterStatus === "draft" && program.status === "draft");
      
    // We'll consider all programs as the same type for now
    const matchesType = true;
    const matchesSource = true;
      
    return matchesSearch && matchesStatus && matchesType && matchesSource;
  });

  // Get modules for a program (fetches from cache or API)
  const getModulesForProgram = async (program: any): Promise<any[]> => {
    if (program.modules && program.modules.length > 0) {
      return program.modules;
    }
    
    try {
      const { getProgramModules } = await import("@/lib/api/programs");
      const modules = await getProgramModules(program.id);
      // Cache the modules in the program object
      program.modules = modules;
      return modules;
    } catch (error) {
      console.error(`Failed to fetch modules for program ${program.id}:`, error);
      return [];
    }
  };
  
  // Used for initial display, will be replaced with actual data when available
  const getModuleCountForProgram = (program: any): number => {
    if (program.modules && Array.isArray(program.modules)) {
      return program.modules.length;
    }
    // Fallback to a placeholder value if modules aren't available yet
    return program.moduleCount || 0;
  };

  return (
    <div>
      {isViewMode('card') && (
        <>
          <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b">
            <div className="space-y-1">
              <CardTitle>Learning Programs</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your educational programs</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search programs..."
                    className="pl-9 w-[220px] h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("all")}
                      className={filterStatus === "all" ? "bg-accent text-accent-foreground" : ""}
                    >
                      All Programs
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("published")}
                      className={filterStatus === "published" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Published Programs
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("draft")}
                      className={filterStatus === "draft" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Draft Programs
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setFilterType("all")}
                      className={filterType === "all" ? "bg-accent text-accent-foreground" : ""}
                    >
                      All Types
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterType("flagship")}
                      className={filterType === "flagship" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Flagship Programs
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterType("on-demand")}
                      className={filterType === "on-demand" ? "bg-accent text-accent-foreground" : ""}
                    >
                      On-Demand Programs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="border rounded-md p-1 flex bg-muted/30">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('card') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('list') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Link href="/content-management/courses/create">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Program
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-muted-foreground">Loading programs...</p>
                  </div>
                </div>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((program) => {
                  const moduleCount = getModuleCountForProgram(program);
                  const isPublished = program.status === 'published';
                  return (
                    <Card 
                      key={program.id} 
                      className={`overflow-hidden hover:shadow-lg transition-all duration-200 border ${
                        isPublished
                          ? 'border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/10' 
                          : 'border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/10'
                      }`}
                    >
                      <div className={`h-1.5 w-full ${
                        isPublished
                          ? 'bg-green-500 dark:bg-green-600' 
                          : 'bg-amber-500 dark:bg-amber-600'
                      }`} />
                      <CardHeader className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit text-xs font-medium">{program.program_code}</Badge>
                          <p className="text-sm mt-1 font-semibold line-clamp-2">{program.title}</p>
                          {program.prerequisites && (
                          <div className="flex items-center gap-1 mt-1">
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground line-clamp-1">{program.prerequisites}</span>
                          </div>
                          )}
                          {program.duration && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                                {program.duration}
                            </span>
                          </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{program.level || "beginner"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{moduleCount} modules</span>
                          </div>
                          <Badge className={`text-xs ${
                            isPublished 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-xs">{program.level || "Beginner"}</Badge>
                          <Link href={`/content-management/courses/${program.id}/edit`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 hover:bg-muted"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No programs found</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    No programs match your current search and filter criteria.
                  </p>
                  <Button onClick={() => { 
                    setSearchTerm(""); 
                    setFilterStatus("all"); 
                    setFilterType("all");
                    setFilterSource("all");
                  }}>
                    Clear filters
                  </Button>
                </div>
              )}
            
            </div>
          </CardContent>
        </>
      )}
      
      {isViewMode('list') && (
        <>
          <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b">
            <div className="space-y-1">
              <CardTitle>Learning Programs</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your educational programs</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search programs..."
                    className="pl-9 w-[220px] h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("all")}
                      className={filterStatus === "all" ? "bg-accent text-accent-foreground" : ""}
                    >
                      All Programs
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("published")}
                      className={filterStatus === "published" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Published Programs
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("draft")}
                      className={filterStatus === "draft" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Draft Programs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="border rounded-md p-1 flex bg-muted/30">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('card') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('list') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button asChild className="gap-2">
                  <Link href="/content-management/cohorts/create">
                    <Plus className="h-4 w-4" />
                    <span>Create Cohort</span>
                </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <CardContent className="p-0">
            <Table className="border-collapse">
                <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Program Code</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Organization</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Modules</TableHead>
                <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                          <p className="text-muted-foreground">Loading programs...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((program) => {
                      const isPublished = program.status === 'published';
                      const moduleCount = getModuleCountForProgram(program);
                      return (
                  <TableRow 
                          key={program.id}
                          style={{borderLeft: isPublished ? '4px solid rgb(34, 197, 94)' : '4px solid rgb(245, 158, 11)'}}
                    className="hover:bg-muted/50 transition-colors"
                  >
                          <TableCell className="font-medium">{program.program_code}</TableCell>
                          <TableCell>{program.title}</TableCell>
                          <TableCell>{program.prerequisites || "None"}</TableCell>
                        <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {program.level || "beginner"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            {isPublished ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Published</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">Draft</span>
                        </div>
                      )}
                        </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <span>{moduleCount}</span>
                      </div>
                    </TableCell>
                        <TableCell className="text-right">
                            <Link href={`/content-management/courses/${program.id}/edit`}>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
                                <Edit className="h-4 w-4" />
                            Edit
                              </Button>
                            </Link>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-3 text-muted-foreground/50" />
                        <p>No programs found. Try adjusting your search or create a new program.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </CardContent>
        </>
      )}
    </div>
  );
}

// Modules Tab Content
export function ModulesTabContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch modules data from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const { getAllModules } = await import("@/lib/api/modules");
        const data = await getAllModules();
        setModules(data || []);
      } catch (error) {
        console.error("Failed to load modules:", error);
        toast.error("Failed to load modules. Please try again.");
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModules();
  }, []);
  
  // Helper function to check view mode
  const isViewMode = (mode: string) => viewMode === mode;
  
  // Filter modules based on search term and status
  const filteredModules = modules.filter(module => {
    const matchesSearch = 
      module.module_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.module_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "complete" && module.status === "published") ||
      (filterStatus === "incomplete" && module.status === "draft");
      
    return matchesSearch && matchesStatus;
  });

  // Helper function to get gradient background color based on module status
  const getGradientBg = (status: string = "draft") => {
    const gradientMap: Record<string, string> = {
      published: "bg-gradient-to-r from-green-500 to-green-600",
      draft: "bg-gradient-to-r from-yellow-400 to-yellow-500"
    };
    
    return gradientMap[status] || "bg-gradient-to-r from-yellow-400 to-yellow-500";
  };

  // Helper function to get status display
  const getModuleStatusDisplay = (status: string) => {
    switch (status) {
      case "published":
        return {
          badge: "PUBLISHED",
          icon: <CheckCircle className="h-5 w-5" />,
          textClass: "text-green-600",
          text: "Published"
        };
      case "draft":
      default:
        return {
          badge: "DRAFT",
          icon: <Clock className="h-5 w-5" />,
          textClass: "text-amber-600",
          text: "Draft"
        };
    }
  };

  if (loading) {
    return (
      <Card className="shadow-md border-muted">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <div className="space-y-1">
            <CardTitle>Learning Modules</CardTitle>
            <p className="text-sm text-muted-foreground">Loading modules...</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading modules...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {isViewMode('card') && (
        <>
          <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b">
            <div className="space-y-1">
              <CardTitle>Learning Modules</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your educational modules</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search modules..."
                    className="pl-9 w-[220px] h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("all")}
                      className={filterStatus === "all" ? "bg-accent text-accent-foreground" : ""}
                    >
                      All Modules
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("complete")}
                      className={filterStatus === "complete" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Active Modules
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("incomplete")}
                      className={filterStatus === "incomplete" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Draft/Inactive Modules
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="border rounded-md p-1 flex bg-muted/30">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('card') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('list') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Link href="/content-management/modules/create">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </Button>
              </Link>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => {
                  const statusDisplay = getModuleStatusDisplay(module.status);
                  return (
                  <Card 
                    key={module.id} 
                    className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-transparent"
                  >
                      <div className={`${getGradientBg(module.status)} h-36 text-white`}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-bold truncate">{module.module_code}</h3>
                            <p className="text-white/90 mt-1 font-medium line-clamp-2">{module.module_title}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-2 flex items-center justify-between">
                        <Badge 
                          className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-800 font-semibold text-xs px-3"
                        >
                            {statusDisplay.badge}
                        </Badge>
                        <div className="flex gap-2">
                          <Link href={`/content-management/modules/${module.id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                className="flex items-center gap-1"
                            >
                              <BookOpen className="h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/content-management/modules/${module.id}/edit`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                className="flex items-center gap-1 hover:bg-white/10"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-3 text-muted-foreground/50" />
                  <p className="text-center">No modules found. Try adjusting your search or create a new module.</p>
                </div>
              )}
            </div>
          </CardContent>
        </>
      )}
      
      {isViewMode('list') && (
        <>
          <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b">
            <div className="space-y-1">
              <CardTitle>Learning Modules</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your educational content modules</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search modules..."
                    className="pl-9 w-[220px] h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("all")}
                      className={filterStatus === "all" ? "bg-accent text-accent-foreground" : ""}
                    >
                      All Modules
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("complete")}
                      className={filterStatus === "complete" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Active Modules
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("incomplete")}
                      className={filterStatus === "incomplete" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Draft/Inactive Modules
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="border rounded-md p-1 flex bg-muted/30">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('card') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('list') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Link href="/content-management/modules/create">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </Button>
              </Link>
            </div>
          </div>
          <CardContent className="p-6">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Module Code</TableHead>
                  <TableHead className="font-semibold">Module Title</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Topics</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.length > 0 ? (
                  filteredModules.map((module) => {
                    const statusDisplay = getModuleStatusDisplay(module.status);
                    return (
                    <TableRow 
                      key={module.id}
                      className="hover:bg-muted/20 transition-colors"
                      style={{
                          borderLeft: module.status === 'published' 
                          ? '4px solid var(--green-500)' 
                            : module.status === 'draft'
                              ? '4px solid var(--gray-500)'
                          : '4px solid var(--yellow-500)',
                          background: module.status === 'published'
                          ? 'linear-gradient(270deg, transparent 0%, var(--green-50) 100%)'
                            : module.status === 'draft'
                              ? 'linear-gradient(270deg, transparent 0%, var(--gray-50) 100%)'
                          : 'linear-gradient(270deg, transparent 0%, var(--yellow-50) 100%)'
                      }}
                    >
                        <TableCell className="font-medium">{module.module_code}</TableCell>
                      <TableCell>
                          <div>
                            <div className="font-medium">{module.module_title}</div>
                            <div className="text-sm text-muted-foreground">{module.module_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${statusDisplay.textClass}`}>
                            {statusDisplay.icon}
                            <span className="font-medium">{statusDisplay.text}</span>
                          </div>
                      </TableCell>
                        <TableCell>{module.topics?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/content-management/modules/${module.id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                className="flex items-center gap-1"
                            >
                              <BookOpen className="h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/content-management/modules/${module.id}/edit`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                className="flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-3 text-muted-foreground/50" />
                        <p>No modules found. Try adjusting your search or create a new module.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </>
      )}
    </div>
  );
}

// Topics Tab Content
export function TopicsTabContent() {
  const [viewMode, setViewMode] = useState("card");
  
  // Use our new topics hook
  const {
    topics,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus
  } = useTopics();
  
  // Helper function to check view mode
  const isViewMode = (mode: string) => viewMode === mode;
  
  // Map API status to UI filter status
  const getFilterStatus = () => {
    if (selectedStatus === "published") return "complete";
    if (selectedStatus === "draft") return "incomplete";
    return "all";
  };
  
  const filterStatus = getFilterStatus();
  
  // Handle filter status changes
  const handleFilterStatusChange = (status: string) => {
    if (status === "complete") setSelectedStatus("published");
    else if (status === "incomplete") setSelectedStatus("draft");
    else setSelectedStatus("all");
  };
  
  // Filter topics based on search term and status
  const filteredTopics = topics.filter((topic: TopicResponse) => {
    const matchesSearch = 
      topic.topic_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "complete" && topic.status === "published") ||
      (filterStatus === "incomplete" && topic.status === "draft");
      
    return matchesSearch && matchesStatus;
  });

  // Helper function to get gradient background color based on topic status
  const getGradientBg = (status: string = "draft") => {
    const gradientMap: Record<string, string> = {
      published: "bg-gradient-to-r from-green-500 to-green-600",
      draft: "bg-gradient-to-r from-yellow-400 to-yellow-500",
      archived: "bg-gradient-to-r from-gray-400 to-gray-500"
    };
    
    return gradientMap[status] || "bg-gradient-to-r from-green-500 to-green-600";
  };

  if (isLoading) {
    return (
      <Card className="shadow-md border-muted">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <div className="space-y-1">
            <CardTitle>Learning Topics</CardTitle>
            <p className="text-sm text-muted-foreground">Manage your educational content topics</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading topics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {isViewMode('card') && (
        <>
          <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b">
            <div className="space-y-1">
              <CardTitle>Learning Topics</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your educational content topics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search topics..."
                    className="pl-9 w-[220px] h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleFilterStatusChange("all")}
                      className={filterStatus === "all" ? "bg-accent text-accent-foreground" : ""}
                    >
                      All Topics
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleFilterStatusChange("complete")}
                      className={filterStatus === "complete" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Published Topics
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleFilterStatusChange("incomplete")}
                      className={filterStatus === "incomplete" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Draft Topics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="border rounded-md p-1 flex bg-muted/30">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('card') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('list') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Ingest Content
                </Button>
                <Link href="/content-management/topics/create">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Topic
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <Card 
                    key={topic.id} 
                    className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-transparent"
                  >
                    <div className={`${getGradientBg(topic.status)} text-white h-36 flex flex-col`}>
                      <CardHeader className="py-2 px-4 flex-grow">
                        <div className="flex flex-col h-full">
                          <div>
                            <h3 className="text-lg font-bold truncate">{topic.topic_code}</h3>
                            <p className="text-white/90 font-medium line-clamp-2 min-h-[40px]">{topic.title}</p>
                          </div>
                          <p className="text-white/75 text-xs line-clamp-1 mt-auto">{topic.description}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-2 pt-0 border-t border-white/10">
                        <div className="flex items-center justify-between">
                        <Badge 
                            className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-800 font-semibold text-xs px-2 py-0.5"
                        >
                            {topic.status === 'published' ? 'PUBLISHED' : topic.status === 'draft' ? 'DRAFT' : 'ARCHIVED'}
                        </Badge>
                          <div className="flex gap-1">
                          <Link href={`/content-management/topics/${topic.id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                className="h-6 w-6 p-0 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20"
                                title="View Topic"
                            >
                                <BookOpen className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Link href={`/content-management/topics/${topic.id}/edit`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                className="h-6 w-6 p-0 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20"
                                title="Edit Topic"
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="bg-muted/30 rounded-full p-3 mb-4">
                    <FileX className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No topics found</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "Create your first topic to get started"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </>
      )}
      
      {isViewMode('list') && (
        <>
          <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b">
            <div className="space-y-1">
              <CardTitle>Learning Topics</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your educational content topics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search topics..."
                    className="pl-9 w-[220px] h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => getFilterStatus("all")}
                      className={filterStatus === "all" ? "bg-accent text-accent-foreground" : ""}
                    >
                      All Topics
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("complete")}
                      className={filterStatus === "complete" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Published Topics
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterStatus("incomplete")}
                      className={filterStatus === "incomplete" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Draft Topics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="border rounded-md p-1 flex bg-muted/30">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('card') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-8 px-2 ${isViewMode('list') ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Ingest Content
                </Button>
                <Link href="/content-management/topics/create">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Topic
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium">{topic.topic_code}</TableCell>
                      <TableCell>{topic.title}</TableCell>
                      <TableCell>
                        {topic.status === 'published' ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Published
                          </Badge>
                        ) : topic.status === 'draft' ? (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            Archived
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(topic.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/content-management/topics/${topic.id}`}>
                            <Button variant="ghost" size="sm">
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/content-management/topics/${topic.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                        </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              {topic.status === 'draft' && (
                                <DropdownMenuItem>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {topic.status === 'published' && (
                                <DropdownMenuItem>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Unpublish
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No topics found. Try adjusting your search or create a new topic.
                    </TableCell>
                  </TableRow>
                )}
                </TableBody>
              </Table>
          </CardContent>
        </>
      )}
      {/* List view implementation would go here */}
    </div>
  );
} 