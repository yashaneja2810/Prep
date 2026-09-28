"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Calendar, Users, Building, Edit, Trash, Clock, CheckCircle, UserPlus, Download, Settings, Mail, Github as GithubIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCohortById, deleteCohort, getCohortTrainers, getCohortLearners } from "@/lib/api/cohorts";
import { toast } from "sonner";

export default function CohortDetailsPage() {
  const router = useRouter();
  // Use the useParams hook to get the dynamic route parameters
  const params = useParams();
  const cohortId = params.id as string;
  
  const [cohort, setCohort] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [learners, setLearners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch cohort details
  useEffect(() => {
    async function fetchCohortDetails() {
      if (!cohortId) return;
      
      try {
        setLoading(true);
        // Fetch cohort data
        const cohortData = await getCohortById(cohortId);
        setCohort(cohortData);
        
        // Fetch trainers
        const trainersData = await getCohortTrainers(cohortId);
        setTrainers(trainersData);
        
        // Fetch learners
        const learnersData = await getCohortLearners(cohortId);
        setLearners(learnersData);
        
        setError(null);
      } catch (error) {
        console.error("Error fetching cohort details:", error);
        setError("Failed to load cohort details. Please try again.");
        toast.error("Failed to load cohort details");
      } finally {
        setLoading(false);
      }
    }

    fetchCohortDetails();
  }, [cohortId]);

  // Handle delete cohort
  const handleDeleteCohort = async () => {
    if (!confirm("Are you sure you want to delete this cohort? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteCohort(cohortId);
      toast.success("Cohort deleted successfully");
      router.push("/content-management?tab=cohorts");
    } catch (error) {
      console.error("Error deleting cohort:", error);
      toast.error("Failed to delete cohort");
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Active
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Upcoming
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="border-gray-200 text-gray-800">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  if (loading) {
    return (
      <>
        <PageContainer>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </PageContainer>
      </>
    );
  }

  if (error || !cohort) {
    return (
      <>
        <PageContainer>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive mb-4">{error || "Cohort not found"}</p>
            <Button onClick={() => router.push("/content-management?tab=cohorts")}>
              Back to Cohorts
            </Button>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Back button and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Button 
              variant="outline" 
              className="sm:w-auto w-full justify-start"
              onClick={() => router.push("/content-management?tab=cohorts")}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Cohorts
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="sm:w-auto w-full"
                onClick={() => router.push(`/content-management/cohorts/${cohortId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Cohort
              </Button>
              <Button 
                variant="destructive" 
                className="sm:w-auto w-full"
                onClick={handleDeleteCohort}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          
          {/* Cohort title and badge */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{cohort.title}</h1>
              {getStatusBadge(cohort.status)}
            </div>
            <div className="text-muted-foreground">
              <p>Code: <span className="font-mono font-medium">{cohort.cohort_code}</span></p>
            </div>
          </div>
          
          {/* Main content */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-md grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trainers">Trainers</TabsTrigger>
                <TabsTrigger value="learners">Learners</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="shadow-sm border-muted">
                  <CardHeader className="border-b bg-muted/40">
                    <CardTitle className="text-xl">Cohort Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Program</h3>
                          <p className="text-base">{cohort.program?.title || "No program specified"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Organization</h3>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <p className="text-base">{cohort.organization?.org_name || "Direct (No Organization)"}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Scope</h3>
                          <p className="capitalize text-base">{cohort.scope}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="text-base">
                              {formatDate(cohort.start_date)} - {formatDate(cohort.end_date)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Participants</h3>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{trainers.length} Trainers</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <UserPlus className="h-4 w-4 text-muted-foreground" />
                              <span>{learners.length} Learners</span>
                            </div>
                          </div>
                        </div>
                        
                        {cohort.github_repo_link && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">GitHub Repository</h3>
                            <div className="flex items-center gap-2">
                              <GithubIcon className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={cohort.github_repo_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <span>Repository Link</span>
                                <LinkIcon className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {cohort.description && (
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-medium mb-2">Description</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{cohort.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Trainers Tab */}
              <TabsContent value="trainers" className="space-y-6">
                <Card className="shadow-sm border-muted">
                  <CardHeader className="border-b bg-muted/40 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Trainers</CardTitle>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Trainer
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {trainers.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trainers.map((trainer) => (
                            <TableRow key={trainer.id}>
                              <TableCell className="font-medium">
                                {trainer.user?.first_name} {trainer.user?.last_name || ''}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span>{trainer.user?.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {trainer.is_primary ? (
                                  <Badge>Primary Trainer</Badge>
                                ) : (
                                  <span className="text-muted-foreground">Co-Trainer</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 mb-3 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium">No trainers assigned</h3>
                        <p className="text-muted-foreground mb-4">This cohort doesn't have any trainers yet.</p>
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Trainer
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Learners Tab */}
              <TabsContent value="learners" className="space-y-6">
                <Card className="shadow-sm border-muted">
                  <CardHeader className="border-b bg-muted/40 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Learners</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Learner
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {learners.length > 0 ? (
                      <div>
                        <div className="p-4 border-b bg-muted/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{learners.length} Learners</p>
                            </div>
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {learners.map((learner) => (
                              <TableRow key={learner.id}>
                                <TableCell className="font-medium">
                                  {learner.user?.first_name} {learner.user?.last_name || ''}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{learner.user?.email}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {learner.joined_at ? formatDate(learner.joined_at) : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 mb-3 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium">No learners enrolled</h3>
                        <p className="text-muted-foreground mb-4">This cohort doesn't have any learners yet.</p>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm">
                            Import Learners
                          </Button>
                          <Button size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Learner
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageContainer>
    </>
  );
} 