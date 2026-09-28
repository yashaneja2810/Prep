"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, X, Trash, GripVertical, Users, FileText, Layers, Clock, Calendar, Info, Building, BookOpen, AlignLeft, Settings, Star, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { getAllModules, Module } from "@/lib/api/modules";
import { createProgram } from "@/lib/api/programs";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function CreateCoursePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [courseData, setCourseData] = useState({
    title: "",
    programCode: "",
    description: "",
    type: "flagship" as "flagship" | "on-demand",
    source: "direct" as "direct" | "corporate",
    orgName: "",
    orgCode: "",
    startDate: "",
    endDate: "",
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  
  // Add state for available modules from API
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch modules from API when component mounts
  useEffect(() => {
    async function fetchModules() {
      try {
        setIsLoadingModules(true);
        setError(null);
        const modules = await getAllModules();
        setAvailableModules(modules);
      } catch (err) {
        console.error("Failed to load modules:", err);
        setError("Failed to load modules. Please try again.");
        toast.error("Failed to load modules");
      } finally {
        setIsLoadingModules(false);
      }
    }
    
    fetchModules();
  }, []);

  // Handle course data changes
  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value
    });
  };

  // Handle course type change
  const handleTypeChange = (value: string) => {
    setCourseData({
      ...courseData,
      type: value as "flagship" | "on-demand"
    });
  };

  // Add a module to selected modules
  const handleAddModule = () => {
    if (!selectedModuleId) return;
    
    // Check if module is already added
    if (selectedModules.includes(selectedModuleId)) {
      toast.error("This module is already added.");
      return;
    }
    
    setSelectedModules([...selectedModules, selectedModuleId]);
    setSelectedModuleId("");
  };

  // Remove a module from selected modules
  const handleRemoveModule = (moduleId: string) => {
    setSelectedModules(selectedModules.filter(id => id !== moduleId));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!courseData.title.trim()) {
      toast.error("Please enter a program title.");
      return;
    }
    
    if (!courseData.programCode.trim()) {
      toast.error("Please enter a program code.");
      return;
    }
    
    if (!courseData.startDate) {
      toast.error("Please enter a start date.");
      return;
    }
    
    if (!courseData.endDate) {
      toast.error("Please enter an end date.");
      return;
    }
    
    if (selectedModules.length === 0) {
      toast.error("Please add at least one module.");
      return;
    }
    
    try {
      // Create program data object
      const programData = {
        program_code: courseData.programCode,
        title: courseData.title,
        description: courseData.description,
        prerequisites: courseData.source === "corporate" ? courseData.orgName : undefined,
        status: "draft",
        duration: "0", // Changed from number to string to match the CreateProgramDto interface
        level: "beginner",
        modules: selectedModules
      };
      
      // Call API to create program
      await createProgram(programData);
      toast.success("Program created successfully!");
      
      // Navigate back to programs page
      router.push("/content-management");
    } catch (error) {
      console.error("Failed to create program:", error);
      toast.error("Failed to create program. Please try again.");
    }
  };

  // Function to proceed to next tab
  const handleProceedToModules = () => {
    setActiveTab("modules");
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedModules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedModules(items);
  };

  return (
    <>
      <PageContainer>
        <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Create New Program</h1>
            <p className="text-muted-foreground mt-2">Fill in the details below to create a new program or course.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-md grid grid-cols-2 mb-6">
                <TabsTrigger value="overview">Program Overview</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card className="shadow-sm border-muted overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-primary" />
                      Program Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      {/* Course Title */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <Label htmlFor="title" className="text-lg font-medium">Program Title</Label>
                          </div>
                          <Input 
                            id="title"
                            name="title"
                            placeholder="Enter program title"
                            value={courseData.title}
                            onChange={handleCourseChange}
                            required
                            className="h-12 text-lg"
                          />
                          <p className="text-sm text-muted-foreground">This will be displayed as the main title of your program.</p>
                        </div>
                      </div>

                      {/* Course Description */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlignLeft className="h-5 w-5 text-primary" />
                            <Label htmlFor="description" className="text-lg font-medium">Program Description</Label>
                          </div>
                          <Textarea 
                            id="description"
                            name="description"
                            placeholder="Enter a detailed description of your program"
                            value={courseData.description}
                            onChange={handleCourseChange}
                            rows={5}
                            className="resize-none"
                          />
                          <p className="text-sm text-muted-foreground">Provide a comprehensive description of what students will learn in this program.</p>
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-5">
                          <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-medium">Program Details</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="programCode" className="text-base font-medium">Program Code</Label>
                              <Input 
                                id="programCode"
                                name="programCode"
                                placeholder="Enter program code (e.g., VSDF1101)"
                                value={courseData.programCode}
                                onChange={handleCourseChange}
                                className="h-10 font-mono"
                              />
                              <p className="text-xs text-muted-foreground">Format: VSDF1101, VSDFAPT1101</p>
                            </div>
                            
                            <div className="space-y-3">
                              <Label htmlFor="type" className="text-base font-medium">Program Type</Label>
                              <Select 
                                value={courseData.type} 
                                onValueChange={handleTypeChange}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select program type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="flagship">
                                    <div className="flex items-center gap-2">
                                      <Star className="h-4 w-4 text-amber-500" />
                                      <span>Flagship</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="on-demand">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-blue-500" />
                                      <span>On-Demand</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">Flagship programs have live sessions, on-demand are self-paced</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="source" className="text-base font-medium">Source</Label>
                              <Select 
                                value={courseData.source} 
                                onValueChange={(value) => setCourseData({...courseData, source: value as "direct" | "corporate"})}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="direct">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-green-500" />
                                      <span>Direct</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="corporate">
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4 text-purple-500" />
                                      <span>Corporate</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">Direct: individual enrollment, Corporate: organization-sponsored</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <Label htmlFor="startDate" className="text-base font-medium">Start Date</Label>
                                <Input 
                                  id="startDate"
                                  name="startDate"
                                  type="date"
                                  value={courseData.startDate}
                                  onChange={handleCourseChange}
                                  className="h-10"
                                />
                              </div>
                              
                              <div className="space-y-3">
                                <Label htmlFor="endDate" className="text-base font-medium">End Date</Label>
                                <Input 
                                  id="endDate"
                                  name="endDate"
                                  type="date"
                                  value={courseData.endDate}
                                  onChange={handleCourseChange}
                                  className="h-10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Organization Details - Only shown when corporate is selected */}
                      {courseData.source === "corporate" && (
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-900 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300">Organization Details</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="orgName" className="text-base font-medium">Organization Name</Label>
                              <Select 
                                value={courseData.orgName}
                                onValueChange={(value) => setCourseData({...courseData, orgName: value, orgCode: value === "TechCorp Inc." ? "CMP1" : value === "Aptitude Systems" ? "CMP2" : value === "Global Solutions" ? "CMP3" : ""})}
                              >
                                <SelectTrigger className="h-10 bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800">
                                  <SelectValue placeholder="Select organization" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TechCorp Inc.">TechCorp Inc.</SelectItem>
                                  <SelectItem value="Aptitude Systems">Aptitude Systems</SelectItem>
                                  <SelectItem value="Global Solutions">Global Solutions</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-3">
                              <Label htmlFor="orgCode" className="text-base font-medium">Organization Code</Label>
                              <div className="flex items-center gap-2">
                                <Input 
                                  id="orgCode"
                                  name="orgCode"
                                  value={courseData.orgCode}
                                  readOnly
                                  className="h-10 bg-white/50 dark:bg-gray-900/50 font-mono border-purple-200 dark:border-purple-800"
                                />
                                {courseData.orgCode && (
                                  <Badge variant="outline" className="font-mono border-purple-200 bg-white dark:bg-gray-900">
                                    {courseData.orgCode}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">Auto-generated based on organization</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-dashed border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <p className="text-sm text-purple-700 dark:text-purple-300">
                                Corporate programs are associated with specific organizations and may have special access requirements.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="sticky bottom-4 pt-4 pb-2 bg-background/80 backdrop-blur-sm z-10">
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("modules")}
                      className="px-6 py-2.5 text-base gap-2 bg-primary hover:bg-primary/90 shadow-md"
                      size="lg"
                    >
                      Next: Modules
                      <ArrowRight className="h-5 w-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="modules" className="space-y-6">
                <Card className="shadow-sm border-muted">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Layers className="h-5 w-5 text-primary" />
                      Modules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Add modules section */}
                      <div className="border rounded-lg p-5 space-y-4 bg-card shadow-sm">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Plus className="h-4 w-4 text-primary" />
                          Add Modules
                        </h3>
                        <div className="flex gap-3">
                          {isLoadingModules ? (
                            <div className="flex-1 h-10 flex items-center justify-center bg-muted/30 rounded-md">
                              <p className="text-sm text-muted-foreground">Loading modules...</p>
                            </div>
                          ) : error ? (
                            <div className="flex-1 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-md">
                              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                          ) : (
                            <Select 
                              value={selectedModuleId} 
                              onValueChange={setSelectedModuleId}
                            >
                              <SelectTrigger className="flex-1 h-10">
                                <SelectValue placeholder="Select a module" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableModules
                                  .filter(module => !selectedModules.includes(module.id))
                                  .map(module => (
                                    <SelectItem key={module.id} value={module.id}>
                                      {module.module_code}: {module.module_title}
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          )}
                          <Button 
                            type="button" 
                            onClick={handleAddModule}
                            disabled={!selectedModuleId || isLoadingModules}
                            className="gap-1.5"
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                      
                      {/* Modules list */}
                      <div className="border rounded-lg shadow-sm">
                        <div className="p-4 border-b bg-muted/30">
                          <h3 className="font-medium">Selected Modules</h3>
                        </div>
                        <div className="p-4">
                          {selectedModules.length > 0 ? (
                            <DragDropContext onDragEnd={handleDragEnd}>
                              <Droppable droppableId="modules-list">
                                {(provided) => (
                                  <div 
                                    className="space-y-2"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                    {selectedModules.map((moduleId, index) => {
                                      const module = availableModules.find(m => m.id === moduleId);
                                      if (!module) return null;
                                      
                                      return (
                                        <Draggable 
                                          key={moduleId} 
                                          draggableId={moduleId} 
                                          index={index}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`flex items-center justify-between bg-muted/30 p-3 rounded-md border border-muted ${
                                                snapshot.isDragging 
                                                  ? "bg-primary/5 border-primary/20 shadow-md" 
                                                  : ""
                                              }`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="cursor-grab text-gray-500 hover:text-gray-700"
                                                >
                                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <span className="text-sm font-medium">
                                                  {index + 1}. {module.module_code}: {module.module_title}
                                                </span>
                                              </div>
                                              <div 
                                                onClick={() => handleRemoveModule(moduleId)}
                                                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent text-destructive cursor-pointer"
                                              >
                                                <X className="h-4 w-4" />
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                              <div className="mt-3 text-xs text-muted-foreground text-center">
                                Drag and drop modules to reorder them
                              </div>
                            </DragDropContext>
                          ) : (
                            <div className="text-center py-10">
                              <div className="flex flex-col items-center gap-2">
                                <Layers className="h-10 w-10 text-muted-foreground/50" />
                                <p className="text-muted-foreground">
                                  No modules added yet. Add modules to your program.
                                </p>
                              </div>
                            </div>
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
                      onClick={() => setActiveTab("overview")}
                      className="px-4 gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Overview
                    </Button>
                    <Button 
                      type="submit" 
                      className="px-6 py-2.5 text-base gap-2 bg-primary hover:bg-primary/90 shadow-md"
                      size="lg"
                      disabled={selectedModules.length === 0}
                    >
                      Create Program
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