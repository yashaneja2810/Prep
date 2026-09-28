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
import { ChevronLeft, Plus, Trash, GripVertical, Settings, BookOpen, FileText, Layers, Clock, CheckCircle, Save, ArrowRight, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getModuleById, updateModule, getAllModules, removeTopicFromModule, reorderTopics } from "@/lib/api/modules";
import { getAllTopics, TopicResponse } from "@/lib/api/topics";
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

export default function EditModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingModuleCodes, setExistingModuleCodes] = useState<{id: string, code: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [originalModuleCode, setOriginalModuleCode] = useState("");
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<TopicResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTopicDetails, setSelectedTopicDetails] = useState<TopicResponse[]>([]);
  const [removingTopic, setRemovingTopic] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    module_code: "",
    module_title: "",
    module_name: "",
    description: "",
    status: "draft"
  });

  useEffect(() => {
    const fetchModuleDetailsAndCodes = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all modules to check for duplicate codes
        const allModules = await getAllModules();
        setExistingModuleCodes(
          allModules.map(module => ({
            id: module.id, 
            code: module.module_code.toLowerCase()
          }))
        );
        
        // Fetch the current module details
        const moduleData = await getModuleById(moduleId);
        setFormData({
          module_code: moduleData.module_code || "",
          module_title: moduleData.module_title || "",
          module_name: moduleData.module_name || "",
          description: moduleData.description || "",
          status: moduleData.status || "draft"
        });
        
        // Save original code for comparison during validation
        setOriginalModuleCode(moduleData.module_code.toLowerCase());
        
        // Set topics if any
        if (moduleData.topics && moduleData.topics.length > 0) {
          const topicsWithDetails = moduleData.topics
            .filter(moduleTopic => moduleTopic.topic)
            .sort((a, b) => a.order_index - b.order_index);
            
          setSelectedTopics(topicsWithDetails.map(t => t.topic_id));
          
          // Cast the mapped topics to the TopicResponse type
          setSelectedTopicDetails(topicsWithDetails.map(t => ({
            id: t.topic_id,
            title: t.topic?.title || "",
            topic_code: t.topic?.topic_code || "",
            description: t.topic?.description || "",
            status: t.topic?.status || "draft",
            created_at: t.topic?.created_at || "",
            updated_at: t.topic?.updated_at || ""
          }) as TopicResponse));
        }
      } catch (error) {
        console.error("Failed to load module details:", error);
        toast.error("Failed to load module details");
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId) {
      fetchModuleDetailsAndCodes();
    }
  }, [moduleId]);

  // Handle topic dialog open - fetch available topics
  const handleOpenTopicDialog = async () => {
    try {
      const topics = await getAllTopics();
      
      // Filter out topics that are already selected
      const filteredTopics = topics.filter(topic => !selectedTopics.includes(topic.id));
      
      setAvailableTopics(filteredTopics);
      setTopicDialogOpen(true);
    } catch (error) {
      console.error("Failed to load topics:", error);
      toast.error("Failed to load available topics");
    }
  };

  // Handle topic selection
  const toggleTopicSelection = (topic: TopicResponse) => {
    const topicId = topic.id;
    
    if (selectedTopics.includes(topicId)) {
      // Remove topic if already selected
      setSelectedTopics(prev => prev.filter(id => id !== topicId));
      setSelectedTopicDetails(prev => prev.filter(t => t.id !== topicId));
    } else {
      // Add topic if not selected
      setSelectedTopics(prev => [...prev, topicId]);
      setSelectedTopicDetails(prev => [...prev, topic]);
    }
  };
  
  const handleAddTopics = () => {
    setTopicDialogOpen(false);
  };
  
  const handleRemoveTopic = async (topicId: string) => {
    setRemovingTopic(topicId);
    try {
      await removeTopicFromModule(moduleId, topicId);
      setSelectedTopics(prev => prev.filter(id => id !== topicId));
      setSelectedTopicDetails(prev => prev.filter(topic => topic.id !== topicId));
      toast.success("Topic removed successfully");
    } catch (error) {
      console.error("Failed to remove topic:", error);
      toast.error("Failed to remove topic");
    } finally {
      setRemovingTopic("");
    }
  };
  
  // Filter available topics based on search term
  const filteredTopics = availableTopics.filter(topic => 
    topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    topic.topic_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedTopicDetails);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedTopicDetails(items);
    setSelectedTopics(items.map(topic => topic.id));

    // Save the new order to the backend
    try {
      // Create the order payload
      const orderPayload = items.map((topic, index) => ({
        topic_id: topic.id,
        order: index + 1,
      }));

      await reorderTopics(moduleId, orderPayload);
      toast.success("Topic order updated successfully");
    } catch (error) {
      console.error("Failed to save topic order:", error);
      toast.error("Failed to save topic order");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when editing fields
    if (error) setError(null);
    
    // Validate module code on change (only if it's different from original)
    if (name === 'module_code' && value) {
      const lowerValue = value.toLowerCase();
      
      // Check if this code belongs to another module (not the current one)
      const codeExists = existingModuleCodes.some(
        module => module.code === lowerValue && module.id !== moduleId
      );
      
      if (codeExists) {
        setError(`Module with code "${value}" already exists`);
      }
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.module_code || !formData.module_title || !formData.module_name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Check if this code is used by another module
    const lowerCode = formData.module_code.toLowerCase();
    const codeExists = existingModuleCodes.some(
      module => module.code === lowerCode && module.id !== moduleId
    );
    
    if (codeExists) {
      setError(`Module with code "${formData.module_code}" already exists`);
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Create update payload without module_code
      const updatePayload = {
        module_title: formData.module_title,
        module_name: formData.module_name,
        description: formData.description,
        status: formData.status,
        topics: selectedTopics
      };
      
      await updateModule(moduleId, updatePayload);
      toast.success("Module updated successfully");
      router.push("/content-management?tab=modules");
    } catch (error: any) {
      console.error("Failed to update module:", error);
      // Extract error message
      const errorMessage = error.message || "Failed to update module";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const isCodeTaken = () => {
    const lowerCode = formData.module_code.toLowerCase();
    return lowerCode !== originalModuleCode && 
      existingModuleCodes.some(module => module.code === lowerCode && module.id !== moduleId);
  };

  // Function to proceed to topics tab
  const proceedToTopics = () => {
    setActiveTab("topics");
  };

  if (isLoading) {
    return (
      <>
        <PageContainer>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Loading module details...</p>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageContainer>
        <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/content-management?tab=modules">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold">Edit Module</h1>
            </div>
            <p className="text-muted-foreground mt-2">Update module information and manage associated topics.</p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-md grid grid-cols-2 mb-6">
                <TabsTrigger value="details">Module Details</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <Card className="shadow-sm border-muted overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-primary" />
                      Module Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      {/* Module Title */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <Label htmlFor="module_title" className="text-lg font-medium">Module Title *</Label>
                          </div>
                          <Input 
                            id="module_title"
                            name="module_title"
                            value={formData.module_title}
                            onChange={handleInputChange}
                            placeholder="e.g. Python Basics"
                            required
                            className="h-12 text-lg"
                          />
                          <p className="text-sm text-muted-foreground">This will be displayed as the main title of the module.</p>
                        </div>
                      </div>

                      {/* Module Name */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            <Label htmlFor="module_name" className="text-lg font-medium">Module Name *</Label>
                          </div>
                          <Input 
                            id="module_name"
                            name="module_name"
                            value={formData.module_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Introduction to Python"
                            required
                            className="h-12 text-lg"
                          />
                          <p className="text-sm text-muted-foreground">The extended or internal name for the module.</p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <Label htmlFor="description" className="text-lg font-medium">Module Description</Label>
                          </div>
                          <Textarea 
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter a detailed description of the module"
                            rows={5}
                            className="resize-none"
                          />
                          <p className="text-sm text-muted-foreground">Provide a comprehensive description of what students will learn in this module.</p>
                        </div>
                      </div>

                      {/* Module Details */}
                      <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm">
                        <div className="space-y-5">
                          <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-medium">Module Details</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="module_code" className="text-base font-medium">Module Code *</Label>
                              <Input 
                                id="module_code"
                                name="module_code"
                                value={formData.module_code}
                                onChange={handleInputChange}
                                placeholder="e.g. PY101"
                                required
                                className={`h-10 font-mono ${isCodeTaken() ? "border-red-500" : ""}`}
                              />
                              {isCodeTaken() && (
                                <p className="text-sm text-red-500">This module code already exists</p>
                              )}
                              <p className="text-xs text-muted-foreground">A unique identifier for the module.</p>
                            </div>
                            
                            <div className="space-y-3">
                              <Label htmlFor="status" className="text-base font-medium">Status</Label>
                              <Select 
                                value={formData.status} 
                                onValueChange={handleStatusChange}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-yellow-500" />
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
                              <p className="text-xs text-muted-foreground">Draft modules are not visible to learners.</p>
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
                      onClick={proceedToTopics}
                      className="px-6 py-2.5 text-base gap-2 bg-primary hover:bg-primary/90 shadow-md"
                      size="lg"
                    >
                      Next: Manage Topics
                      <ArrowRight className="h-5 w-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="topics" className="space-y-6">
                <Card className="shadow-sm border-muted">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Layers className="h-5 w-5 text-primary" />
                      Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1">
                        {/* Add new topic */}
                        <div className="border rounded-lg p-5 space-y-4 bg-card shadow-sm sticky top-6">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            Add Topics
                          </h3>
                          <Button
                            type="button"
                            onClick={handleOpenTopicDialog}
                            className="w-full gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Select Topics
                          </Button>
                          
                          <div className="mt-6 pt-4 border-t">
                            <h3 className="text-sm font-medium mb-2">Topics Summary</h3>
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 text-primary font-medium rounded-full h-8 w-8 flex items-center justify-center">
                                {selectedTopicDetails.length}
                              </div>
                              <span className="text-sm text-muted-foreground">Topics selected</span>
                            </div>
                          </div>
                          
                          <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                            <DialogContent className="sm:max-w-[550px]">
                              <DialogHeader>
                                <DialogTitle>Add Topics to Module</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <div className="mb-4 relative">
                                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="search"
                                    placeholder="Search topics..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
                                <div className="max-h-[300px] overflow-y-auto space-y-2">
                                  {filteredTopics.length > 0 ? (
                                    filteredTopics.map((topic) => (
                                      <div 
                                        key={topic.id}
                                        className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${
                                          selectedTopics.includes(topic.id) 
                                            ? "bg-primary/10 border-primary" 
                                            : "hover:bg-secondary/20"
                                        }`}
                                        onClick={() => toggleTopicSelection(topic)}
                                      >
                                        <div>
                                          <div className="font-medium">{topic.title}</div>
                                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span>{topic.topic_code}</span>
                                          </div>
                                        </div>
                                        {selectedTopics.includes(topic.id) && (
                                          <CheckCircle className="h-5 w-5 text-primary" />
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                      No available topics found
                                    </div>
                                  )}
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setTopicDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAddTopics}>
                                  Done
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-2">
                        {/* Topics list */}
                        <div className="min-h-[400px] border rounded-lg p-4 shadow-sm">
                          <h3 className="text-lg font-medium mb-4">Selected Topics</h3>
                          {selectedTopicDetails.length > 0 ? (
                            <DragDropContext onDragEnd={handleDragEnd}>
                              <Droppable droppableId="topics-list">
                                {(provided) => (
                                  <div 
                                    className="space-y-3"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                    {selectedTopicDetails.map((topic, index) => (
                                      <Draggable 
                                        key={topic.id} 
                                        draggableId={topic.id} 
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
                                              <div className="flex items-center gap-3 overflow-hidden">
                                                <div 
                                                  {...provided.dragHandleProps}
                                                  className="cursor-grab text-gray-500 hover:text-gray-700 flex-shrink-0"
                                                >
                                                  <GripVertical className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                  <div className="font-medium flex items-center gap-2">
                                                    <span>{index + 1}.</span>
                                                    <span className="truncate">{topic.title}</span>
                                                  </div>
                                                  <Badge variant="outline" className="mt-1 font-mono w-fit">
                                                    {topic.topic_code}
                                                  </Badge>
                                                </div>
                                              </div>
                                              <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleRemoveTopic(topic.id)}
                                                disabled={removingTopic === topic.id}
                                                className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                              >
                                                <Trash className="h-4 w-4" />
                                                <span className="sr-only">Remove topic</span>
                                              </Button>
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
                                Drag and drop topics to reorder them
                              </div>
                            </DragDropContext>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] border border-dashed rounded-md">
                              <Layers className="h-10 w-10 text-muted-foreground/50 mb-2" />
                              <p className="text-muted-foreground text-center mb-4">
                                No topics selected. Click "Select Topics" to add topics to this module.
                              </p>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleOpenTopicDialog}
                                className="gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Select Topics
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="sticky bottom-4 pt-4 pb-2 bg-background/80 backdrop-blur-sm z-10">
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("details")} className="px-6">
                      Back to Details
                    </Button>
                    <Button 
                      type="submit" 
                      className="px-6 gap-2 bg-primary hover:bg-primary/90 shadow-md" 
                      size="lg"
                      disabled={isSaving || isCodeTaken()}
                    >
                      {isSaving ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
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