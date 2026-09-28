"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, HelpCircle, Copy, Check, CheckCircle, Circle, Loader2, ChevronDown, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCPsByTopicId, CP } from "@/lib/api/cps";
import { markCpCompleted, deleteCpCompletion } from "@/lib/api/completions";
import { getUserCpCompletions } from "@/lib/api/completions";

interface TabProps {
  topicId: string;
  programId: string;
  tasks?: any[];
  completedTasks?: string[];
  onToggleCompletion?: (taskId: string, currentStatus: any) => void;
  taskStatuses?: Record<string, any>;
  statusFilter?: 'all' | 'completed' | 'pending';
  hideProgressSummary?: boolean;
  hideHeader?: boolean;
}

interface ConceptPractice {
  id: string;
  topic_id: string;
  title: string;
  difficulty?: string;
  code: string;
  output: string;
  explanation: string;
  status?: 'completed' | 'pending';
  updated_at?: string | null;
}

export function CpsTab({ topicId, programId, hideProgressSummary = false, hideHeader = false }: TabProps) {
  const router = useRouter();
  const [cps, setCps] = useState<ConceptPractice[]>([]);
  const [selectedCP, setSelectedCP] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [completedCPs, setCompletedCPs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Fetch CPs from the API
  useEffect(() => {
    const fetchCPs = async () => {
      if (!topicId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get CPs for this topic
        const response = await getCPsByTopicId(topicId);
        
        // Get user CP completions
        const completionsResponse = await getUserCpCompletions();
        const userCompletions = completionsResponse || [];
        
        // Extract completed CP IDs
        const completedCpIds = new Set(
          userCompletions.map(completion => completion.cp_id)
        );
        
        if (response) {
          // Map CPs with completion status
          const cpData = response.map(cp => ({
            ...cp,
            updated_at: null,
            status: completedCpIds.has(cp.id) ? 'completed' as const : 'pending' as const
          }));
          
          setCps(cpData);
          
          // Set completed CPs from completions data
          setCompletedCPs(Array.from(completedCpIds));
        } else {
          setError('Failed to load concept practices');
          setCps([]);
        }
      } catch (err) {
        console.error('Error fetching concept practices:', err);
        setError('Failed to load concept practices');
        setCps([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCPs();
  }, [topicId]);
  
  // Handle code copying
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  // Toggle completion status
  const toggleCPCompletion = async (cpId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    const isCurrentlyCompleted = completedCPs.includes(cpId);
    
    try {
      if (isCurrentlyCompleted) {
        // Delete completion via API
        await deleteCpCompletion({
          cp_id: cpId
        });
        
        // Remove from local state
        setCompletedCPs(completedCPs.filter(id => id !== cpId));
      } else {
        // Mark as completed via API
        await markCpCompleted({
          cp_id: cpId
        });
        
        // Add to local state
        setCompletedCPs([...completedCPs, cpId]);
      }
      
      // Update CP in the list
      setCps(cps.map(cp => 
        cp.id === cpId 
          ? { ...cp, status: isCurrentlyCompleted ? 'pending' as const : 'completed' as const }
          : cp
      ));
      
      toast.success(`Task marked as ${isCurrentlyCompleted ? 'pending' : 'completed'}`);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('taskStatusChanged', {
        detail: {
          taskId: cpId,
          status: isCurrentlyCompleted ? 'pending' : 'completed',
          programId
        }
      }));
    } catch (error) {
      console.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} CP completion:`, error);
      toast.error(`Failed to update task status. Please try again.`);
    }
  };
  
  // Calculate completion percentage
  const progressPercentage = cps.length > 0 
    ? Math.round((completedCPs.length / cps.length) * 100) 
    : 0;
    
  // Toggle CP dropdown
  const toggleCP = (cpId: string) => {
    setSelectedCP(selectedCP === cpId ? null : cpId);
    
    // Scroll to the selected CP if it's being opened
    if (selectedCP !== cpId && contentRef.current) {
      setTimeout(() => {
        const element = document.getElementById(cpId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading concept practices...</p>
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
          
            {/* CP List */}
            {cps.length > 0 ? (
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
                  {cps.map((cp) => (
                    <div key={cp.id} className={cn(
                      "px-4 py-3 hover:bg-muted/50 transition-colors w-full cursor-pointer",
                      completedCPs.includes(cp.id) ? "bg-green-50/50 dark:bg-green-900/10" : ""
                    )}
                    onClick={() => toggleCP(cp.id)}>
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="flex items-center gap-2 col-span-6">
                          <div 
                            className="cursor-pointer"
                            onClick={(e) => toggleCPCompletion(cp.id, e)}
                          >
                            {completedCPs.includes(cp.id) ? (
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
                          <span className="text-sm">{cp.title}</span>
                        </div>
                        
                        <div className="col-span-2">
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 px-2 py-0.5 text-xs">CP</Badge>
                        </div>
                        
                        <div className="col-span-2">
                          <Badge className={cn(
                            "text-xs px-2 py-0.5",
                            cp.difficulty?.toLowerCase() === "easy" 
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-0" 
                              : cp.difficulty?.toLowerCase() === "medium" || cp.difficulty?.toLowerCase() === "intermediate"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-0"
                          )}>
                            {cp.difficulty || 'Medium'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-end gap-2 col-span-2">
                          <Badge className={cn(
                            "text-xs flex items-center gap-1.5 px-2 py-0.5",
                            completedCPs.includes(cp.id)
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-0" 
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0"
                          )}>
                            {completedCPs.includes(cp.id) ? (
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
                          <ChevronDown className={cn(
                            "h-5 w-5 text-muted-foreground transition-transform",
                            selectedCP === cp.id ? "transform rotate-180" : ""
                          )} />
                        </div>
                      </div>
                      
                      {selectedCP === cp.id && (
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 mt-3" id={cp.id}>
                          <div className="bg-muted/30 rounded-md overflow-hidden">
                            <div className="flex items-center justify-between bg-muted px-3 sm:px-4 py-1.5 sm:py-2">
                              <div className="font-mono text-[10px] sm:text-xs">Code Example</div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 sm:h-7 w-6 sm:w-7 p-0"
                                onClick={() => handleCopyCode(cp.code, cp.id)}
                              >
                                {copiedIndex === cp.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 divide-y">
                              {/* Code Section */}
                              <div className="bg-muted/10">
                                <pre className="text-xs sm:text-sm overflow-x-auto p-3 sm:p-4 whitespace-pre-wrap">
                                  {cp.code}
                                </pre>
                              </div>
                              
                              {/* Output Section */}
                              {cp.output && (
                                <div className="bg-black/5 dark:bg-white/5">
                                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs text-muted-foreground border-b">Output</div>
                                  <pre className="text-xs sm:text-sm overflow-x-auto p-3 sm:p-4 whitespace-pre-wrap text-muted-foreground">
                                    {cp.output}
                                  </pre>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-3 sm:p-4 border-t bg-green-50/30 dark:bg-green-950/20">
                              <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Explanation:</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">{cp.explanation}</p>
                            </div>
                            
                            {/* Mark Complete Button */}
                            <div className="p-3 sm:p-4 border-t flex justify-end">
                              <Button 
                                size="sm"
                                variant={completedCPs.includes(cp.id) ? "outline" : "default"}
                                className={cn(
                                  "flex items-center gap-1.5 sm:gap-2 w-full sm:w-[160px] h-7 sm:h-9 text-xs sm:text-sm",
                                  completedCPs.includes(cp.id) ? "border-green-500 text-green-600" : "bg-green-600 hover:bg-green-700"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCPCompletion(cp.id);
                                }}
                              >
                                {completedCPs.includes(cp.id) ? (
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
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No concept practices available</AlertTitle>
                <AlertDescription>
                  There are no concept practice exercises available for this topic yet.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 