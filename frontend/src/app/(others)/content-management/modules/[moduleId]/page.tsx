"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Edit, Plus, Trash, ChevronLeft, 
  Search, CheckCircle, GripVertical, Clock, 
  FileText, Settings, Layers, Calendar, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getModuleById, deleteModule, addTopicsToModule, removeTopicFromModule, reorderTopics } from "@/lib/api/modules";
import { Module } from "@/lib/api/modules";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getAllTopics, TopicResponse } from "@/lib/api/topics";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { PageContainer } from "@/components/page-container";
import { formatDate } from "@/lib/utils";

export default function ModuleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;
  
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<TopicResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [addingTopics, setAddingTopics] = useState(false);
  const [removingTopic, setRemovingTopic] = useState("");
  const [reordering, setReordering] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        setLoading(true);
        const moduleData = await getModuleById(moduleId);
        setModule(moduleData);
      } catch (error) {
        console.error("Failed to load module details:", error);
        toast.error("Failed to load module details");
      } finally {
      setLoading(false);
      }
    };
    
    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId]);

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteModule(moduleId);
      toast.success("Module deleted successfully");
      router.push("/content-management?tab=modules");
    } catch (error) {
      console.error("Failed to delete module:", error);
      toast.error("Failed to delete module");
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "published":
    return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Published
            </Badge>
          </div>
    );
      default:
    return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-200">
              <Clock className="h-3 w-3 mr-1" />
              Draft
            </Badge>
          </div>
    );
  }
  };

  // Handle topic dialog open - fetch available topics
  const handleOpenTopicDialog = async () => {
    try {
      const topics = await getAllTopics();
      
      // Filter out topics that are already in the module
      const moduleTopics = module?.topics || [];
      const topicIds = moduleTopics.map(moduleTopic => moduleTopic.topic_id);
      const filteredTopics = topics.filter((topic: TopicResponse) => !topicIds.includes(topic.id));
      
      setAvailableTopics(filteredTopics);
      setTopicDialogOpen(true);
    } catch (error) {
      console.error("Failed to load topics:", error);
      toast.error("Failed to load available topics");
    }
  };

  // Handle topic selection
  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId) 
        : [...prev, topicId]
    );
  };

  // Handle adding topics to module
  const handleAddTopics = async () => {
    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic to add");
      return;
    }

    try {
      setAddingTopics(true);
      await addTopicsToModule(moduleId, selectedTopics);
      
      // Refresh module data
      const updatedModule = await getModuleById(moduleId);
      setModule(updatedModule);
      
      toast.success(`${selectedTopics.length} topic(s) added to module`);
      setTopicDialogOpen(false);
      setSelectedTopics([]);
    } catch (error) {
      console.error("Failed to add topics:", error);
      toast.error("Failed to add topics to module");
    } finally {
      setAddingTopics(false);
    }
  };

  // Handle topic removal
  const handleRemoveTopic = async (topicId: string) => {
    if (window.confirm("Are you sure you want to remove this topic from the module?")) {
      try {
        setRemovingTopic(topicId);
        await removeTopicFromModule(moduleId, topicId);
        
        // Update local state to remove the topic
        setModule(prevModule => {
          if (!prevModule) return null;
          
          return {
            ...prevModule,
            topics: prevModule.topics?.filter(moduleTopic => moduleTopic.topic_id !== topicId)
          };
        });
        
        toast.success("Topic removed from module");
      } catch (error) {
        console.error("Failed to remove topic:", error);
        toast.error("Failed to remove topic from module");
      } finally {
        setRemovingTopic("");
      }
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !module?.topics) return;
    
    try {
      setReordering(true);
      
      const items = Array.from(module.topics);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      // Update local state first for immediate UI update
      setModule(prevModule => {
        if (!prevModule || !prevModule.topics) return null;
        return { ...prevModule, topics: items };
      });

      // Create the payload for the API
      const orderPayload = items.map((topic, index) => ({
        topic_id: topic.topic_id,
        order: index + 1,
      }));

      // Save the new order to the backend
      await reorderTopics(moduleId, orderPayload);
      toast.success("Topic order updated successfully");
    } catch (error) {
      console.error("Failed to reorder topics:", error);
      toast.error("Failed to save topic order");
      
      // Refresh the module to get the correct order
      const updatedModule = await getModuleById(moduleId);
      setModule(updatedModule);
    } finally {
      setReordering(false);
    }
  };

  // Filter available topics based on search term
  const filteredTopics = availableTopics.filter(topic => 
    topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    topic.topic_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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

  if (!module) {
    return (
      <>
        <PageContainer>
          <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
            <Card>
              <CardContent className="py-10">
                <div className="flex flex-col items-center gap-4">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <h2 className="text-xl font-bold">Module Not Found</h2>
                  <p className="text-muted-foreground">The module you're looking for doesn't exist or has been removed.</p>
                  <Link href="/content-management?tab=modules">
                    <Button>Back to Modules</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageContainer>
        <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href="/content-management?tab=modules">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold">{module.module_title}</h1>
                {getStatusBadge(module.status)}
              </div>
              <p className="text-muted-foreground mt-1">{module.module_name}</p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href={`/content-management/modules/${moduleId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleteLoading}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
              
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Module</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this module? This action cannot be undone
                      and all associated data will be permanently removed.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-muted/30 p-3 rounded-md border mt-2">
                    <p className="font-medium">{module.module_title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{module.module_code}</p>
                  </div>
                  <DialogFooter className="gap-2 mt-4">
                    <DialogClose asChild>
                      <Button variant="outline" disabled={deleteLoading}>Cancel</Button>
                    </DialogClose>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete} 
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
              ) : (
                <>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Module
                </>
              )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-md grid grid-cols-2 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <Card className="shadow-sm border-muted overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    Module Details
                  </CardTitle>
                  </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Module Info</h3>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-md border space-y-4">
                          <div>
                          <p className="text-sm text-muted-foreground">Title</p>
                          <p className="font-medium">{module.module_title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{module.module_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Module Code</p>
                          <Badge variant="outline" className="font-mono">{module.module_code}</Badge>
                        </div>
                        {module.description && (
                          <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="text-sm mt-1">{module.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Module Meta</h3>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-md border space-y-4">
                          <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          {getStatusBadge(module.status)}
                          </div>
                          <div>
                          <p className="text-sm text-muted-foreground">Topics</p>
                          <p className="font-medium">{module.topics?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{module.created_at ? formatDate(module.created_at) : "N/A"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Updated</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{module.updated_at ? formatDate(module.updated_at) : "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              </TabsContent>

            <TabsContent value="topics" className="space-y-6">
              <Card className="shadow-sm border-muted">
                <CardHeader className="bg-muted/30 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Layers className="h-5 w-5 text-primary" />
                    Topics
                  </CardTitle>
                  <Button 
                    onClick={handleOpenTopicDialog}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Topic
                        </Button>
                  </CardHeader>
                <CardContent className="p-6">
                  {module.topics && module.topics.length > 0 ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="topics-list">
                        {(provided) => (
                          <div 
                            className="space-y-3"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {module.topics
                              .sort((a, b) => a.order_index - b.order_index)
                              .map((moduleTopic, index) => {
                                const topic = moduleTopic.topic;
                                if (!topic) return null;
                                
                                return (
                                  <Draggable 
                                    key={moduleTopic.topic_id} 
                                    draggableId={moduleTopic.topic_id} 
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
                                                  {index + 1}. {topic.title}
                                                </span>
                                                {topic.status === "published" ? (
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
                                                  {topic.topic_code}
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
                                              <Link href={`/content-management/topics/${topic.id}`}>
                                                <BookOpen className="h-4 w-4 text-primary" />
                                                <span className="sr-only">View topic</span>
                                              </Link>
                                </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                              onClick={() => handleRemoveTopic(moduleTopic.topic_id)}
                                              disabled={removingTopic === moduleTopic.topic_id}
                                  >
                                    <Trash className="h-4 w-4" />
                                              <span className="sr-only">Remove topic</span>
                                            </Button>
                                          </div>
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
                        Drag and drop topics to reorder them
                      </div>
                    </DragDropContext>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Layers className="h-10 w-10 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground text-center mb-6">
                        No topics have been added to this module yet.
                      </p>
                      <Button onClick={handleOpenTopicDialog} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Topic
                                  </Button>
                    </div>
                                )}
                </CardContent>
              </Card>
              
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
                            onClick={() => toggleTopicSelection(topic.id)}
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
                        <div className="text-center py-8 text-muted-foreground">
                          {availableTopics.length === 0 
                            ? "All available topics are already added to this module" 
                            : "No topics found matching your search"}
                      </div>
                        )}
                      </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTopicDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddTopics}
                      disabled={selectedTopics.length === 0 || addingTopics}
                      className="gap-2"
                    >
                      {addingTopics ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add {selectedTopics.length} Topic{selectedTopics.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </TabsContent>
            </Tabs>
        </div>
      </PageContainer>
    </>
  );
} 