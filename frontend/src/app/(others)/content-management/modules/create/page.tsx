"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, X, Trash, GripVertical, Settings, BookOpen, FileText, Layers, Clock, CheckCircle, Save, ArrowRight, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createModule, getAllModules } from "@/lib/api/modules";
import { getAllTopics, TopicResponse } from "@/lib/api/topics";
import { toast } from "sonner";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function CreateModulePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [existingModuleCodes, setExistingModuleCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<TopicResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTopicDetails, setSelectedTopicDetails] = useState<TopicResponse[]>([]);
  const [formData, setFormData] = useState({
    module_code: "",
    module_title: "",
    module_name: "",
    description: "",
    status: "draft"
  });

  // Load existing module codes for validation
  useEffect(() => {
    const fetchModuleCodes = async () => {
      try {
        const modules = await getAllModules();
        const codes = modules.map(module => module.module_code.toLowerCase());
        setExistingModuleCodes(codes);
      } catch (error) {
        console.error("Failed to load module codes for validation:", error);
      }
    };
    
    fetchModuleCodes();
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when editing fields
    if (error) setError(null);
    
    // Validate module code on change
    if (name === 'module_code' && value) {
      const moduleCodeExists = existingModuleCodes.includes(value.toLowerCase());
      if (moduleCodeExists) {
        setError(`Module with code "${value}" already exists`);
      }
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
    if (error) setError(null);
  };

  const handleAddTopics = () => {
    setTopicDialogOpen(false);
  };

  const removeTopic = (topicId: string) => {
    setSelectedTopics(prev => prev.filter(id => id !== topicId));
    setSelectedTopicDetails(prev => prev.filter(topic => topic.id !== topicId));
  };

  // Filter available topics based on search term
  const filteredTopics = availableTopics.filter(topic => 
    topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    topic.topic_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedTopicDetails);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedTopicDetails(items);
    setSelectedTopics(items.map(topic => topic.id));
    
    toast.success("Topic order updated");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.module_code || !formData.module_title || !formData.module_name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Check if module code exists
    if (existingModuleCodes.includes(formData.module_code.toLowerCase())) {
      setError(`Module with code "${formData.module_code}" already exists`);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Include selected topics in the request if any
      const moduleData = {
        ...formData,
        topics: selectedTopics.length > 0 ? selectedTopics : undefined
      };
      
      await createModule(moduleData);
      toast.success("Module created successfully");
      router.push("/content-management?tab=modules");
    } catch (error: any) {
      console.error("Failed to create module:", error);
      // Extract error message
      const errorMessage = error.message || "Failed to create module";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to proceed to topics tab
  const proceedToTopics = () => {
    setActiveTab("topics");
  };

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
              <h1 className="text-2xl sm:text-3xl font-bold">Create New Module</h1>
            </div>
            <p className="text-muted-foreground mt-2">Create a module to organize related learning content and topics.</p>
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
                                className="h-10 font-mono"
                              />
                              {existingModuleCodes.includes(formData.module_code.toLowerCase()) && (
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
                      Next: Add Topics
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
                                                onClick={() => removeTopic(topic.id)}
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
                      Back to Module Details
                    </Button>
                    <Button 
                      type="submit" 
                      className="px-6 gap-2 bg-primary hover:bg-primary/90 shadow-md" 
                      size="lg"
                      disabled={isLoading || existingModuleCodes.includes(formData.module_code.toLowerCase())}
                    >
                      {isLoading ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Create Module
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