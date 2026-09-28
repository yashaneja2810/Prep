"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, X, Calendar, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getCohortById, updateCohort, UpdateCohortDto, getCohortTrainers, getCohortLearners, updateCohortTrainers, updateCohortLearners } from "@/lib/api/cohorts";
import { getAllPrograms } from "@/lib/api/programs";
import { getAllTrainerProfiles } from "@/lib/api/trainers";
import { getLearners, User as ApiUser } from "@/lib/api/users";
import { toast } from "sonner";
import { TrainerProfile } from "@/store/slices/trainers";

// Define a type for user
interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
}

// Define a custom trainer interface for this component
interface ComponentTrainer {
  id: string;
  user_id: string;
  first_name?: string;
  email?: string;
  specialities?: any[];
  is_active?: boolean;
  total_years_teaching?: number;
  bio?: string;
  expertise?: string;
  linkedin_url?: string;
  website?: string;
  profile_image?: string;
  social_links?: Record<string, string>;
}

// Interface for the component state
interface LocalCohortFormState extends UpdateCohortDto {
  // Additional fields for UI state management
  program_id?: string;
  cohort_code?: string;
  trainer_ids: string[];
  learners: Array<{ id?: string; name: string; email: string }>;
}

// Define a type for CohortUser returned by getCohortTrainers
interface CohortUser {
  id: string;
  cohort_id: string;
  user_id: string;
  assigned_at?: string;
  is_primary?: boolean;
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export default function EditCohortPage() {
  const router = useRouter();
  const params = useParams();
  const cohortId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [programs, setPrograms] = useState<{id: string; title: string}[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [availableTrainers, setAvailableTrainers] = useState<ComponentTrainer[]>([]);
  const [availableLearners, setAvailableLearners] = useState<ApiUser[]>([]);
  const [learners, setLearners] = useState<User[]>([]);
  const [allCohortTrainers, setAllCohortTrainers] = useState<CohortUser[]>([]);
  const [cohortData, setCohortData] = useState<LocalCohortFormState>({
    title: "",
    description: "",
    program_id: "",
    org_id: "",
    scope: "direct",
    start_date: "",
    end_date: "",
    github_repo_link: "",
    status: "upcoming",
    cohort_code: "",
    trainer_ids: [],
    learners: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available programs and cohort data
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch programs
        const programsData = await getAllPrograms();
        setPrograms(programsData.map(p => ({ id: p.id, title: p.title })));
        
        // Fetch all available trainers
        const allTrainers = await getAllTrainerProfiles();
        console.log('Available trainers:', allTrainers); // Debug log
        setAvailableTrainers(allTrainers as ComponentTrainer[]);
        
        // Fetch available learners for selection
        const availableLearnersData = await getLearners();
        console.log('Available learners:', availableLearnersData); // Debug log
        setAvailableLearners(availableLearnersData);
        
        // Fetch cohort data
        const cohortDetails = await getCohortById(cohortId);
        
        // Fetch trainers
        const trainersData = await getCohortTrainers(cohortId);
        console.log('Cohort trainers data:', trainersData); // Debug log
        setAllCohortTrainers(trainersData);
        
        // Create a list of trainer users from the trainer data
        const trainerUsers = trainersData.map(trainer => {
          if (!trainer.user) {
            console.error('Trainer missing user data:', trainer);
            return {
              id: trainer.user_id,
              first_name: '',
              last_name: '',
              email: ''
            };
          }
          
          return {
            id: trainer.user_id,
            first_name: trainer.user?.first_name || '',
            last_name: trainer.user?.last_name || '',
            email: trainer.user?.email || ''
          };
        });
        
        // Extract trainer IDs for form state
        const trainerIds = trainersData.map(trainer => trainer.user_id);
        setTrainers(trainerUsers);
        
        // Fetch learners
        const learnersData = await getCohortLearners(cohortId);
        const formattedLearners = learnersData.map(learner => ({
          id: learner.id,
          name: `${learner.user?.first_name || ''} ${learner.user?.last_name || ''}`.trim() || learner.user?.email,
          email: learner.user?.email || ''
        }));
        
        // Create a list of learner users from the learner data
        const learnerUsers = learnersData.map(learner => ({
          id: learner.user_id,
          first_name: learner.user?.first_name || '',
          last_name: learner.user?.last_name || '',
          email: learner.user?.email || ''
        }));
        setLearners(learnerUsers);
        
        // Format dates for form inputs
        const formattedStartDate = cohortDetails.start_date ? 
          new Date(cohortDetails.start_date).toISOString().split('T')[0] : '';
        const formattedEndDate = cohortDetails.end_date ? 
          new Date(cohortDetails.end_date).toISOString().split('T')[0] : '';
        
        // Set cohort data
        setCohortData({
          title: cohortDetails.title,
          description: cohortDetails.description || '',
          program_id: cohortDetails.program_id,
          org_id: cohortDetails.org_id || '',
          scope: cohortDetails.scope,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          github_repo_link: cohortDetails.github_repo_link || '',
          status: cohortDetails.status,
          cohort_code: cohortDetails.cohort_code,
          trainer_ids: trainerIds,
          learners: formattedLearners
        });
        
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load cohort data. Please try again.");
        toast.error("Failed to load cohort data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [cohortId]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCohortData({
      ...cohortData,
      [name]: value
    });
  };

  // Handle select field changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === "scope") {
      setCohortData({
        ...cohortData,
        scope: value as "direct" | "organization",
        // Clear org_id if switching to direct scope
        org_id: value === "direct" ? "" : cohortData.org_id,
      });
    } else {
      setCohortData({
        ...cohortData,
        [name]: value
      });
    }
  };

  // Remove trainer
  const removeTrainer = (index: number) => {
    const updatedTrainers = (cohortData.trainer_ids || []).filter((_, i) => i !== index);
    setCohortData({
      ...cohortData,
      trainer_ids: updatedTrainers
    });
  };

  // Remove learner
  const removeLearner = (index: number) => {
    const updatedLearners = cohortData.learners.filter((_, i) => i !== index);
    setCohortData({
      ...cohortData,
      learners: updatedLearners
    });
  };

  // Add a trainer
  const addTrainer = (userId: string) => {
    // Check if user is already added as a trainer
    if ((cohortData.trainer_ids || []).includes(userId)) {
      toast.error("This trainer is already added to the cohort");
      return;
    }
    
    setCohortData({
      ...cohortData,
      trainer_ids: [...(cohortData.trainer_ids || []), userId]
    });
  };

  // Add a learner
  const addLearner = (user: ApiUser) => {
    // Check if learner is already added
    const isAlreadyAdded = cohortData.learners.some(learner => 
      learner.email?.toLowerCase() === user.email?.toLowerCase()
    );
    
    if (isAlreadyAdded) {
      toast.error("This learner is already added to the cohort");
      return;
    }
    
    // Add the new learner to the list
    const newLearner = {
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      email: user.email
    };
    
    setCohortData({
      ...cohortData,
      learners: [...cohortData.learners, newLearner]
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cohortData.title || !cohortData.start_date || !cohortData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare update data
      const updateData: UpdateCohortDto = {
        title: cohortData.title,
        description: cohortData.description,
        scope: cohortData.scope,
        start_date: cohortData.start_date,
        end_date: cohortData.end_date,
        github_repo_link: cohortData.github_repo_link,
        status: cohortData.status
      };
      
      // Only include org_id if scope is organization
      if (cohortData.scope === "organization" && cohortData.org_id) {
        updateData.org_id = cohortData.org_id;
      }
      
      // Update cohort basic info
      await updateCohort(cohortId, updateData);
      
      // Update trainers
      await updateCohortTrainers(cohortId, cohortData.trainer_ids);
      
      // Update learners
      await updateCohortLearners(cohortId, cohortData.learners);
      
      toast.success("Cohort updated successfully");
      router.push(`/content-management/cohorts/${cohortId}`);
    } catch (error) {
      console.error("Error updating cohort:", error);
      toast.error("Failed to update cohort");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <>
        <PageContainer>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => router.push(`/content-management/cohorts/${cohortId}`)}>
              Back to Cohort Details
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
          {/* Back button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/content-management/cohorts/${cohortId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Cohort Details
            </Button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="info">Basic Information</TabsTrigger>
                <TabsTrigger value="trainers">Trainers</TabsTrigger>
                <TabsTrigger value="learners">Learners</TabsTrigger>
              </TabsList>
              
              {/* Basic Information Tab */}
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cohort Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cohort Code - Read-only */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="cohort_code">Cohort Code</Label>
                        <Input 
                          id="cohort_code" 
                          name="cohort_code" 
                          value={cohortData.cohort_code} 
                          disabled 
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Cohort Title <span className="text-destructive">*</span></Label>
                      <Input 
                        id="title" 
                        name="title" 
                        value={cohortData.title} 
                        onChange={handleChange} 
                        placeholder="Enter cohort title"
                        required
                      />
                    </div>
                    
                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        value={cohortData.description} 
                        onChange={handleChange} 
                        placeholder="Enter cohort description"
                        rows={4}
                      />
                    </div>
                    
                    {/* Program - Read-only */}
                    <div>
                      <Label htmlFor="program_id">Program</Label>
                      <Select 
                        value={cohortData.program_id} 
                        disabled
                      >
                        <SelectTrigger className="bg-muted">
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Scope */}
                    <div>
                      <Label htmlFor="scope">Scope</Label>
                      <Select 
                        value={cohortData.scope} 
                        onValueChange={(value) => handleSelectChange("scope", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">Direct</SelectItem>
                          <SelectItem value="organization">Organization</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Organization (conditional) */}
                    {cohortData.scope === "organization" && (
                      <div>
                        <Label htmlFor="orgName">Organization</Label>
                        <Select 
                          value={cohortData.org_id} 
                          onValueChange={(value) => handleSelectChange("org_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GamutX Academy">GamutX Academy</SelectItem>
                            <SelectItem value="TechCorp Inc.">TechCorp Inc.</SelectItem>
                            <SelectItem value="Aptitude Systems">Aptitude Systems</SelectItem>
                            <SelectItem value="Global Solutions">Global Solutions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Input 
                            id="start_date" 
                            name="start_date" 
                            type="date" 
                            value={cohortData.start_date} 
                            onChange={handleChange} 
                            required
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Input 
                            id="end_date" 
                            name="end_date" 
                            type="date" 
                            value={cohortData.end_date} 
                            onChange={handleChange} 
                            required
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    
                    {/* GitHub Repo Link */}
                    <div>
                      <Label htmlFor="github_repo_link">GitHub Repository Link</Label>
                      <Input 
                        id="github_repo_link" 
                        name="github_repo_link" 
                        value={cohortData.github_repo_link || ''} 
                        onChange={handleChange} 
                        placeholder="https://github.com/organization/repo"
                      />
                    </div>
                    
                    {/* Status */}
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={cohortData.status} 
                        onValueChange={(value) => handleSelectChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Trainers Tab */}
              <TabsContent value="trainers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trainers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Available Trainers */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Available Trainers</h3>
                      <div className="border rounded-md mb-4 max-h-60 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className="w-[100px]">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableTrainers.length > 0 ? (
                              availableTrainers.map((trainer) => {
                                // Get name and email directly from trainer profile
                                const firstName = trainer.first_name || '';
                                const email = trainer.email || '';
                                const userId = trainer.user_id;
                                
                                // Skip if already added to cohort
                                if (cohortData.trainer_ids.includes(userId)) {
                                  return null;
                                }
                                
                                return (
                                  <TableRow key={userId}>
                                    <TableCell>
                                      {firstName || 'No name'}
                                    </TableCell>
                                    <TableCell>{email || 'No email'}</TableCell>
                                    <TableCell>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => addTrainer(userId)}
                                      >
                                        <UserPlus className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              }).filter(Boolean)
                            ) : (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                  No trainers found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    {/* Current Trainers */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Current Trainers</h3>
                      {cohortData.trainer_ids.length > 0 ? (
                        <div className="space-y-2">
                          {cohortData.trainer_ids.map((trainerId, index) => {
                            // Find the trainer in cohort trainers
                            const cohortTrainer = allCohortTrainers.find(t => t.user_id === trainerId);
                            if (cohortTrainer) {
                              return (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                                  <div>
                                    <p className="font-medium">
                                      {`${cohortTrainer.user?.first_name || ''} ${cohortTrainer.user?.last_name || ''}`.trim() || cohortTrainer.user?.email}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{cohortTrainer.user?.email}</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeTrainer(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            }
                            
                            // Fallback to available trainers if not found in cohort trainers
                            const availableTrainer = availableTrainers.find(t => t.user_id === trainerId);
                            if (availableTrainer) {
                              const firstName = availableTrainer.first_name || '';
                              const email = availableTrainer.email || '';
                              
                              return (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                                  <div>
                                    <p className="font-medium">{firstName || email}</p>
                                    <p className="text-sm text-muted-foreground">{email}</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeTrainer(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            }
                            
                            // Fallback to trainers array
                            const user = trainers.find(u => u.id === trainerId);
                            return (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                                <div>
                                  <p className="font-medium">{user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Unknown User'}</p>
                                  <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeTrainer(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No trainers selected</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Learners Tab */}
              <TabsContent value="learners" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learners</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Available Learners */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Available Learners</h3>
                      <div className="border rounded-md mb-4 max-h-60 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className="w-[100px]">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableLearners.length > 0 ? (
                              availableLearners.map((learner) => {
                                const name = `${learner.first_name || ''} ${learner.last_name || ''}`.trim();
                                const isAlreadyAdded = cohortData.learners.some(
                                  existingLearner => existingLearner.email?.toLowerCase() === learner.email?.toLowerCase()
                                );
                                return (
                                  <TableRow key={learner.id}>
                                    <TableCell>{name || 'No name'}</TableCell>
                                    <TableCell>{learner.email}</TableCell>
                                    <TableCell>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => addLearner(learner)}
                                        disabled={isAlreadyAdded}
                                      >
                                        <UserPlus className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                  No learners found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    {/* Selected Learners */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Current Learners</h3>
                      {cohortData.learners.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="w-[100px]">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cohortData.learners.map((learner, index) => (
                                <TableRow key={index}>
                                  <TableCell>{learner.name || learner.email}</TableCell>
                                  <TableCell>{learner.email}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => removeLearner(index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center p-4 border rounded-md">
                          <p className="text-muted-foreground">No learners added</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Form Actions */}
            <div className="mt-8 flex justify-end gap-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.push(`/content-management/cohorts/${cohortId}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></span>
                    Updating...
                  </span>
                ) : (
                  'Update Cohort'
                )}
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </>
  );
}
