"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Circle, Terminal, Loader2, ChevronDown, ChevronRight, Trophy, HelpCircle } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { markOutcomeCompleted } from "@/lib/api/completions";
import { toast } from "sonner";

interface TabProps {
  topicId: string;
}

interface OutcomeItem {
  id: string;
  heading_id: string;
  text: string;
  order_index: number;
  updated_at: string;
}

interface OutcomeHeading {
  id: string;
  outcome_id: string;
  heading: string;
  order_index: number;
  updated_at: string;
  items: OutcomeItem[];
}

interface Outcome {
  id: string;
  topic_id: string;
  headings: OutcomeHeading[];
}

interface ApiResponse {
  data: Outcome[];
  statusCode: number;
  success: boolean;
  message: string;
  timestamp: string;
}

export function LearningOutcomeTab({ topicId }: TabProps) {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [completedOutcomes, setCompletedOutcomes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Fetch outcomes from API
  useEffect(() => {
    const fetchOutcomes = async () => {
      if (!topicId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<ApiResponse>(`/api/outcomes/topic/${topicId}`);
        
        if (response.data.success) {
          setOutcomes(response.data.data || []);
        } else {
          setError('Failed to load learning outcomes');
          setOutcomes([]);
        }
      } catch (err) {
        console.error('Error fetching learning outcomes:', err);
        setError('Failed to load learning outcomes');
        setOutcomes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOutcomes();
  }, [topicId]);
  
  // Flatten all outcome items for easier access
  const allItems = useMemo(() => {
    if (outcomes.length === 0) return [];
    return outcomes[0]?.headings.flatMap(h => h.items) || [];
  }, [outcomes]);
  
  // Group items into knowledge and skill outcomes
  const outcomeSections = useMemo(() => {
    if (outcomes.length === 0 || !outcomes[0]?.headings) return [];
    
    // Use the actual headings from the API response
    return outcomes[0].headings.map(heading => ({
      id: heading.id,
      title: heading.heading,
      items: heading.items || []
    }));
  }, [outcomes]);
  
  // Initialize all sections as expanded
  useEffect(() => {
    if (outcomeSections.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      outcomeSections.forEach(section => {
        initialExpanded[section.id] = true;
      });
      setExpandedSections(initialExpanded);
    }
  }, [outcomeSections]);

  // Load completed outcomes from localStorage
  useEffect(() => {
    const savedCompletedOutcomes = localStorage.getItem(`completed-outcomes-${topicId}`);
    if (savedCompletedOutcomes) {
      const parsed = JSON.parse(savedCompletedOutcomes);
      // Only include IDs that exist in the current outcomes
      const validCompleted = parsed.filter((id: string) => 
        allItems.some(item => item.id === id)
      );
      setCompletedOutcomes(validCompleted);
    }
  }, [topicId, allItems]);
  
  const toggleOutcome = async (outcomeItemId: string) => {
    // Auth is handled by backend
    let newCompletedOutcomes: string[];
    
    if (completedOutcomes.includes(outcomeItemId)) {
      newCompletedOutcomes = completedOutcomes.filter(id => id !== outcomeItemId);
    } else {
      newCompletedOutcomes = [...completedOutcomes, outcomeItemId];
      
      // Call the API to record outcome completion (no points)
      try {
        await markOutcomeCompleted({
          outcome_item_id: outcomeItemId
        });
        console.log("Outcome marked as completed on server");
      } catch (error) {
        console.error("Failed to mark outcome as completed on server:", error);
        toast.error("Failed to mark outcome as completed. Please try again.");
      }
    }
    
    setCompletedOutcomes(newCompletedOutcomes);
    localStorage.setItem(`completed-outcomes-${topicId}`, JSON.stringify(newCompletedOutcomes));
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Calculate completion percentage
  const totalOutcomes = allItems.length;
  const progressValue = totalOutcomes > 0 
    ? Math.round((completedOutcomes.length / totalOutcomes) * 100) 
    : 0;
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading learning outcomes...</p>
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
              <div className="absolute top-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-amber-200/50 dark:bg-amber-800/20 rounded-bl-full -mt-4 -mr-4"></div>
              <div className="p-2 sm:p-3 md:p-4 relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-lg sm:text-xl font-bold">Learning Outcomes</h2>
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
                  Skills and capabilities you should be able to demonstrate after completing this topic
                </p>
                
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{completedOutcomes.length}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Completed</div>
                  </div>
                  
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{Math.max(totalOutcomes - completedOutcomes.length, 0)}</div>
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
                      {completedOutcomes.length} of {totalOutcomes} outcomes completed
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
            
            {/* Outcomes by sections */}
            {outcomeSections.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {outcomeSections.map((section, index) => (
                  <Collapsible 
                    key={index} 
                    open={expandedSections[section.id]} 
                    onOpenChange={() => toggleSection(section.id)}
                    className="border rounded-md overflow-hidden"
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between bg-muted p-2 cursor-pointer hover:bg-muted/80 transition-colors">
                        <h3 className="font-medium text-sm">{section.title}</h3>
                        {expandedSections[section.id] ? (
                          <ChevronDown className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 sm:p-3">
                      <div className="space-y-0.5 sm:space-y-1 p-0">
                        {section.items.map((item) => (
                          <div 
                            key={item.id} 
                            className={cn(
                              "flex items-start gap-1.5 p-1 rounded-sm hover:bg-accent/30 transition-colors",
                              completedOutcomes.includes(item.id) && "bg-green-50/50 dark:bg-green-950/20"
                            )}
                          >
                            <div 
                              className="mt-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleOutcome(item.id);
                              }}
                            >
                              {completedOutcomes.includes(item.id) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="text-sm">
                              {item.text}
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
                <AlertTitle>No learning outcomes available</AlertTitle>
                <AlertDescription>
                  There are no learning outcomes available for this topic yet.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 