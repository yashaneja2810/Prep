"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  Code, 
  FileText, 
  Filter, 
  LayoutDashboard, 
  Circle, 
  Copy, 
  Check, 
  Loader2, 
  ChevronUp,
  ArrowDownToLine,
  ArrowUpToLine
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useProgramContext } from "../layout";
import { CpsTab } from "./components/cps-tab";
import { ApsTab } from "./components/aps-tab";
import { StatusFilter } from "./components/status-filter";
import { toast } from "sonner";
import { getProgramModules } from "@/lib/api/programs";
import { getModuleTopics } from "@/lib/api/modules";
import { getCPsByTopicId, CP } from "@/lib/api/cps";
import { getAPsByTopicId, AP } from "@/lib/api/aps";
import { markCpCompleted, deleteCpCompletion, getUserCpCompletions, CpCompletion } from "@/lib/api/completions";
import { submitAp, getUserApSubmissions, ApSubmission } from "@/lib/api/submissions";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Combined task interface that can represent both CPs and APs
interface Task {
  id: string;
  title: string;
  description: string;
  type: 'CP' | 'AP';
  status: 'completed' | 'pending' | 'in-progress' | 'not-started';
  difficulty?: 'easy' | 'medium' | 'hard';
  topic_id?: string;
  topic_name?: string;
  module_id?: string;
  module_name?: string;
  created_at?: string;
  updated_at?: string;
  program_id?: string;
  code?: string;
  output?: string;
  explanation?: string;
  instruction?: string;
  objective?: string;
  input?: string;
  expected_output?: string;
}

type StatusFilter = 'all' | 'completed' | 'pending';

// Extend Window interface for global task data
declare global {
  interface Window {
    _CP_TASKS_DATA?: Record<string, any[]>;
    _AP_TASKS_DATA?: Record<string, any[]>;
    dispatchEvent(event: Event): boolean;
  }
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function ChecklistPage() {
  const router = useRouter();
  const params = useParams();
  const { program, programId, isLoading: programLoading } = useProgramContext();
  
  // State for tasks and filters
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CP' | 'AP'>('CP');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  // State for expanded CP in the main view
  const [expandedCpId, setExpandedCpId] = useState<string | null>(null);
  // State for copied code indicator
  const [copiedCpId, setCopiedCpId] = useState<string | null>(null);
  
  // Fetch modules, topics, and CPs/APs for the program
  useEffect(() => {
    const fetchTasks = async () => {
      if (!programId) return;
      
      try {
        setIsLoading(true);
        
        // Get modules for this program
        const modules = await getProgramModules(programId);
        if (!modules || modules.length === 0) {
          setTasks([]);
          return;
        }
        
        const allTasks: Task[] = [];
        
        // For each module, get its topics
        for (const module of modules) {
          const moduleTopics = await getModuleTopics(module.id);
          
          // For each topic, get CPs and APs
          for (const moduleTopic of moduleTopics) {
            const topic = moduleTopic.topic;
            if (!topic) continue;
            
            try {
              // Get CPs for this topic
              const cpsResponse = await getCPsByTopicId(topic.id);
              
              // Get CP completions for the user
              const cpCompletionsResponse = await getUserCpCompletions();
              const completedCpIds = new Set(
                cpCompletionsResponse.map((completion: CpCompletion) => completion.cp_id)
              );
              
              if (cpsResponse) {
                // Convert CPs to tasks
                const cpTasks = cpsResponse.map((cp: CP) => ({
                  id: cp.id,
                  title: cp.title,
                  description: cp.explanation,
                  type: 'CP' as const,
                  status: completedCpIds.has(cp.id) ? 'completed' as const : 'pending' as const,
                  difficulty: cp.difficulty as 'easy' | 'medium' | 'hard' | undefined,
                  topic_id: topic.id,
                  topic_name: topic.title,
                  module_id: module.id,
                  module_name: module.module_title,
                  code: cp.code,
                  output: cp.output,
                  explanation: cp.explanation,
                  program_id: programId as string,
                }));
                allTasks.push(...cpTasks);
              }
              
              // Get APs for this topic
              const apsResponse = await getAPsByTopicId(topic.id);
              
              // Get AP submissions for the user
              const apSubmissionsResponse = await getUserApSubmissions();
              console.log(`Fetched ${apSubmissionsResponse.length || 0} AP submissions`);
              
              // Consider an AP completed if any submission exists for it (removing the is_correct filter)
              const completedApIds = new Set(
                apSubmissionsResponse
                  .map((submission: ApSubmission) => submission.ap_id)
              );
              
              if (apsResponse) {
                // Convert APs to tasks
                const apTasks = apsResponse.map((ap: AP) => ({
                  id: ap.id,
                  title: ap.title,
                  description: ap.instruction,
                  type: 'AP' as const,
                  status: completedApIds.has(ap.id) ? 'completed' as const : 'pending' as const,
                  difficulty: ap.difficulty as 'easy' | 'medium' | 'hard' | undefined,
                  topic_id: topic.id,
                  topic_name: topic.title,
                  module_id: module.id,
                  module_name: module.module_title,
                  instruction: ap.instruction,
                  objective: ap.objective,
                  input: ap.input,
                  expected_output: ap.expected_output,
                  program_id: programId as string,
                }));
                allTasks.push(...apTasks);
              }
            } catch (topicError) {
              console.error(`Error fetching tasks for topic ${topic.id}:`, topicError);
            }
          }
        }
        
        // Make task data available globally for components
        if (typeof window !== 'undefined') {
          // Group CPs by topic
          const cpsByTopic: Record<string, any[]> = {};
          const apsByTopic: Record<string, any[]> = {};
          
          allTasks.forEach(task => {
            const topicKey = task.topic_id || 'default';
            if (task.type === 'CP') {
              if (!cpsByTopic[topicKey]) cpsByTopic[topicKey] = [];
              cpsByTopic[topicKey].push(task);
            } else {
              if (!apsByTopic[topicKey]) apsByTopic[topicKey] = [];
              apsByTopic[topicKey].push(task);
            }
          });
          
          window._CP_TASKS_DATA = cpsByTopic;
          window._AP_TASKS_DATA = apsByTopic;
        }
        
        setTasks(allTasks);
        setError(null);
        
        // If there are modules, expand the first one by default
        if (modules.length > 0) {
          setExpandedModuleId(modules[0].id);
        }
      } catch (err) {
        console.error('Error fetching program tasks:', err);
        setError('Failed to load program tasks');
        toast.error('Error loading program tasks');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [programId]);
  
  // Listen for task status changes from components
  useEffect(() => {
    const handleTaskStatusChanged = (event: CustomEvent) => {
      if (event.detail) {
        const { taskId, status, type } = event.detail;
        
        // Update task in the list
        setTasks(prevTasks => prevTasks.map(task => 
          task.id === taskId ? { ...task, status: status } : task
        ));
        
        // Log the change for debugging
        console.log(`Task ${taskId} status changed to ${status} (${type || 'unknown type'})`);
      }
    };
    
    window.addEventListener('taskStatusChanged', handleTaskStatusChanged as EventListener);
    
    return () => {
      window.removeEventListener('taskStatusChanged', handleTaskStatusChanged as EventListener);
    };
  }, []);
  
  // Toggle CP task completion
  const toggleCPCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.type !== 'CP') return;
    
    const isCurrentlyCompleted = task.status === 'completed';
    
    try {
      if (isCurrentlyCompleted) {
        // Delete completion via API
        await deleteCpCompletion({
          cp_id: taskId
        });
      } else {
        // Mark as completed via API
        await markCpCompleted({
          cp_id: taskId
        });
      }
      
      // Update task in the list
      setTasks(tasks.map(t => 
        t.id === taskId 
          ? { ...t, status: isCurrentlyCompleted ? 'pending' as const : 'completed' as const }
          : t
      ));
      
      toast.success(`Task marked as ${isCurrentlyCompleted ? 'pending' : 'completed'}`);
    } catch (error) {
      console.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} CP completion:`, error);
      toast.error(`Failed to update task status. Please try again.`);
    }
  };
  
  // Toggle AP task completion
  const toggleAPCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.type !== 'AP') return;
    
    const isCurrentlyCompleted = task.status === 'completed';
    
    try {
      // For APs, we submit a solution to mark it as complete
      if (!isCurrentlyCompleted) {
        // Submit a solution via API
        const submissionResponse = await submitAp({
          ap_id: taskId,
          submission_code: "// Marked as completed via main checklist"
        });
        
        if (!submissionResponse) {
          toast.error(`Failed to mark task as completed`);
          return;
        }
        
        console.log('AP submission successful from main page:', submissionResponse);
        
        // Update task in the list
        setTasks(tasks.map(t => 
          t.id === taskId 
            ? { ...t, status: 'completed' as const }
            : t
        ));
        
        // Also refresh AP submissions data to ensure consistency
        try {
          const updatedSubmissions = await getUserApSubmissions();
          console.log('Updated AP submissions:', updatedSubmissions.length || 0);
        } catch (err) {
          console.warn('Failed to refresh AP submissions data:', err);
        }
        
        toast.success(`Task marked as completed`);
      } else {
        // In a real implementation, we can't delete submissions
        // But we can mark it as incomplete in the UI for demo purposes
        
        // Update task in the list
        setTasks(tasks.map(t => 
          t.id === taskId 
            ? { ...t, status: 'pending' as const }
            : t
        ));
        
        toast.success(`Task marked as pending`);
      }
      
      // Update global task data if available
      if (typeof window !== 'undefined' && window && 'undefined' !== typeof window._AP_TASKS_DATA && window._AP_TASKS_DATA) {
        const topicId = task.topic_id || '';
        if (window._AP_TASKS_DATA[topicId]) {
          const taskIndex = window._AP_TASKS_DATA[topicId].findIndex((t: any) => t.id === taskId);
          if (taskIndex !== -1) {
            window._AP_TASKS_DATA[topicId][taskIndex].status = isCurrentlyCompleted ? 'pending' : 'completed';
          }
        }
      }
    } catch (error) {
      console.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} AP completion:`, error);
      toast.error(`Failed to update task status. Please try again.`);
    }
  };
  
  // Toggle task completion based on type
  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (task.type === 'CP') {
      toggleCPCompletion(taskId);
    } else {
      toggleAPCompletion(taskId);
    }
  };
  
  // Helper functions to get counts
  const getFilterCounts = (type: 'CP' | 'AP') => {
    const typeTasks = tasks.filter(task => 
      task.type === type && 
      (selectedTopic ? task.topic_id === selectedTopic : true)
    );
    const completed = typeTasks.filter(task => task.status === 'completed').length;
    const pending = typeTasks.filter(task => task.status === 'pending' || task.status === 'in-progress' || task.status === 'not-started').length;
    const total = typeTasks.length;
    
    return { completed, pending, total };
  };
  
  // Calculate overall progress
  const getCounts = () => {
    const filteredTasksList = tasks.filter(task => 
      selectedTopic ? task.topic_id === selectedTopic : true
    );
    const completedTasks = filteredTasksList.filter(task => task.status === 'completed').length;
    const totalTasks = filteredTasksList.length;
    const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { completedTasks, totalTasks, percentComplete };
  };
  
  // Group tasks by module
  const getTasksByModule = () => {
    const moduleMap: Record<string, {
      id: string,
      name: string,
      tasks: Task[]
    }> = {};
    
    tasks.filter(task => task.type === activeTab).forEach(task => {
      if (task.module_id && task.module_name) {
        if (!moduleMap[task.module_id]) {
          moduleMap[task.module_id] = {
            id: task.module_id,
            name: task.module_name,
            tasks: []
          };
        }
        moduleMap[task.module_id].tasks.push(task);
      }
    });
    
    return Object.values(moduleMap);
  };
  
  // Toggle module expansion
  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
  };

  // Expand all modules
  const expandAllModules = () => {
    // Create an array of all module IDs
    const allModuleIds = topics.map(module => module.id);
    // Set all modules as expanded by storing their IDs in a Set
    setExpandedModuleId('all');
  };
  
  // Collapse all modules
  const collapseAllModules = () => {
    setExpandedModuleId(null);
  };

  // Select a topic
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId === selectedTopic ? null : topicId);
  };

  // Filter tasks based on active tab and status filter
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      // Filter by task type (CP or AP)
      if (task.type !== activeTab) return false;
      
      // Filter by completion status
      if (statusFilter === 'completed' && task.status !== 'completed') return false;
      if (statusFilter === 'pending' && task.status === 'completed') return false;
      
      // Filter by selected topic (if any)
      if (selectedTopic && task.topic_id !== selectedTopic) return false;
      
      return true;
    });
  }, [tasks, activeTab, statusFilter, selectedTopic]);
  
  // Get topics from the tasks
  const topics = React.useMemo(() => {
    const topicMap = new Map<string, {id: string; name: string; moduleId: string; moduleName: string}>();
    
    tasks.forEach(task => {
      if (task.topic_id && task.topic_name && task.module_id && task.module_name) {
        topicMap.set(task.topic_id, {
          id: task.topic_id,
          name: task.topic_name,
          moduleId: task.module_id,
          moduleName: task.module_name
        });
      }
    });
    
    // Group topics by module
    const groupedTopics: Record<string, {moduleName: string; topics: {id: string; name: string}[]}> = {};
    
    Array.from(topicMap.values()).forEach(topic => {
      if (!groupedTopics[topic.moduleId]) {
        groupedTopics[topic.moduleId] = {
          moduleName: topic.moduleName,
          topics: []
        };
      }
      
      groupedTopics[topic.moduleId].topics.push({
        id: topic.id,
        name: topic.name
      });
    });
    
    return Object.entries(groupedTopics).map(([moduleId, data]) => ({
      id: moduleId,
      name: data.moduleName,
      topics: data.topics
    }));
  }, [tasks]);
  
  if (programLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Tasks</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push(`/programs/${programId}`)}>
            Return to Program
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Main content area - full width */}
      <div className="w-full h-full flex flex-col">
        {/* Common box container wrapping entire content */}
        <div className="flex-1 m-4 border rounded-xl shadow-sm bg-card overflow-hidden flex flex-col">
          {/* Header with title and description */}
          <div className="border-b px-6 py-5 bg-muted/50">
            <h1 className="text-2xl font-bold mb-1">Tasks Checklist</h1>
            <p className="text-muted-foreground text-sm">Track your assignments, submissions, and progress on practice tasks.</p>
          </div>
          
          {/* Tasks area with sidebar and content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left sidebar for topics */}
            <div className="w-64 border-r overflow-y-auto bg-[#111] text-white">
              <div className="p-4">
                {/* Topics with collapse/expand buttons */}
                <div className="mt-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm text-white/50">Modules</h3>
          
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-white/50 hover:text-white hover:bg-transparent"
                        onClick={collapseAllModules}
                        title="Collapse all"
                      >
                        <ArrowUpToLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-white/50 hover:text-white hover:bg-transparent"
                        onClick={expandAllModules}
                        title="Expand all"
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* All Tasks link */}
                  <div 
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors mt-3",
                        !selectedTopic ? "bg-[#222] text-white" : "text-white/70 hover:bg-[#191919]"
                    )}
                    onClick={() => setSelectedTopic(null)}
                  >
                      <LayoutDashboard className="h-4 w-4 opacity-70" />
                      <span className="text-sm font-medium">All Tasks</span>
                  </div>
                  <div className="space-y-1">
                    {topics.map((module) => (
                      <div key={module.id} className="mb-3">
                        <div 
                          className="flex items-center justify-between py-1.5 px-1 text-sm cursor-pointer hover:text-white transition-colors"
                          onClick={() => toggleModuleExpanded(module.id)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedModuleId === module.id || expandedModuleId === 'all' ? 
                              <ChevronDown className="h-4 w-4 text-white/60" /> : 
                              <ChevronRight className="h-4 w-4 text-white/60" />
                            }
                            <span className="text-white/90 font-medium uppercase text-xs tracking-wider">{module.name}</span>
                          </div>
                        </div>
                        
                        {(expandedModuleId === module.id || expandedModuleId === 'all') && (
                          <div className="ml-5 mt-1 space-y-1">
                            {module.topics.map((topic) => {
                              // Calculate if topic is completed
                              const topicTasks = tasks.filter(t => t.topic_id === topic.id);
                              const isCompleted = topicTasks.length > 0 && 
                                topicTasks.every(t => t.status === 'completed');
                              
                              return (
                                <div 
                                  key={topic.id}
                                  className={cn(
                                    "flex items-center gap-2 py-1.5 cursor-pointer text-sm transition-colors",
                                    selectedTopic === topic.id 
                                      ? "text-white" 
                                      : "text-white/60 hover:text-white/80"
                                  )}
                                  onClick={() => handleTopicSelect(topic.id)}
                                >
                                  <span className="truncate">{topic.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side content */}
            <div className="flex-1 overflow-auto">
              {/* Filter section */}
              <div className="flex items-center justify-between px-6 py-3 border-b sticky top-0 z-10 bg-card">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-medium">
                    {selectedTopic 
                      ? `${topics.find(m => m.topics.some(t => t.id === selectedTopic))?.topics.find(t => t.id === selectedTopic)?.name || 'Selected Topic'}`
                      : 'All Tasks'
                    }
                  </h3>
                  
                  {/* Task type selector moved here from sidebar */}
                  <div className="flex items-center space-x-4">
                    <button 
                      className={`flex items-center gap-2 py-1 text-sm transition-colors ${activeTab === 'CP' ? 'text-purple-400' : 'text-foreground/60 hover:text-foreground/80'}`}
                      onClick={() => setActiveTab('CP')}
                    >
                      <Code className="h-4 w-4" />
                      <span>CP Tasks</span>
                    </button>
                    <button 
                      className={`flex items-center gap-2 py-1 text-sm transition-colors ${activeTab === 'AP' ? 'text-amber-400' : 'text-foreground/60 hover:text-foreground/80'}`}
                      onClick={() => setActiveTab('AP')}
                    >
                      <FileText className="h-4 w-4" />
                      <span>AP Tasks</span>
                    </button>
                  </div>
                </div>
                
                <StatusFilter 
                  value={statusFilter} 
                  onChange={(value) => setStatusFilter(value as StatusFilter)} 
                  counts={{
                    all: filteredTasks.length,
                    completed: tasks.filter(t => 
                      t.type === activeTab && 
                      t.status === 'completed' && 
                      (selectedTopic ? t.topic_id === selectedTopic : true)
                    ).length,
                    pending: tasks.filter(t => 
                      t.type === activeTab && 
                      t.status !== 'completed' && 
                      (selectedTopic ? t.topic_id === selectedTopic : true)
                    ).length
                  }}
                />
              </div>

              {/* Task list */}
              <div className="p-6">
                {selectedTopic ? (
                  // Show specific topic tasks
                  activeTab === 'CP' ? (
                    <CpsTab 
                      topicId={selectedTopic} 
                      programId={programId as string} 
                    />
                  ) : (
                    <ApsTab 
                      topicId={selectedTopic} 
                      programId={programId as string}
                    />
                  )
                ) : (
                  // Show all tasks in a unified view
                  <div className="w-full">
                    {filteredTasks.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-muted/40 px-4 py-2 border-b">
                          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground">
                            <div className="col-span-6">Title</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Difficulty</div>
                            <div className="col-span-2 text-right">Status</div>
                          </div>
                        </div>
                        <div className="divide-y">
                          {filteredTasks.map((task) => (
                            <div 
                              key={task.id}
                              className={cn(
                                "px-4 py-3 cursor-pointer hover:bg-muted/50",
                                task.status === 'completed' && "bg-green-50/30 dark:bg-green-900/10"
                              )}
                              onClick={() => {
                                // Open task directly instead of navigating to topic
                                if (task.type === 'AP') {
                                  // Store the selected AP in localStorage to access it
                                  localStorage.setItem('selected-ap', JSON.stringify({
                                    id: task.id,
                                    title: task.title,
                                    topic_id: task.topic_id,
                                    difficulty: task.difficulty,
                                    input: task.input,
                                    expected_output: task.expected_output,
                                    instruction: task.instruction,
                                    objective: task.objective,
                                    // Add these fields for the ap-details page
                                    learningObjectives: task.objective ? task.objective.split('\n').filter(Boolean) : [],
                                    instructions: task.instruction ? task.instruction.split('\n').filter(Boolean) : [],
                                    sampleInput: task.input || 'No sample input provided',
                                    expectedOutput: task.expected_output || 'No expected output provided',
                                    explanation: "Follow the instructions to solve this problem."
                                  }));
                                  // Open AP details in new tab
                                  window.open(`/ap-details`, '_blank');
                                } else if (task.type === 'CP') {
                                  // For CP tasks, toggle expansion
                                  setExpandedCpId(expandedCpId === task.id ? null : task.id);
                                }
                              }}
                            >
                              <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="flex items-center gap-2 col-span-6">
                                    {task.status === 'completed' ? (
                                    <CheckCircle 
                                      className="h-4 w-4 text-green-500 shrink-0 cursor-pointer" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTaskCompletion(task.id);
                                      }}
                                    />
                                    ) : (
                                    <Circle 
                                      className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-pointer" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTaskCompletion(task.id);
                                      }}
                                    />
                                    )}
                                  <span className="text-sm">{task.title}</span>
                                </div>
                                <div className="col-span-2">
                                  <Badge className={cn(
                                    "px-2 py-0.5 text-xs font-medium",
                                    task.type === 'CP' 
                                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                  )}>
                                    {task.type}
                                  </Badge>
                                  </div>
                                <div className="col-span-2">
                                  <Badge className={cn(
                                    "px-2 py-0.5 text-xs font-medium",
                                    task.difficulty?.toLowerCase() === 'easy'
                                      ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                                      : task.difficulty?.toLowerCase() === 'medium' || task.difficulty?.toLowerCase() === 'intermediate'
                                      ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                                      : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                                  )}>
                                    {task.difficulty || 'Medium'}
                                  </Badge>
                                </div>
                                <div className="col-span-2 text-right flex items-center justify-end gap-2">
                                  <Badge className={cn(
                                    "px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1",
                                    task.status === 'completed'
                                      ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                                      : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                                  )}>
                                    {task.status === 'completed' ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : (
                                      <Clock className="h-3 w-3" />
                                    )}
                                    <span>{task.status === 'completed' ? 'Completed' : 'Pending'}</span>
                                  </Badge>
                                  {task.type === 'CP' && (
                                    <ChevronDown className={cn(
                                      "h-5 w-5 text-muted-foreground transition-transform",
                                      expandedCpId === task.id ? "transform rotate-180" : ""
                                    )} />
                                  )}
                                </div>
                              </div>
                              
                              {/* Expanded CP content */}
                              {task.type === 'CP' && expandedCpId === task.id && (
                                <div className="px-3 sm:px-4 pb-3 sm:pb-4 mt-3" id={task.id}>
                                  <div className="bg-muted/30 rounded-md overflow-hidden">
                                    <div className="flex items-center justify-between bg-muted px-3 sm:px-4 py-1.5 sm:py-2">
                                      <div className="font-mono text-[10px] sm:text-xs">Code Example</div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 sm:h-7 w-6 sm:w-7 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(task.code || '');
                                          setCopiedCpId(task.id);
                                          setTimeout(() => setCopiedCpId(null), 2000);
                                        }}
                                      >
                                        {copiedCpId === task.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                      </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 divide-y">
                                      {/* Code Section */}
                                      <div className="bg-muted/10">
                                        <pre className="text-xs sm:text-sm overflow-x-auto p-3 sm:p-4 whitespace-pre-wrap">
                                          {task.code}
                                        </pre>
                                      </div>
                                      
                                      {/* Output Section */}
                                      {task.output && (
                                        <div className="bg-black/5 dark:bg-white/5">
                                          <div className="px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs text-muted-foreground border-b">Output</div>
                                          <pre className="text-xs sm:text-sm overflow-x-auto p-3 sm:p-4 whitespace-pre-wrap text-muted-foreground">
                                            {task.output}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="p-3 sm:p-4 border-t bg-green-50/30 dark:bg-green-950/20">
                                      <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Explanation:</h4>
                                      <p className="text-xs sm:text-sm text-muted-foreground">{task.explanation}</p>
                                    </div>
                                    
                                    {/* Mark Complete Button */}
                                    <div className="p-3 sm:p-4 border-t flex justify-end">
                                      <Button 
                                        size="sm"
                                        variant={task.status === 'completed' ? "outline" : "default"}
                                        className={cn(
                                          "flex items-center gap-1.5 sm:gap-2 w-full sm:w-[160px] h-7 sm:h-9 text-xs sm:text-sm",
                                          task.status === 'completed' ? "border-green-500 text-green-600" : "bg-green-600 hover:bg-green-700"
                                        )}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTaskCompletion(task.id);
                                        }}
                                      >
                                        {task.status === 'completed' ? (
                                          <>
                                            <CheckCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                                            <span>Completed</span>
                                          </>
                                        ) : (
                                          <>
                                            <Circle className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                                            <span className="hidden sm:inline">Mark as Complete</span>
                                            <span className="inline sm:hidden">Complete</span>
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                        <LayoutDashboard className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium mb-1">No tasks found</h3>
                        <p className="text-muted-foreground text-sm max-w-md mb-4">
                          No {activeTab} tasks found with the current filters.
                        </p>
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => setStatusFilter('all')}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}