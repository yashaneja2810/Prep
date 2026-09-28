"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Circle, Terminal, Loader2, ChevronDown, ChevronRight, Trophy, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/apiClient";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { markObjectiveCompleted, deleteObjectiveCompletion } from "@/lib/api/completions";
import { toast } from "sonner";
import { getUserObjectiveCompletions } from "@/lib/api/completions";

interface TabProps {
  topicId: string;
}

interface ObjectiveItem {
  id: string;
  heading_id: string;
  text: string;
  order_index: number;
}

interface ObjectiveHeading {
  id: string;
  objective_id: string;
  heading: string;
  order_index: number;
  items: ObjectiveItem[];
}

interface Objective {
  id: string;
  topic_id: string;
  headings: ObjectiveHeading[];
}

interface ApiResponse {
  data: Objective[];
  statusCode: number;
  success: boolean;
  message: string;
}

export function LearningObjectivesTab({ topicId }: TabProps) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Fetch objectives from API
  useEffect(() => {
    const fetchObjectives = async () => {
      if (!topicId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<ApiResponse>(`/api/objectives/topic/${topicId}`);
        
        if (response.data.success) {
          setObjectives(response.data.data || []);
        } else {
          setError('Failed to load objectives');
          setObjectives([]);
        }
      } catch (err) {
        console.error('Error fetching objectives:', err);
        setError('Failed to load objectives');
        setObjectives([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchObjectives();
  }, [topicId]);

  // Flatten all objective items for easier access
  const allItems = useMemo(() => {
    if (objectives.length === 0) return [];
    return objectives[0]?.headings.flatMap(h => h.items) || [];
  }, [objectives]);
  
  // Group items into knowledge and skill objectives
  const objectiveSections = useMemo(() => {
    if (objectives.length === 0 || !objectives[0]?.headings) return [];
    
    // Use the actual headings from the API response
    return objectives[0].headings.map(heading => ({
      id: heading.id,
      title: heading.heading,
      items: heading.items || []
    }));
  }, [objectives]);
  
  // Initialize all sections as expanded
  useEffect(() => {
    if (objectiveSections.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      objectiveSections.forEach(section => {
        initialExpanded[section.id] = true;
      });
      setExpandedSections(initialExpanded);
    }
  }, [objectiveSections]);
  
  // Load completed objectives - directly from backend
  useEffect(() => {
    // Only fetch if we have items to check against
    if (allItems.length === 0) return;
    
      // Fetch completion data from server using the new API
      const fetchCompletionData = async () => {
        try {
        console.log("Fetching objective completions from API...");
        const completions = await getUserObjectiveCompletions();
        console.log("Received objective completions:", completions);
          
            // Filter completions that match the current topic's objectives
        const serverCompletedObjectives = completions
          .filter(completion => {
            const match = allItems.some(item => item.id === completion.objective_item_id);
            console.log(`Checking objective completion ${completion.objective_item_id}: ${match ? 'MATCH' : 'NO MATCH'}`);
            return match;
          })
              .map(completion => completion.objective_item_id);
              
            setCompletedObjectives(serverCompletedObjectives);
        console.log("Filtered objective completions:", serverCompletedObjectives);
        } catch (error) {
          console.error("Failed to fetch objective completion data:", error);
            setCompletedObjectives([]);
        }
      };
      
      fetchCompletionData();
  }, [topicId, allItems]);
  
  // Debug: Log when completedObjectives changes
  useEffect(() => {
    console.log("completedObjectives updated:", completedObjectives);
  }, [completedObjectives]);
  
  const isCompleted = (objectiveItemId: string) => {
    const completed = completedObjectives.includes(objectiveItemId);
    return completed;
  };
  
  const toggleObjective = async (objectiveItemId: string) => {
    let newCompletedObjectives: string[];
    const isCurrentlyCompleted = isCompleted(objectiveItemId);
    
    try {
      if (isCurrentlyCompleted) {
        // Remove from completed objectives - call the delete API
        console.log("Deleting objective completion:", objectiveItemId);
        await deleteObjectiveCompletion({
          objective_item_id: objectiveItemId
        });
        console.log("Objective completion removed from server");
      newCompletedObjectives = completedObjectives.filter(id => id !== objectiveItemId);
    } else {
        // Add to completed objectives - call the mark completed API
        console.log("Marking objective as completed:", objectiveItemId);
        await markObjectiveCompleted({
          objective_item_id: objectiveItemId
        });
        console.log("Objective marked as completed on server");
      newCompletedObjectives = [...completedObjectives, objectiveItemId];
    }
    
      // Update local state
    setCompletedObjectives(newCompletedObjectives);
    } catch (error) {
      console.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} objective completion:`, error);
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication') || 
          errorMessage.includes('not logged in') || errorMessage.includes('login required')) {
        toast.error("You need to be logged in to track progress");
      } else {
      toast.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} objective completion. Please try again.`);
      }
    }
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Calculate completion percentage
  const totalObjectives = allItems.length;
  const progressValue = totalObjectives > 0 
    ? Math.round((completedObjectives.length / totalObjectives) * 100) 
    : 0;
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading learning objectives...</p>
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
            <div className="bg-card border rounded-lg mb-2 sm:mb-3 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-green-200/50 dark:bg-green-800/20 rounded-bl-full -mt-4 -mr-4"></div>
              <div className="p-2 sm:p-3 md:p-4 relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-lg sm:text-xl font-bold">Learning Objectives</h2>
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
                  What you'll learn in this topic
                </p>
                
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{completedObjectives.length}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Completed</div>
                  </div>
                  
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{Math.max(totalObjectives - completedObjectives.length, 0)}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Incomplete</div>
                  </div>
                  
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{progressValue}%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Success Rate</div>
                  </div>
                  
                  <div className="flex-1 ml-0 sm:ml-2 mt-1 sm:mt-0 w-full sm:w-auto flex flex-col justify-center">
                    <div className="flex justify-between mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm font-medium">Progress</span>
                      <span className="text-xs sm:text-sm font-medium">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-1.5 sm:h-2" />
                    <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      {completedObjectives.length} of {totalObjectives} objectives completed
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
            
            {/* Objectives by sections */}
            {objectiveSections.length > 0 ? (
              <div className="space-y-2">
                {objectiveSections.map((section, index) => (
                  <Collapsible 
                    key={index} 
                    open={expandedSections[section.id]} 
                    onOpenChange={() => toggleSection(section.id)}
                    className="border rounded-md overflow-hidden"
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between bg-muted p-1.5 sm:p-2 cursor-pointer hover:bg-muted/80 transition-colors">
                        <h3 className="font-medium text-sm">{section.title}</h3>
                        {expandedSections[section.id] ? (
                          <ChevronDown className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="space-y-0.5 p-1 sm:p-1.5">
                        {section.items.map((item) => (
                          <div 
                            key={item.id} 
                            className={cn(
                              "flex items-start gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-md cursor-pointer transition-all",
                              isCompleted(item.id) ? "bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30" : 
                                "hover:bg-muted/50 border border-transparent"
                            )}
                            onClick={() => toggleObjective(item.id)}
                          >
                            <div className="relative mt-0.5">
                              {isCompleted(item.id) ? (
                                <CheckCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-green-500" />
                              ) : (
                                <Circle className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground/70" />
                              )}
                            </div>
                            
                            <div className="text-sm flex-1">
                              <div className="flex items-center justify-between">
                                <span 
                                  className={cn(
                                    isCompleted(item.id) && "text-muted-foreground"
                                  )}
                                >
                                  {item.text}
                                </span>
                                {isCompleted(item.id) && (
                                  <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 ml-1 whitespace-nowrap">
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No learning objectives available</AlertTitle>
                <AlertDescription>
                  There are no learning objectives available for this topic yet.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 