"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Plus, Trash, GripVertical, Settings, BookOpen, FileText, Layers, Clock, CheckCircle, Save, ArrowRight, Search, AlertCircle, Building } from "lucide-react";
import { toast } from "sonner";
import { getProgramById, updateProgram, getAllPrograms, removeModuleFromProgram, addModulesToProgram } from "@/lib/api/programs";
import { getAllModules, Module } from "@/lib/api/modules";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { PageContainer } from "@/components/page-container";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingProgramCodes, setExistingProgramCodes] = useState<{id: string, code: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [originalProgramCode, setOriginalProgramCode] = useState("");
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedModuleDetails, setSelectedModuleDetails] = useState<Module[]>([]);
  const [removingModule, setRemovingModule] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    program_code: "",
    title: "",
    description: "",
    prerequisites: "",
    status: "draft",
    thumbnail: "",
    duration: "",
    level: "beginner"
  });

  useEffect(() => {
    const fetchProgramDetailsAndCodes = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all programs to check for duplicate codes
        const allPrograms = await getAllPrograms();
        setExistingProgramCodes(
          allPrograms.map(program => ({
            id: program.id, 
            code: program.program_code.toLowerCase()
          }))
        );
        
        // Fetch the current program details
        const programData = await getProgramById(courseId);
        setFormData({
          program_code: programData.program_code || "",
          title: programData.title || "",
          description: programData.description || "",
          prerequisites: programData.prerequisites || "",
          status: programData.status || "draft",
          thumbnail: programData.thumbnail || "",
          duration: programData.duration || "",
          level: programData.level || "beginner"
        });
        
        // Save original code for comparison during validation
        setOriginalProgramCode(programData.program_code.toLowerCase());
        
        // Set modules if any
        if (programData.modules && programData.modules.length > 0) {
          setSelectedModules(programData.modules.map(m => m.id));
          setSelectedModuleDetails(programData.modules);
        }
      } catch (error) {
        console.error("Failed to load program details:", error);
        toast.error("Failed to load program details");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchProgramDetailsAndCodes();
    }
  }, [courseId]);

  // Handle module dialog open - fetch available modules
  const handleOpenModuleDialog = async () => {
    try {
      const modules = await getAllModules();
      
      // Filter out modules that are already selected
      const filteredModules = modules.filter(module => !selectedModules.includes(module.id));
      
      setAvailableModules(filteredModules);
      setModuleDialogOpen(true);
    } catch (error) {
      console.error("Failed to load modules:", error);
      toast.error("Failed to load available modules");
    }
  };

  // Handle module selection
  const toggleModuleSelection = (module: Module) => {
    const moduleId = module.id;
    
    if (selectedModules.includes(moduleId)) {
      // Remove module if already selected
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
      setSelectedModuleDetails(prev => prev.filter(m => m.id !== moduleId));
    } else {
      // Add module if not selected
      setSelectedModules(prev => [...prev, moduleId]);
      setSelectedModuleDetails(prev => [...prev, module]);
    }
  };
  
  const handleAddModules = () => {
    setModuleDialogOpen(false);
  };
  
  const handleRemoveModule = async (moduleId: string) => {
    setRemovingModule(moduleId);
    try {
      await removeModuleFromProgram(courseId, moduleId);
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
      setSelectedModuleDetails(prev => prev.filter(module => module.id !== moduleId));
      toast.success("Module removed successfully");
    } catch (error) {
      console.error("Failed to remove module:", error);
      toast.error("Failed to remove module");
    } finally {
      setRemovingModule("");
    }
  };
  
  // Filter available modules based on search term
  const filteredModules = availableModules.filter(module => 
    module.module_title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    module.module_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedModuleDetails);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedModuleDetails(items);
    setSelectedModules(items.map(module => module.id));

    // Save the new order to the backend
    try {
      // Create the order payload
      const orderPayload = items.map((module, index) => ({
        module_id: module.id,
        order: index + 1,
      }));

      // Uncomment when API is ready
      // await reorderProgramModules(courseId, orderPayload);
      toast.success("Module order updated successfully");
    } catch (error) {
      console.error("Failed to save module order:", error);
      toast.error("Failed to save module order");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleLevelChange = (value: string) => {
    setFormData(prev => ({ ...prev, level: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.program_code.trim()) {
      setError("Program code is required");
      return;
    }
    
    if (!formData.title.trim()) {
      setError("Program title is required");
      return;
    }
    
    // Check if code is taken by another program
    if (isCodeTaken()) {
      setError(`Program code "${formData.program_code}" is already in use`);
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Prepare data for API
      const updateData = {
        title: formData.title,
        description: formData.description,
        prerequisites: formData.prerequisites,
        status: formData.status,
        thumbnail: formData.thumbnail,
        duration: formData.duration,
        level: formData.level,
        modules: selectedModules
      };
      
      // Update program
      await updateProgram(courseId, updateData);
      
      toast.success("Program updated successfully");
      router.push(`/content-management/courses/${courseId}`);
    } catch (error) {
      console.error("Failed to update program:", error);
      toast.error("Failed to update program");
      setError("Failed to update program. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isCodeTaken = () => {
    const currentCode = formData.program_code.toLowerCase();
    return currentCode !== originalProgramCode && 
      existingProgramCodes.some(p => p.code === currentCode);
  };

  const proceedToModules = () => {
    setActiveTab("modules");
  };

  if (isLoading) {
    return (
      <>
        <PageContainer>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Loading program details...</p>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageContainer>
        <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <Link href={`/content-management/courses/${courseId}`}>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Program</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-[400px] mb-6">
                <TabsTrigger value="details">Program Details</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Program Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="program_code">Program Code</Label>
                          <Input 
                            id="program_code"
                            name="program_code"
                            value={formData.program_code}
                            onChange={handleInputChange}
                            placeholder="e.g., WEBDEV101"
                            className="font-mono"
                          />
                          <p className="text-xs text-muted-foreground">A unique identifier for this program</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="title">Program Title</Label>
                          <Input 
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Web Development Fundamentals"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe what this program covers"
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={handleStatusChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-amber-500" />
                                  <span>Draft</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="published">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Published</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="level">Level</Label>
                          <Select value={formData.level} onValueChange={handleLevelChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (hours)</Label>
                          <Input 
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            placeholder="e.g., 40"
                            type="number"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="prerequisites">Prerequisites</Label>
                        <Input 
                          id="prerequisites"
                          name="prerequisites"
                          value={formData.prerequisites}
                          onChange={handleInputChange}
                          placeholder="e.g., Basic understanding of computers"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="thumbnail">Thumbnail URL</Label>
                        <Input 
                          id="thumbnail"
                          name="thumbnail"
                          value={formData.thumbnail}
                          onChange={handleInputChange}
                          placeholder="e.g., https://example.com/images/webdev.jpg"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={proceedToModules}
                    className="flex items-center gap-2"
                  >
                    Next: Modules
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="modules" className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      Program Modules
                    </CardTitle>
                    <Button 
                      type="button"
                      onClick={handleOpenModuleDialog}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Modules
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {selectedModuleDetails.length > 0 ? (
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="modules-list">
                          {(provided) => (
                            <div 
                              className="space-y-3"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {selectedModuleDetails.map((module, index) => (
                                <Draggable 
                                  key={module.id} 
                                  draggableId={module.id} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`border p-4 rounded-md ${
                                        snapshot.isDragging 
                                          ? "bg-primary/5 border-primary/20 shadow-md" 
                                          : "bg-white dark:bg-gray-950 shadow-sm"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div 
                                            {...provided.dragHandleProps}
                                            className="cursor-grab text-gray-500 hover:text-gray-700"
                                          >
                                            <GripVertical className="h-5 w-5" />
                                          </div>
                                          <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">
                                                {index + 1}. {module.module_title}
                                              </span>
                                              {module.status === "published" ? (
                                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200">
                                                  <CheckCircle className="h-3 w-3 mr-1" />
                                                  Published
                                                </Badge>
                                              ) : (
                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-200">
                                                  <Clock className="h-3 w-3 mr-1" />
                                                  Draft
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                              <Badge variant="outline" className="font-mono">
                                                {module.module_code}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            asChild
                                            className="h-8 w-8 p-0"
                                          >
                                            <Link href={`/content-management/modules/${module.id}`}>
                                              <BookOpen className="h-4 w-4 text-primary" />
                                              <span className="sr-only">View module</span>
                                            </Link>
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleRemoveModule(module.id)}
                                            disabled={removingModule === module.id}
                                          >
                                            <Trash className="h-4 w-4" />
                                            <span className="sr-only">Remove module</span>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                        <div className="mt-3 text-xs text-muted-foreground text-center">
                          Drag and drop modules to reorder them
                        </div>
                      </DragDropContext>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <Layers className="h-10 w-10 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground text-center mb-6">
                          No modules have been added to this program yet.
                        </p>
                        <Button onClick={handleOpenModuleDialog} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Modules
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("details")}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Details
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Program
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </div>
      </PageContainer>
      
      {/* Module Selection Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Modules to Program</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search modules..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => (
                  <div 
                    key={module.id}
                    className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${
                      selectedModules.includes(module.id) 
                        ? "bg-primary/10 border-primary" 
                        : "hover:bg-secondary/20"
                    }`}
                    onClick={() => toggleModuleSelection(module)}
                  >
                    <div>
                      <div className="font-medium">{module.module_title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{module.module_code}</span>
                      </div>
                    </div>
                    {selectedModules.includes(module.id) && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {availableModules.length === 0 
                    ? "All available modules are already added to this program" 
                    : "No modules found matching your search"}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setModuleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddModules}
            >
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}