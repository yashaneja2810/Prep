"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Plus, X, Trash, GripVertical, CheckCircle, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Sample module data for selection
interface Module {
  id: string;
  moduleCode: string;
  title: string;
}

const availableModules: Module[] = [
  { id: "m1", moduleCode: "GIT-101", title: "Git Basics" },
  { id: "m2", moduleCode: "Python-101", title: "Python Fundamentals" },
  { id: "m3", moduleCode: "Python-Scripting-101", title: "Python Scripting" },
  { id: "m4", moduleCode: "Python-QT-101", title: "Python QT" },
  { id: "m5", moduleCode: "MPA-101", title: "Maya Python API Basics" },
  { id: "m6", moduleCode: "MPA-201", title: "Maya Python API Advanced" },
  { id: "m7", moduleCode: "NPA-101", title: "Nuke Python API" },
  { id: "m8", moduleCode: "NPA-201", title: "Nuke Python API Advanced" },
  { id: "m9", moduleCode: "HPA-101", title: "Houdini Python API" },
  { id: "m10", moduleCode: "Silhouette-Python-API", title: "Silhouette Python API" },
  { id: "m11", moduleCode: "Blender-Python-API", title: "Blender Python API" },
  { id: "m12", moduleCode: "Mari-Python-API", title: "Mari Python API" },
  { id: "m13", moduleCode: "AI-for-Coding", title: "AI for Coding" },
  { id: "m14", moduleCode: "Python-USD", title: "Python USD" },
  { id: "m15", moduleCode: "Unreal", title: "Unreal Engine" },
  { id: "m16", moduleCode: "GIT-201", title: "Advanced Git" },
  { id: "m17", moduleCode: "Python-201", title: "Python Advanced" },
  { id: "m18", moduleCode: "Python-QT-201", title: "Python QT Advanced" },
  { id: "m19", moduleCode: "Python-Scripting-Concepts", title: "Python Scripting Concepts" },
  { id: "m20", moduleCode: "Python-Scripting-Automation", title: "Python Scripting Automation" },
  { id: "m21", moduleCode: "Python-Scripting-Libraries", title: "Python Scripting Libraries" },
  { id: "m22", moduleCode: "Python-Scripting-CLI-Tools", title: "Python Scripting CLI Tools" },
];

// Sample course data
const sampleCourses = {
  "c1": {
    id: "c1",
    title: "Introduction to Programming",
    programCode: "VSDF1101",
    description: "A comprehensive introduction to programming concepts and practices.",
    type: "flagship",
    source: "direct",
    orgName: "GamutX Academy",
    orgCode: "GXT1",
    startDate: "2023-06-01",
    endDate: "2023-12-31",
    topics: [
      {
        id: "t1",
        name: "Basics of Programming",
        moduleIds: ["m1", "m2"]
      },
      {
        id: "t2",
        name: "Control Structures",
        moduleIds: ["m3"]
      }
    ],
    cohorts: ["COH1", "COH2"],
    learnersCount: 45,
    isPublished: true,
    createdAt: "2023-05-10",
    updatedAt: "2023-06-15"
  },
  "c2": {
    id: "c2",
    title: "Web Development Fundamentals",
    programCode: "VSDF1102",
    description: "Learn the basics of web development with HTML, CSS, and JavaScript.",
    type: "on-demand",
    source: "corporate",
    orgName: "TechCorp Inc.",
    orgCode: "CMP1",
    startDate: "2023-07-15",
    endDate: "2024-01-15",
    topics: [
      {
        id: "t3",
        name: "Python QT Development",
        moduleIds: ["m4", "m18"]
      },
      {
        id: "t4",
        name: "JavaScript Basics",
        moduleIds: ["m20", "m21"]
      }
    ],
    cohorts: ["COH3"],
    learnersCount: 28,
    isPublished: false,
    createdAt: "2023-06-20",
    updatedAt: "2023-06-28"
  },
  "c3": {
    id: "c3",
    title: "Advanced VFX Pipeline",
    programCode: "VSDFAPT1101",
    description: "Deep dive into advanced data structures and algorithms.",
    type: "flagship",
    source: "corporate",
    orgName: "Aptitude Systems",
    orgCode: "CMP2",
    startDate: "2023-08-01",
    endDate: "2024-02-28",
    topics: [
      {
        id: "t5",
        name: "Maya and Nuke Integration",
        moduleIds: ["m5", "m6", "m7"]
      },
      {
        id: "t6",
        name: "Advanced Pipeline Tools",
        moduleIds: ["m14", "m22"]
      }
    ],
    cohorts: ["COH4", "COH5", "COH6"],
    learnersCount: 72,
    isPublished: false,
    createdAt: "2023-07-05",
    updatedAt: "2023-07-10"
  }
};

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [courseData, setCourseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTopic, setCurrentTopic] = useState({ name: "", moduleIds: [] as string[] });
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [newCohort, setNewCohort] = useState("");

  // Fetch course data
  useEffect(() => {
    // In a real app, you would fetch from an API
    const fetchData = () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const course = sampleCourses[courseId as keyof typeof sampleCourses];
        if (course) {
          setCourseData(course);
        } else {
          // Course not found
          router.push("/content-management/courses");
        }
        setIsLoading(false);
      }, 500);
    };
    
    fetchData();
  }, [courseId, router]);

  if (isLoading) {
    return (
      <>
        <PageContainer>
          <div className="flex justify-center items-center h-64">
            <p>Loading course data...</p>
          </div>
        </PageContainer>
      </>
    );
  }

  if (!courseData) {
    return (
      <>
        <PageContainer>
          <div className="flex justify-center items-center h-64">
            <p>Course not found.</p>
          </div>
        </PageContainer>
      </>
    );
  }

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
      type: value
    });
  };

  // Toggle publish status
  const handleTogglePublish = () => {
    setCourseData({
      ...courseData,
      isPublished: !courseData.isPublished,
      updatedAt: new Date().toISOString()
    });
  };

  // Handle topic name change
  const handleTopicNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTopic({
      ...currentTopic,
      name: e.target.value
    });
  };

  // Add a new topic
  const handleAddTopic = () => {
    if (currentTopic.name.trim() === "") return;
    
    const newTopic = {
      id: `topic-${Date.now()}`,
      name: currentTopic.name,
      moduleIds: [] as string[]
    };
    
    setCourseData({
      ...courseData,
      topics: [...courseData.topics, newTopic],
      updatedAt: new Date().toISOString()
    });
    
    setCurrentTopic({ name: "", moduleIds: [] });
  };

  // Remove a topic
  const handleRemoveTopic = (topicId: string) => {
    setCourseData({
      ...courseData,
      topics: courseData.topics.filter((topic: any) => topic.id !== topicId),
      updatedAt: new Date().toISOString()
    });
  };

  // Add a module to a topic
  const handleAddModuleToTopic = (topicId: string) => {
    if (!selectedModuleId) return;
    
    // Check if module is already added to any topic
    const isModuleAlreadyAdded = courseData.topics.some((topic: any) => 
      topic.moduleIds.includes(selectedModuleId)
    );
    
    if (isModuleAlreadyAdded) {
      alert("This module is already added to a topic.");
      return;
    }
    
    setCourseData({
      ...courseData,
      topics: courseData.topics.map((topic: any) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            moduleIds: [...topic.moduleIds, selectedModuleId]
          };
        }
        return topic;
      }),
      updatedAt: new Date().toISOString()
    });
    
    setSelectedModuleId("");
  };

  // Remove a module from a topic
  const handleRemoveModuleFromTopic = (topicId: string, moduleId: string) => {
    setCourseData({
      ...courseData,
      topics: courseData.topics.map((topic: any) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            moduleIds: topic.moduleIds.filter((id: string) => id !== moduleId)
          };
        }
        return topic;
      }),
      updatedAt: new Date().toISOString()
    });
  };

  // Add a new cohort
  const handleAddCohort = () => {
    if (!newCohort.trim()) return;
    
    // Check if cohort already exists
    if (courseData.cohorts.includes(newCohort)) {
      alert("This cohort is already added to the course.");
      return;
    }
    
    setCourseData({
      ...courseData,
      cohorts: [...courseData.cohorts, newCohort],
      updatedAt: new Date().toISOString()
    });
    
    setNewCohort("");
  };
  
  // Remove a cohort
  const handleRemoveCohort = (cohort: string) => {
    setCourseData({
      ...courseData,
      cohorts: courseData.cohorts.filter((c: string) => c !== cohort),
      updatedAt: new Date().toISOString()
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!courseData.title.trim()) {
      alert("Please enter a program title.");
      return;
    }
    
    if (courseData.topics.length === 0) {
      alert("Please add at least one topic.");
      return;
    }
    
    // In a real app, you would save this to a database
    console.log("Updating program:", courseData);
    
    // Navigate back to programs page
    router.push("/content-management/courses");
  };

  return (
    <>
      <PageHeader title="Welcome, John!" />
      <PageContainer>
        <div className="max-w-7xl mx-auto mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Edit Program</h1>
            <div className="w-[100px]"></div> {/* Empty div for flex spacing */}
          </div>
          
          {/* Course header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{courseData.title}</h2>
                    <Badge variant="outline" className="font-mono text-xs">
                      {courseData.programCode}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{courseData.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={courseData.type === "flagship" ? "default" : "secondary"}>
                      {courseData.type === "flagship" ? "Flagship" : "On-Demand"}
                    </Badge>
                    <Badge variant="outline" className={courseData.source === "direct" ? "text-blue-700" : "text-purple-700"}>
                      {courseData.source === "direct" ? "Direct" : "Corporate"}
                    </Badge>
                    {courseData.source === "corporate" && (
                      <Badge variant="outline" className="text-gray-700">
                        {courseData.orgName} ({courseData.orgCode})
                      </Badge>
                    )}
                    {courseData.isPublished ? (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        <Clock className="h-3 w-3 mr-1" />
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={courseData.isPublished}
                      onCheckedChange={handleTogglePublish}
                    />
                    <Label>
                      {courseData.isPublished ? "Published" : "Draft"}
                    </Label>
                  </div>
                  <Button type="button" onClick={handleSubmit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-[600px] mb-6">
              <TabsTrigger value="overview">Program Overview</TabsTrigger>
              <TabsTrigger value="topics">Topics & Modules</TabsTrigger>
              <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Program Information</CardTitle>
                  <CardDescription>Edit the basic information about this program</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Program Title</Label>
                    <Input 
                      id="title"
                      name="title"
                      value={courseData.title}
                      onChange={handleCourseChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="programCode">Program Code</Label>
                    <Input 
                      id="programCode"
                      name="programCode"
                      value={courseData.programCode}
                      onChange={handleCourseChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Format: VSDF1101, VSDFAPT1101</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Program Description</Label>
                    <Textarea 
                      id="description"
                      name="description"
                      value={courseData.description}
                      onChange={handleCourseChange}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Program Type</Label>
                      <Select 
                        value={courseData.type} 
                        onValueChange={handleTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select program type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flagship">Flagship</SelectItem>
                          <SelectItem value="on-demand">On-Demand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="source">Source</Label>
                      <Select 
                        value={courseData.source} 
                        onValueChange={(value) => setCourseData({...courseData, source: value as "direct" | "corporate", orgName: value === "direct" ? "" : courseData.orgName, orgCode: value === "direct" ? "" : courseData.orgCode})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">Direct</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {courseData.source === "corporate" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Select 
                          value={courseData.orgName}
                          onValueChange={(value) => setCourseData({...courseData, orgName: value, orgCode: value === "TechCorp Inc." ? "CMP1" : value === "Aptitude Systems" ? "CMP2" : value === "Global Solutions" ? "CMP3" : ""})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TechCorp Inc.">TechCorp Inc.</SelectItem>
                            <SelectItem value="Aptitude Systems">Aptitude Systems</SelectItem>
                            <SelectItem value="Global Solutions">Global Solutions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="orgCode">Organization Code</Label>
                        <Input 
                          id="orgCode"
                          name="orgCode"
                          value={courseData.orgCode}
                          readOnly
                          className="bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">Auto-generated based on organization</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={courseData.startDate}
                        onChange={handleCourseChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input 
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={courseData.endDate}
                        onChange={handleCourseChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Program Statistics</Label>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="border rounded-md p-4">
                        <div className="text-sm text-muted-foreground">Topics</div>
                        <div className="text-2xl font-bold">{courseData.topics.length}</div>
                      </div>
                      <div className="border rounded-md p-4">
                        <div className="text-sm text-muted-foreground">Modules</div>
                        <div className="text-2xl font-bold">
                          {courseData.topics.reduce((total: number, topic: any) => total + topic.moduleIds.length, 0)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <div className="text-sm text-muted-foreground">Cohorts</div>
                        <div className="text-2xl font-bold">{courseData.cohorts.length}</div>
                      </div>
                      <div className="border rounded-md p-4">
                        <div className="text-sm text-muted-foreground">Learners</div>
                        <div className="text-2xl font-bold">{courseData.learnersCount}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Program Timeline</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <div className="text-sm text-muted-foreground">Created</div>
                        <div className="text-base">{new Date(courseData.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="border rounded-md p-4">
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="text-base">{new Date(courseData.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Topics Tab */}
            <TabsContent value="topics">
              <Card>
                <CardHeader>
                  <CardTitle>Topics and Modules</CardTitle>
                  <CardDescription>Organize your program content into topics and modules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add new topic */}
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="text-lg font-medium">Add New Topic</h3>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter topic name"
                        value={currentTopic.name}
                        onChange={handleTopicNameChange}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddTopic}
                        disabled={!currentTopic.name.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Topic
                      </Button>
                    </div>
                  </div>
                  
                  {/* Topics list */}
                  {courseData.topics.length > 0 ? (
                    <Accordion type="multiple" className="border rounded-md">
                      {courseData.topics.map((topic: any, index: number) => (
                        <AccordionItem key={topic.id} value={topic.id}>
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{index + 1}. {topic.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({topic.moduleIds.length} modules)
                                </span>
                              </div>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTopic(topic.id);
                                }}
                                className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-accent text-destructive cursor-pointer"
                              >
                                <Trash className="h-4 w-4" />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            {/* Add modules to topic */}
                            <div className="flex gap-2 mb-4">
                              <Select 
                                value={selectedModuleId} 
                                onValueChange={setSelectedModuleId}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select a module" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableModules
                                    .filter(module => !courseData.topics.some((t: any) => 
                                      t.moduleIds.includes(module.id)
                                    ))
                                    .map(module => (
                                      <SelectItem key={module.id} value={module.id}>
                                        {module.moduleCode}: {module.title}
                                      </SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                              <Button 
                                type="button" 
                                onClick={() => handleAddModuleToTopic(topic.id)}
                                disabled={!selectedModuleId}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                            
                            {/* Modules list */}
                            {topic.moduleIds.length > 0 ? (
                              <div className="space-y-2">
                                {topic.moduleIds.map((moduleId: string, moduleIndex: number) => {
                                  const module = availableModules.find(m => m.id === moduleId);
                                  if (!module) return null;
                                  
                                  return (
                                    <div 
                                      key={moduleId}
                                      className="flex items-center justify-between bg-accent/20 p-2 rounded-md"
                                    >
                                      <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                          {moduleIndex + 1}. {module.moduleCode}: {module.title}
                                        </span>
                                      </div>
                                      <div 
                                        onClick={() => handleRemoveModuleFromTopic(topic.id, moduleId)}
                                        className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent text-destructive cursor-pointer"
                                      >
                                        <X className="h-4 w-4" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No modules added to this topic yet.
                              </p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">
                        No topics added yet. Add a topic to organize your program content.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Cohorts Tab */}
            <TabsContent value="cohorts">
              <Card>
                <CardHeader>
                  <CardTitle>Cohorts</CardTitle>
                  <CardDescription>Manage cohorts for this program</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add new cohort */}
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="text-lg font-medium">Add New Cohort</h3>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter cohort name"
                        value={newCohort}
                        onChange={(e) => setNewCohort(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddCohort}
                        disabled={!newCohort.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Cohort
                      </Button>
                    </div>
                  </div>
                  
                  {/* Cohorts list */}
                  {courseData.cohorts.length > 0 ? (
                    <div className="space-y-2">
                      {courseData.cohorts.map((cohort: string, index: number) => (
                        <div 
                          key={cohort}
                          className="flex items-center justify-between bg-accent/20 p-2 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {index + 1}. {cohort}
                            </span>
                          </div>
                          <div 
                            onClick={() => handleRemoveCohort(cohort)}
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent text-destructive cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">
                        No cohorts added yet. Add a cohort to manage learners.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-muted/30 rounded-md">
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium">Learners Count: {courseData.learnersCount}</h3>
                        <p className="text-sm text-muted-foreground">
                          The number of learners is auto-calculated based on the cohorts assigned to this program.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </>
  );
} 