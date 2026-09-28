"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {  Calendar, Users, UserPlus, Mail, Upload, FileText, Building, AlignLeft, Settings, ArrowRight, GraduationCap, BookOpen, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { createCohort, CreateCohortDto } from "@/lib/api/cohorts";
import { getAllPrograms } from "@/lib/api/programs";
import { getLearners, User } from "@/lib/api/users";
import { getAllTrainerProfiles } from "@/lib/api/trainers";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

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
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

// Add a local interface for the component state
interface LocalCohortFormState extends CreateCohortDto {
  // Additional fields for UI state management
  trainer_ids: string[]; // Added for UI state management
  learner_ids?: string[]; // Added for API consistency
}

export default function CreateCohortPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programs, setPrograms] = useState<{id: string; title: string}[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [availableTrainers, setAvailableTrainers] = useState<ComponentTrainer[]>([]);
  const [learners, setLearners] = useState<User[]>([]);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(true);
  const [isLoadingLearners, setIsLoadingLearners] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [learnerSearchTerm, setLearnerSearchTerm] = useState("");
  const [cohortData, setCohortData] = useState<LocalCohortFormState>({
    cohort_code: "",
    title: "",
    description: "",
    program_id: "",
    org_id: "",
    scope: "direct",
    start_date: "",
    end_date: "",
    github_repo_link: "",
    status: "upcoming",
    trainer_ids: [],
    learner_ids: [],
  });

  useEffect(() => {
    // Fetch available programs, trainers, and learners
    async function fetchData() {
      try {
        // Fetch programs
        const programsData = await getAllPrograms();
        setPrograms(programsData && Array.isArray(programsData) ? programsData.map(p => ({ id: p.id, title: p.title })) : []);
        
        // Fetch trainers
        setIsLoadingTrainers(true);
        try {
          const trainersData = await getAllTrainerProfiles();
          console.log('Trainers data:', trainersData); // Debug log
          // Ensure trainers is always an array
          if (trainersData && Array.isArray(trainersData)) {
            setAvailableTrainers(trainersData as ComponentTrainer[]);
            
            // Create a simplified list of trainers for UI
            const simplifiedTrainers = trainersData.map(trainer => ({
              id: trainer.user_id,
              email: trainer.email || '',
              first_name: trainer.first_name || '',
              last_name: ''
            }));
            setTrainers(simplifiedTrainers);
          } else {
            setAvailableTrainers([]);
            setTrainers([]);
            console.error('Invalid trainers data format:', trainersData);
          }
        } catch (error) {
          console.error("Failed to fetch trainers:", error);
          setAvailableTrainers([]);
          setTrainers([]);
          toast.error("Failed to load trainers");
        } finally {
          setIsLoadingTrainers(false);
        }
        
        // Fetch learners
        setIsLoadingLearners(true);
        try {
          const learnersData = await getLearners();
          // Ensure learners is always an array
          setLearners(Array.isArray(learnersData) ? learnersData : []);
        } catch (error) {
          console.error("Failed to fetch learners:", error);
          setLearners([]);
          toast.error("Failed to load learners");
        } finally {
          setIsLoadingLearners(false);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load necessary data");
      }
    }
    
    fetchData();
  }, []);

  // Generate cohort code based on organization name or program
  const generateCohortCode = (prefix: string): string => {
    const serialNo = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `${prefix}_${serialNo}`;
  };

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
      // When scope changes, update the cohort code accordingly
      let newCohortCode = cohortData.cohort_code;
      if (value === "direct") {
        // For direct scope, generate code based on "GX" prefix if we have a program selected
        if (cohortData.program_id) {
          const program = programs.find(p => p.id === cohortData.program_id);
          if (program) {
            newCohortCode = generateCohortCode("GX");
          }
        }
      } else if (value === "organization" && cohortData.org_id) {
        // For organization scope, generate code based on org name if we have an org selected
        newCohortCode = generateCohortCode(getOrgPrefix(cohortData.org_id));
      }
      
      setCohortData({
        ...cohortData,
        scope: value as "direct" | "organization",
        // Clear org_id if switching to direct scope
        org_id: value === "direct" ? "" : cohortData.org_id,
        cohort_code: newCohortCode
      });
    }
    else if (name === "program_id") {
      // When program changes
      const newState: Partial<LocalCohortFormState> = {
        program_id: value
      };
      
      // Generate cohort code for direct scope based on program
      if (cohortData.scope === "direct") {
        newState.cohort_code = generateCohortCode("GX");
      }
      
      setCohortData({
        ...cohortData,
        ...newState
      });
    }
    else if (name === "orgName" && cohortData.scope === "organization") {
      // Auto-generate cohort code when organization is selected and scope is organization
      const cohort_code = generateCohortCode(getOrgPrefix(value));
      setCohortData({
        ...cohortData,
        org_id: value,
        cohort_code
      });
    } 
    else {
      setCohortData({
        ...cohortData,
        [name]: value
      });
    }
  };
  
  // Helper function to get organization prefix
  const getOrgPrefix = (orgName: string): string => {
    if (orgName === "GamutX Academy") return "GXT";
    if (orgName === "TechCorp Inc.") return "CMP";
    if (orgName === "Aptitude Systems") return "APT";
    if (orgName === "Global Solutions") return "GLS";
    // Default: take first 3 letters of org name
    return orgName.substring(0, 3).toUpperCase();
  };

  // Toggle trainer selection
  const toggleTrainer = (trainerId: string) => {
    if (cohortData.trainer_ids.includes(trainerId)) {
      // Remove trainer if already selected
      setCohortData({
        ...cohortData,
        trainer_ids: cohortData.trainer_ids.filter(id => id !== trainerId)
      });
    } else {
      // Add trainer if not selected
      setCohortData({
        ...cohortData,
        trainer_ids: [...cohortData.trainer_ids, trainerId]
      });
    }
  };

  // Toggle learner selection
  const toggleLearner = (learnerId: string) => {
    const updatedLearnerIds = cohortData.learner_ids || [];
    
    if (updatedLearnerIds.includes(learnerId)) {
      // Remove learner if already selected
      setCohortData({
        ...cohortData,
        learner_ids: updatedLearnerIds.filter(id => id !== learnerId)
      });
    } else {
      // Add learner if not selected
      setCohortData({
        ...cohortData,
        learner_ids: [...updatedLearnerIds, learnerId]
      });
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!cohortData.title.trim()) {
      toast.error("Please enter a cohort title");
      return;
    }
    
    if (!cohortData.program_id) {
      toast.error("Please select a program");
      return;
    }
    
    if (!cohortData.start_date) {
      toast.error("Please select a start date");
      return;
    }
    
    if (!cohortData.end_date) {
      toast.error("Please select an end date");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const formattedData = {
        ...cohortData,
        org_id: cohortData.scope === 'direct' ? undefined : cohortData.org_id,
        trainer_ids: cohortData.trainer_ids,
        learner_ids: cohortData.learner_ids
      };
      
      console.log('Submitting cohort data:', formattedData);
      
      // Create the cohort
      const newCohort = await createCohort(formattedData);
      toast.success("Cohort created successfully!");
      
      // Navigate to the new cohort's details page
      router.push(`/content-management/cohorts/${newCohort.id}`);
    } catch (error) {
      console.error("Error creating cohort:", error);
      toast.error("Failed to create cohort. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the filter functions to safely handle non-array data
  const filteredTrainers = Array.isArray(trainers) ? trainers.filter(trainer => 
    !searchTerm || 
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Filter learners based on search term
  const filteredLearners = Array.isArray(learners) ? learners.filter(learner => 
    !learnerSearchTerm || 
    learner.email?.toLowerCase().includes(learnerSearchTerm.toLowerCase()) ||
    `${learner.first_name || ''} ${learner.last_name || ''}`.toLowerCase().includes(learnerSearchTerm.toLowerCase())
  ) : [];

  return (
    <>
      <PageContainer>
        <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Create New Cohort</h1>
            <p className="text-muted-foreground mt-2">Set up a new learning cohort for your students.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-md grid grid-cols-3 mb-6">
                <TabsTrigger value="info">Cohort Info</TabsTrigger>
                <TabsTrigger value="Trainers">Trainers</TabsTrigger>
                <TabsTrigger value="learners">Learners</TabsTrigger>
              </TabsList>
              
              {/* Cohort Info Tab */}
              <TabsContent value="info" className="space-y-6">
                <Card className="shadow-sm border-muted overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-primary" />
                      Cohort Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      
                      
                      {/* Cohort Title */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <Label htmlFor="title" className="text-lg font-medium">Cohort Title</Label>
                          </div>
                          <Input 
                            id="title"
                            name="title"
                            placeholder="Enter cohort title"
                            value={cohortData.title}
                            onChange={handleChange}
                            required
                            className="h-12 text-lg"
                          />
                          <p className="text-sm text-muted-foreground">This will be displayed as the main title of your cohort.</p>
                        </div>
                      </div>
                      
                      {/* Cohort Description */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlignLeft className="h-5 w-5 text-primary" />
                            <Label htmlFor="description" className="text-lg font-medium">Cohort Description</Label>
                          </div>
                          <Textarea 
                            id="description"
                            name="description"
                            placeholder="Enter a detailed description of your cohort"
                            value={cohortData.description}
                            onChange={handleChange}
                            rows={5}
                            className="resize-none"
                          />
                          <p className="text-sm text-muted-foreground">Provide a comprehensive description of what this cohort will focus on.</p>
                        </div>
                      </div>
                      
                      {/* Cohort Details */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-5">
                          <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-medium">Cohort Details</h3>
                          </div>
                          
                          {/* First row of fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Program Selection */}
                            <div className="space-y-3">
                              <Label htmlFor="program_id" className="text-base font-medium">Program</Label>
                              <Select 
                                value={cohortData.program_id} 
                                onValueChange={(value) => handleSelectChange("program_id", value)}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select program" />
                                </SelectTrigger>
                                <SelectContent>
                                  {programs.length > 0 ? (
                                    programs.map(program => (
                                      <SelectItem key={program.id} value={program.id}>
                                        <div className="flex items-center gap-2">
                                          <BookOpen className="h-4 w-4 text-primary" />
                                          <span>{program.title}</span>
                                        </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-sm text-muted-foreground">No programs available</div>
                                  )}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">The learning program this cohort will follow</p>
                            </div>
                            
                            <div className="space-y-3">
                              <Label htmlFor="scope" className="text-base font-medium">Scope</Label>
                              <Select
                                value={cohortData.scope}
                                onValueChange={(value) => handleSelectChange("scope", value)}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select scope" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="direct">Direct</SelectItem>
                                  <SelectItem value="organization">Organization</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">Scope determines how the cohort is managed</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="cohortCode" className="text-base font-medium">Cohort Code</Label>
                              <Input 
                                id="cohortCode"
                                name="cohort_code"
                                value={cohortData.cohort_code}
                                onChange={handleChange}
                                readOnly
                                className="h-10 font-mono"
                                placeholder={cohortData.scope === "organization" ? "Select an organization" : "Auto-generated"}
                              />
                              <p className="text-xs text-muted-foreground">Auto-generated based on organization</p>
                            </div>
                          
                            {cohortData.scope === "organization" ? (
                              <div className="space-y-3">
                                <Label htmlFor="orgName" className="text-base font-medium">Organization</Label>
                                <Select 
                                  value={cohortData.org_id} 
                                  onValueChange={(value) => handleSelectChange("orgName", value)}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select organization" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GamutX Academy">
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4 text-blue-500" />
                                      <span>GamutX Academy</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="TechCorp Inc.">
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4 text-purple-500" />
                                      <span>TechCorp Inc.</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Aptitude Systems">
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4 text-green-500" />
                                      <span>Aptitude Systems</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Global Solutions">
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4 text-amber-500" />
                                      <span>Global Solutions</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">The organization this cohort belongs to</p>
                            </div>
                            ) : (
                            <div className="space-y-3">
                                <Label htmlFor="github_repo_link" className="text-base font-medium">
                                  GitHub Repository
                                </Label>
                              <Input 
                                  id="github_repo_link"
                                  name="github_repo_link"
                                  placeholder="https://github.com/yourusername/repo-name"
                                  value={cohortData.github_repo_link || ""}
                                onChange={handleChange}
                                  className="h-10"
                              />
                                <p className="text-xs text-muted-foreground">Optional: Add a repository URL</p>
                            </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="status" className="text-base font-medium">Cohort Status</Label>
                              <Select 
                                value={cohortData.status} 
                                onValueChange={(value) => handleSelectChange("status", value)}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="upcoming">Upcoming</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="mt-2">
                                {cohortData.status === "upcoming" && (
                                  <Badge variant="outline" className="border-blue-500 text-blue-700">Upcoming</Badge>
                                )}
                                {cohortData.status === "active" && (
                                  <Badge variant="default" className="bg-green-500">Active</Badge>
                                )}
                                {cohortData.status === "completed" && (
                                  <Badge variant="outline" className="border-gray-500 text-gray-700">Completed</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <Label htmlFor="startDate" className="text-base font-medium">Start Date</Label>
                                <div className="relative">
                                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                  <Input 
                                    id="startDate"
                                    name="start_date"
                                    type="date"
                                    value={cohortData.start_date}
                                    onChange={handleChange}
                                    required
                                    className="pl-9 h-10"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <Label htmlFor="endDate" className="text-base font-medium">End Date</Label>
                                <div className="relative">
                                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                  <Input 
                                    id="endDate"
                                    name="end_date"
                                    type="date"
                                    value={cohortData.end_date}
                                    onChange={handleChange}
                                    required
                                    className="pl-9 h-10"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="sticky bottom-4 pt-4 pb-2 bg-background/80 backdrop-blur-sm z-10">
                  <div className="flex justify-end">
                    <Button 
                      type="button"
                      onClick={() => setActiveTab("Trainers")}
                      className="px-6 py-2.5 text-base gap-2 bg-primary hover:bg-primary/90 shadow-md"
                      size="lg"
                    >
                      Next: Trainers
                      <ArrowRight className="h-5 w-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Trainers Tab */}
              <TabsContent value="Trainers" className="space-y-6">
                <Card className="shadow-sm border-muted overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Users className="h-5 w-5 text-primary" />
                      Trainers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium">Available Trainers</h3>
                        <Badge variant="outline" className="font-normal">
                          Selected: {cohortData.trainer_ids.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search trainers by name or email..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        <div className="border rounded-lg max-h-80 overflow-y-auto">
                          {isLoadingTrainers ? (
                            <div className="p-4 text-center text-muted-foreground">Loading trainers...</div>
                          ) : (
                            filteredTrainers.length > 0 ? (
                              filteredTrainers.map(trainer => (
                                <div 
                                  key={trainer.id} 
                                  className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <Checkbox 
                                      id={`trainer-${trainer.id}`}
                                      checked={cohortData.trainer_ids.includes(trainer.id)}
                                      onCheckedChange={() => toggleTrainer(trainer.id)}
                                    />
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <label 
                                      htmlFor={`trainer-${trainer.id}`}
                                      className="cursor-pointer flex-grow"
                                    >
                                      <p className="font-medium">{trainer.first_name || ''}</p>
                                      <p className="text-sm text-muted-foreground">{trainer.email}</p>
                                    </label>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-muted-foreground">
                                {trainers.length === 0 ? "No trainers available." : "No trainers match your search."}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="sticky bottom-4 pt-4 pb-2 bg-background/80 backdrop-blur-sm z-10">
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveTab("info")} 
                      className="px-6"
                    >
                      Back to Cohort Info
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setActiveTab("learners")}
                      className="px-6 py-2.5 text-base gap-2 bg-primary hover:bg-primary/90 shadow-md"
                      size="lg"
                    >
                      Next: Learners
                      <ArrowRight className="h-5 w-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Learners Tab */}
              <TabsContent value="learners" className="space-y-6">
                <Card className="shadow-sm border-muted overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Learners
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium">Available Learners</h3>
                        <Badge variant="outline" className="font-normal">
                          Selected: {cohortData.learner_ids?.length || 0}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search learners by name or email..."
                            className="pl-9"
                            value={learnerSearchTerm}
                            onChange={(e) => setLearnerSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        <div className="border rounded-lg max-h-80 overflow-y-auto">
                          {isLoadingLearners ? (
                            <div className="p-4 text-center text-muted-foreground">Loading learners...</div>
                          ) : (
                            filteredLearners.length > 0 ? (
                              filteredLearners.map(learner => (
                                <div 
                                  key={learner.id} 
                                  className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <Checkbox 
                                      id={`learner-${learner.id}`}
                                      checked={(cohortData.learner_ids || []).includes(learner.id)}
                                      onCheckedChange={() => toggleLearner(learner.id)}
                                    />
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <UserPlus className="h-5 w-5 text-primary" />
                                    </div>
                                    <label 
                                      htmlFor={`learner-${learner.id}`}
                                      className="cursor-pointer flex-grow"
                                    >
                                      <p className="font-medium">{learner.first_name || ''} {learner.last_name || ''}</p>
                                      <p className="text-sm text-muted-foreground">{learner.email}</p>
                                    </label>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-muted-foreground">
                                {learners.length === 0 ? "No learners available." : "No learners match your search."}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="sticky bottom-4 pt-4 pb-2 bg-background/80 backdrop-blur-sm z-10">
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveTab("Trainers")} 
                      className="px-6"
                    >
                      Back to Trainers
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-base gap-2 bg-primary hover:bg-primary/90 shadow-md"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Cohort"
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </div>
      </PageContainer>
    </>
  );
} 