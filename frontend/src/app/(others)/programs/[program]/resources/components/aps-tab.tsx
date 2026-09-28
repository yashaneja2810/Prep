"use client";

import { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Braces, HelpCircle, Terminal, FileCode, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { getAPsByTopicId, AP } from "@/lib/api/aps";
import { toast } from "sonner";

interface TabProps {
  topicId: string;
}

// Enhanced AP type for UI display
interface EnhancedAP extends AP {
  instructions: string[];
  learningObjectives: string[];
  description?: string;
  sampleInput?: string;
  expectedOutput?: string;
}

export function ApsTab({ topicId }: TabProps) {
  const [aps, setAps] = useState<EnhancedAP[]>([]);
  const [completedAPs, setCompletedAPs] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
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
        
        // Get APs using the API function
        const apData = await getAPsByTopicId(topicId);
        
        // Convert API response to enhanced format for UI display
        const enhancedAPs: EnhancedAP[] = apData.map((ap: AP) => ({
          ...ap,
          instructions: ap.instruction ? ap.instruction.split('\n').filter(Boolean) : [],
          learningObjectives: ap.objective ? ap.objective.split('\n').filter(Boolean) : [],
          description: (ap.objective ? ap.objective.split('\n')[0] : 'No description available'),
          sampleInput: ap.input || 'No sample input provided',
          expectedOutput: ap.expected_output || 'No expected output provided'
        }));
        
        setAps(enhancedAPs);
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
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  // Add responsive styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 952px) {
        .ap-container {
          padding-left: 1rem !important;
        }
        
        .ap-stats-container {
          flex-wrap: wrap !important;
          gap: 0.5rem !important;
        }
        
        .ap-stat-box {
          min-width: calc(50% - 0.25rem) !important;
          flex: 1 1 calc(50% - 0.25rem) !important;
        }
        
        .ap-progress-container {
          width: 100% !important;
          margin-left: 0 !important;
          margin-top: 0.5rem !important;
        }
      }
      
      @media (max-width: 640px) {
        .ap-container {
          padding-left: 0.5rem !important;
          padding-right: 0.5rem !important;
        }
        
        .ap-header-gradient {
          width: 4rem !important;
          height: 4rem !important;
        }
        
        .ap-stat-box {
          padding: 0.5rem !important;
        }
        
        .ap-item-content {
          padding: 0.75rem !important;
        }
        
        .ap-title {
          max-width: 180px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
      }
      
      @media (max-width: 480px) {
        .ap-item-content {
          padding: 0.5rem !important;
        }
        
        .ap-title {
          max-width: 120px !important;
        }
      }
      
      @media (max-width: 360px) {
        .ap-container {
          padding-left: 0.25rem !important;
          padding-right: 0.25rem !important;
        }
        
        .ap-title {
          max-width: 100px !important;
        }
        
        .ap-item-content {
          padding: 0.375rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Load completed APs, streak, and last study date from localStorage
  useEffect(() => {
    // Try to get completed APs from localStorage with topic-specific key
    const completedAPsKey = `completed-aps-${topicId}`;
    const savedCompletedAPs = localStorage.getItem(completedAPsKey);
    
    if (savedCompletedAPs) {
      setCompletedAPs(JSON.parse(savedCompletedAPs));
    } else {
      setCompletedAPs([]);
    }
    
    // These can stay user-agnostic as they're just for gamification
    const savedStreak = localStorage.getItem('ap-study-streak');
    const savedLastStudyDate = localStorage.getItem('ap-last-study-date');
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
    
    if (savedLastStudyDate) {
      setLastStudyDate(savedLastStudyDate);
    }
    
    // TODO: In the future, fetch completion data from server when API is ready
    /*
    const fetchCompletionData = async () => {
      try {
        const apCompletions = await getUserApCompletions();
        const completedIds = apCompletions
          .filter(completion => completion.ap_id)
          .map(completion => completion.ap_id);
            
        localStorage.setItem(completedAPsKey, JSON.stringify(completedIds));
        setCompletedAPs(completedIds);
      } catch (error) {
        console.error("Failed to fetch AP completion data:", error);
      }
    };
    fetchCompletionData();
    */
  }, [topicId]);
  
  // Update streak when user marks an AP as completed
  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (lastStudyDate !== today) {
      // If the last study date is yesterday, increment streak
      if (lastStudyDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        if (lastStudyDate === yesterdayString) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem('ap-study-streak', newStreak.toString());
        } else if (lastStudyDate !== today) {
          // If the last study date is not yesterday or today, reset streak
          setStreak(1);
          localStorage.setItem('ap-study-streak', '1');
        }
      } else {
        // First time studying
        setStreak(1);
        localStorage.setItem('ap-study-streak', '1');
      }
      
      // Update last study date
      setLastStudyDate(today);
      localStorage.setItem('ap-last-study-date', today);
    }
  };
  
  // Toggle completion status of an AP
  const toggleAPCompletion = async (apId: string, event: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      let updatedCompletedAPs: string[];
      const isCurrentlyCompleted = completedAPs.includes(apId);
      
      if (isCurrentlyCompleted) {
        // Remove from completed APs - only update local storage
        // APs don't have their own completion endpoint, so we just track them locally
        updatedCompletedAPs = completedAPs.filter(id => id !== apId);
        console.log("AP marked as not completed locally");
      } else {
        // Add to completed APs - only update local storage
        updatedCompletedAPs = [...completedAPs, apId];
        updateStreak();
        console.log("AP marked as completed locally");
      }
    
      // Update local state and localStorage
      setCompletedAPs(updatedCompletedAPs);
      localStorage.setItem(`completed-aps-${topicId}`, JSON.stringify(updatedCompletedAPs));
    } catch (error) {
      console.error(`Failed to ${completedAPs.includes(apId) ? 'remove' : 'mark'} AP completion:`, error);
      toast.error(`Failed to ${completedAPs.includes(apId) ? 'remove' : 'mark'} AP completion. Please try again.`);
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = aps.length > 0 
    ? Math.round((completedAPs.length / aps.length) * 100) 
    : 0;
  
  // Handle opening AP in a new tab
  const openAPDetails = (ap: EnhancedAP) => {
    // Store the selected AP in localStorage to access it in the new tab
    localStorage.setItem('selected-ap', JSON.stringify(ap));
    // Store the current topic ID for reference in the AP details page
    localStorage.setItem('current-topic-id', topicId);
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
            <div className="bg-card border rounded-lg mb-2 sm:mb-3 relative overflow-hidden shadow-sm w-full">
              <div className="absolute top-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-purple-200/50 dark:bg-purple-800/20 rounded-bl-full -mt-4 -mr-4"></div>
              <div className="p-2 sm:p-3 md:p-4 relative z-10">
                <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Braces className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-lg sm:text-xl font-bold">Application Practice (APs)</h2>
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
                  Apply your knowledge to solve real-world programming challenges
                </p>
                
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{completedAPs.length}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Completed</div>
                  </div>
                  
                  <div className="bg-muted rounded-md p-1.5 sm:p-2 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className="text-base sm:text-lg font-bold">{Math.max(aps.length - completedAPs.length, 0)}</div>
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
                      {completedAPs.length} of {aps.length} APs completed
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
            
            {/* AP List */}
            {aps.length > 0 ? (
              <div className="border rounded-md overflow-hidden shadow-sm w-full">
                <div className="divide-y w-full">
                  {aps.map((ap) => (
                    <div 
                      key={ap.id} 
                      className={cn(
                        "p-3 sm:p-3 cursor-pointer hover:bg-muted/50 transition-colors w-full",
                        completedAPs.includes(ap.id) ? "bg-purple-50/50 dark:bg-purple-900/10" : ""
                      )}
                      onClick={() => openAPDetails(ap)}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div 
                            className="cursor-pointer"
                            onClick={(e) => toggleAPCompletion(ap.id, e)}
                          >
                            {completedAPs.includes(ap.id) ? (
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="h-4 sm:h-5 w-4 sm:w-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"
                              >
                                <Check className="h-3 sm:h-4 w-3 sm:w-4" />
                              </motion.div>
                            ) : (
                              <div className="h-4 sm:h-5 w-4 sm:w-5 rounded-full border-2 border-muted-foreground/30 hover:border-purple-500 transition-colors">
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="text-purple-500 font-mono text-xs sm:text-sm">AP</span>
                              <span className="font-medium text-xs sm:text-sm line-clamp-1 ap-title">
                                {ap.title}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                          <Badge variant={
                            ap.difficulty === "Easy" ? "outline" : 
                            ap.difficulty === "Intermediate" ? "secondary" : "destructive"
                          } className={cn(
                            "text-[10px] sm:text-xs",
                            ap.difficulty === "Easy" ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" :
                            ap.difficulty === "Intermediate" ? "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400" :
                            "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                          )}>
                            {ap.difficulty || "Intermediate"}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-6 sm:h-8 w-6 sm:w-8">
                            <FileCode className="h-3 sm:h-4 w-3 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert>
                <Terminal className="h-4 w-4" />
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