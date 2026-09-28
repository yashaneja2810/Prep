"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, HelpCircle, Copy, Check, CheckCircle, Circle, Loader2, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient } from "@/lib/api/apiClient";
import { markCpCompleted, deleteCpCompletion, getUserCpCompletions } from "@/lib/api/completions";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

interface TabProps {
  topicId: string;
}

interface ConceptPractice {
  id: string;
  topic_id: string;
  title: string;
  difficulty: string;
  code: string;
  output: string;
  explanation: string;
  updated_at: string | null;
}

interface ApiResponse {
  data: ConceptPractice[];
  statusCode: number;
  success: boolean;
  message: string;
  timestamp: string;
}

export function CpsTab({ topicId }: TabProps) {
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
        const response = await apiClient.get<ApiResponse>(`/api/cps/topics/${topicId}`);
        
        if (response.data.success) {
          setCps(response.data.data || []);
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
  
  // Load completed CPs - directly from backend without checking for user ID
  useEffect(() => {
      // Fetch completion data from server using the new API
      const fetchCompletionData = async () => {
        try {
        console.log("Fetching CP completions from API...");
        const completions = await getUserCpCompletions();
        console.log("Received completions:", completions);
        console.log("Current CPs:", cps.map(cp => ({ id: cp.id, title: cp.title })));
          
          // Filter completions that match the current topic's CPs
          const serverCompletedCPs = completions
          .filter(completion => {
            const match = cps.some(cp => cp.id === completion.cp_id);
            console.log(`Checking completion ${completion.cp_id}: ${match ? 'MATCH' : 'NO MATCH'}`);
            return match;
          })
            .map(completion => completion.cp_id);
              
          setCompletedCPs(serverCompletedCPs);
        console.log("Filtered completions:", serverCompletedCPs);
        
        // Debug: Check if completions are being recognized
        if (serverCompletedCPs.length > 0) {
          console.log("Completed CPs found:", serverCompletedCPs);
          serverCompletedCPs.forEach(cpId => {
            const cp = cps.find(c => c.id === cpId);
            console.log(`CP ${cpId} - Title: ${cp?.title || 'Unknown'}`);
          });
        } else {
          console.log("No completed CPs found for this topic");
        }
        } catch (error) {
          console.error("Failed to fetch CP completion data:", error);
        // Don't try to use localStorage as fallback - if API fails, user is likely not authenticated
            setCompletedCPs([]);
        }
      };
      
    // Only fetch if we have CPs to check against
    if (cps.length > 0) {
      fetchCompletionData();
    }
  }, [topicId, cps]);
  
  // Debug: Log when completedCPs changes
  useEffect(() => {
    console.log("completedCPs updated:", completedCPs);
  }, [completedCPs]);
  
  // Debug: Log when a CP is rendered with completion status
  const isCompleted = (cpId: string) => {
    const completed = completedCPs.includes(cpId);
    console.log(`Checking if CP ${cpId} is completed: ${completed}`);
    return completed;
  };
  
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  const toggleCPCompletion = async (cpId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    let updatedCompletedCPs: string[];
    const isCurrentlyCompleted = completedCPs.includes(cpId);
    
    try {
      if (isCurrentlyCompleted) {
        // Remove from completed CPs - call the delete API
        console.log("Deleting CP completion:", cpId);
        await deleteCpCompletion({
          cp_id: cpId
        });
        console.log("CP completion removed from server");
        updatedCompletedCPs = completedCPs.filter(id => id !== cpId);
    } else {
        // Add to completed CPs - call the mark completed API
        console.log("Marking CP as completed:", cpId);
        await markCpCompleted({
          cp_id: cpId
        });
        console.log("CP marked as completed on server");
        updatedCompletedCPs = [...completedCPs, cpId];
    }
    
      // Update local state
      setCompletedCPs(updatedCompletedCPs);
    } catch (error) {
      console.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} CP completion:`, error);
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication') || 
          errorMessage.includes('not logged in') || errorMessage.includes('login required')) {
        toast.error("You need to be logged in to track progress");
      } else {
      toast.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} CP completion. Please try again.`);
      }
    }
  };
  
  // Calculate completion percentage
  const progressPercentage = cps.length > 0 
    ? Math.round((completedCPs.length / cps.length) * 100) 
    : 0;
  
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
            <div className="bg-card border rounded-lg mb-2 sm:mb-3 relative overflow-hidden shadow-sm w-full">
              <div className="absolute top-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-green-200/50 dark:bg-green-800/20 rounded-bl-full -mt-4 -mr-4"></div>
              <div className="p-2 sm:p-3 md:p-4 relative z-10">
                <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Terminal className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-lg sm:text-xl font-bold">Concept Practice (CPs)</h2>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1.5 h-6 sm:h-7 text-xs"
                    onClick={() => {
                      window.open("_blank");
                    }}
                  >
                    <HelpCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Know More</span>
                    <span className="inline sm:hidden">Help</span>
                  </Button>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  Practice applying concepts through code examples and exercises
                </p>
                
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{completedCPs.length}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Completed</div>
                  </div>
                  
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{Math.max(cps.length - completedCPs.length, 0)}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Incomplete</div>
                  </div>
                  
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{Math.min(Math.round(progressPercentage), 100)}%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Success Rate</div>
                  </div>
                  
                  <div className="flex-1 ml-0 sm:ml-2 mt-1 sm:mt-0 w-full sm:w-auto flex flex-col justify-center">
                    <div className="flex justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm font-medium">Progress</span>
                      <span className="text-xs sm:text-sm font-medium">{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-1.5 sm:h-2" />
                    <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      {completedCPs.length} of {cps.length} CPs completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="mb-2 sm:mb-3" />
            
            {error && (
              <Alert variant="destructive" className="mb-2">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          
            {/* CP List */}
            {cps.length > 0 ? (
              <div className="border rounded-md overflow-hidden shadow-sm w-full">
                <div className="divide-y w-full">
                  {cps.map((cp) => (
                    <div key={cp.id} className={cn(
                      "hover:bg-muted/50 transition-colors w-full",
                      isCompleted(cp.id) ? "bg-green-50/50 dark:bg-green-900/10" : ""
                    )}>
                      <div 
                        className="p-3 sm:p-3 cursor-pointer w-full"
                        onClick={() => {
                          setSelectedCP(selectedCP === cp.id ? null : cp.id);
                          // Scroll to the selected CP if it's being opened
                          if (selectedCP !== cp.id && contentRef.current) {
                            setTimeout(() => {
                              const element = document.getElementById(cp.id);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                              }
                            }, 100);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between w-full flex-wrap gap-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div 
                              className="cursor-pointer"
                              onClick={(e) => toggleCPCompletion(cp.id, e)}
                            >
                              {isCompleted(cp.id) ? (
                                <div
                                  className="h-4 sm:h-5 w-4 sm:w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600"
                                >
                                  <Check className="h-3 sm:h-4 w-3 sm:w-4" />
                                </div>
                              ) : (
                                <div className="h-4 sm:h-5 w-4 sm:w-5 rounded-full border-2 border-muted-foreground/30 hover:border-green-500 transition-colors">
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-green-500 font-mono text-xs sm:text-sm">CP</span>
                              <span className="font-medium text-xs sm:text-sm line-clamp-1">
                                {cp.title}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                            <Badge variant={
                              cp.difficulty?.toLowerCase() === "easy" ? "outline" : "secondary"
                            } className={cn(
                              "text-[10px] sm:text-xs",
                              cp.difficulty?.toLowerCase() === "easy" ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" : ""
                            )}>
                              {cp.difficulty || "Beginner"}
                            </Badge>
                            <ChevronDown className={`h-3.5 sm:h-4 w-3.5 sm:w-4 transition-transform ${selectedCP === cp.id ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </div>
                      
                      {selectedCP === cp.id && (
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4" id={cp.id}>
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
                                variant={isCompleted(cp.id) ? "outline" : "default"}
                                className={cn(
                                  "flex items-center gap-1.5 sm:gap-2 w-full sm:w-[160px] h-7 sm:h-9 text-xs sm:text-sm",
                                  isCompleted(cp.id) ? "border-green-500 text-green-600" : "bg-green-600 hover:bg-green-700"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCPCompletion(cp.id);
                                }}
                              >
                                {isCompleted(cp.id) ? (
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