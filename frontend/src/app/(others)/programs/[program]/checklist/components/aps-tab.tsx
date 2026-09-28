"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Braces, HelpCircle, Check, Loader2, FileText, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAPsByTopicId, AP } from "@/lib/api/aps";
import { submitAp, getUserApSubmissions } from "@/lib/api/submissions";

interface TabProps {
  topicId: string;
  programId: string;
  tasks?: any[];
  completedTasks?: string[];
  taskStatuses?: Record<string, any>;
  statusFilter?: 'all' | 'completed' | 'pending';
  hideProgressSummary?: boolean;
  hideHeader?: boolean;
}

// Enhanced AP type for UI display
interface EnhancedAP {
  id: string;
  topic_id: string;
  title: string;
  difficulty?: string;
  input?: string;
  expected_output?: string;
  instruction: string;
  objective: string;
  instructions?: string[];
  learningObjectives?: string[];
  description?: string;
  sampleInput?: string;
  expectedOutput?: string;
  status?: 'completed' | 'pending';
}

export function ApsTab({ topicId, programId, hideProgressSummary = false, hideHeader = false }: TabProps) {
  const router = useRouter();
  const [aps, setAps] = useState<EnhancedAP[]>([]);
  const [completedAPs, setCompletedAPs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Fetch APs from API
  useEffect(() => {
    const fetchAPs = async () => {
      if (!topicId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get APs for this topic
        const response = await getAPsByTopicId(topicId);
        
        // Get user submissions to determine which APs are completed
        const submissionsResponse = await getUserApSubmissions();
        const userSubmissions = submissionsResponse || [];
        
        // Group submissions by AP ID without filtering for is_correct
        const completedApIds = new Set(
          userSubmissions
            .map(submission => submission.ap_id)
        );
        
        if (response) {
          // Convert API response to enhanced format for UI display
          const enhancedAPs: EnhancedAP[] = response.map(ap => ({
            ...ap,
            instructions: ap.instruction ? ap.instruction.split('\n').filter(Boolean) : [],
            learningObjectives: ap.objective ? ap.objective.split('\n').filter(Boolean) : [],
            description: (ap.objective ? ap.objective.split('\n')[0] : 'No description available'),
            sampleInput: ap.input || 'No sample input provided',
            expectedOutput: ap.expected_output || 'No expected output provided',
            status: completedApIds.has(ap.id) ? 'completed' as const : 'pending' as const
          }));
          
          // Set completed APs from submissions data
          setCompletedAPs(Array.from(completedApIds));
          setAps(enhancedAPs);
          
          // Log completion status for debugging
          console.log(`Loaded ${enhancedAPs.length} APs, ${completedApIds.size} completed`);
        } else {
          setError('Failed to load application practices');
          setAps([]);
        }
      } catch (err) {
        console.error('Error fetching application practices:', err);
        setError('Failed to load application practices');
        setAps([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAPs();
  }, [topicId]);
  
  // Toggle completion status
  const toggleAPCompletion = async (apId: string, event: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    const isCurrentlyCompleted = completedAPs.includes(apId);
    
    try {
      // For APs, we submit a solution to mark it as complete
      if (!isCurrentlyCompleted) {
        // Submit a solution via API with the "// Marked as completed" placeholder code
        const submissionResponse = await submitAp({
          ap_id: apId,
          submission_code: "// Marked as completed via checklist"
        });
        
        if (submissionResponse) {
          console.log('AP submission successful:', submissionResponse);
          
          // Add to local state
          setCompletedAPs(prev => [...prev, apId]);
          
          // Update AP in the list
          setAps(prev => prev.map(ap => 
            ap.id === apId ? { ...ap, status: 'completed' as const } : ap
          ));
          
          toast.success(`Task marked as completed`);
        } else {
          toast.error(`Failed to mark task as completed`);
          return;
        }
      } else {
        // In a real implementation, we can't delete submissions
        // But we can mark it as incomplete in the UI for demo purposes
        setCompletedAPs(prev => prev.filter(id => id !== apId));
        
        // Update AP in the list
        setAps(prev => prev.map(ap => 
          ap.id === apId ? { ...ap, status: 'pending' as const } : ap
        ));
        
        toast.success(`Task marked as pending`);
      }
      
      // Dispatch event to notify other components
      const newStatus = isCurrentlyCompleted ? 'pending' : 'completed';
      
      // Use CustomEvent with proper type casting for better browser compatibility
      const statusChangeEvent = new CustomEvent('taskStatusChanged', {
        detail: {
          taskId: apId,
          status: newStatus,
          type: 'AP'
        }
      });
      
      window.dispatchEvent(statusChangeEvent);
      
      // Also update any global task data if available
      if (typeof window !== 'undefined' && window && 'undefined' !== typeof window._AP_TASKS_DATA && window._AP_TASKS_DATA) {
        Object.keys(window._AP_TASKS_DATA).forEach(topicKey => {
          const topicTasks = window._AP_TASKS_DATA![topicKey];
          const taskIndex = topicTasks.findIndex((t: any) => t.id === apId);
          if (taskIndex !== -1) {
            topicTasks[taskIndex].status = newStatus;
          }
        });
      }
    } catch (error) {
      console.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} AP completion:`, error);
      toast.error(`Failed to update task status. Please try again.`);
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = aps.length > 0 
    ? Math.round((completedAPs.length / aps.length) * 100) 
    : 0;
  
  // Open AP details in new tab
  const openAPDetails = (ap: EnhancedAP) => {
    // Store the selected AP in localStorage to access it in the new tab
    localStorage.setItem('selected-ap', JSON.stringify(ap));
    // Open a new tab with the AP details
    window.open(`/ap-details`, '_blank');
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading application practices...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div 
        ref={contentRef}
        className="w-full flex-1 overflow-y-auto scrollbar-thin pb-4"
      >
        <div className="p-0 sm:p-1 md:p-2 w-full max-w-none">
          <div className="relative">
            
            {/* AP List */}
            {aps.length > 0 ? (
              <div className="border rounded-lg overflow-hidden shadow-sm w-full">
                {!hideHeader && (
                  <div className="bg-muted/40 px-4 py-2 border-b">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground">
                      <div className="col-span-6">Title</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Difficulty</div>
                      <div className="col-span-2 text-right">Status</div>
                    </div>
                  </div>
                )}
                <div className="divide-y w-full">
                  {aps.map((ap) => (
                    <div 
                      key={ap.id} 
                      className={cn(
                        "px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors w-full",
                        completedAPs.includes(ap.id) ? "bg-green-50/50 dark:bg-green-900/10" : ""
                      )}
                      onClick={() => openAPDetails(ap)}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="flex items-center gap-2 col-span-6">
                          <div 
                            className="cursor-pointer"
                            onClick={(e) => toggleAPCompletion(ap.id, e)}
                          >
                            {completedAPs.includes(ap.id) ? (
                              <div
                                className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border border-muted-foreground/30">
                              </div>
                            )}
                          </div>
                          <span className="text-sm">{ap.title}</span>
                        </div>
                        
                        <div className="col-span-2">
                          <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 px-2 py-0.5 text-xs">AP</Badge>
                        </div>
                        
                        <div className="col-span-2">
                          <Badge className={cn(
                            "text-xs px-2 py-0.5",
                            ap.difficulty?.toLowerCase() === "easy" 
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-0" 
                              : ap.difficulty?.toLowerCase() === "medium" || ap.difficulty?.toLowerCase() === "intermediate"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-0"
                          )}>
                            {ap.difficulty || 'Medium'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-end col-span-2">
                          <Badge className={cn(
                            "text-xs flex items-center gap-1.5 px-2 py-0.5",
                            completedAPs.includes(ap.id)
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-0" 
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0"
                          )}>
                            {completedAPs.includes(ap.id) ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                <span>Completed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" />
                                <span>Pending</span>
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>No application practices available</AlertTitle>
                <AlertDescription>
                  There are no application practices available for this topic yet.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 