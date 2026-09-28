"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Bookmark, CheckCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useProgramContext } from "../../layout";
import { markTopicCompleted, deleteTopicCompletion, getUserTopicCompletions } from "@/lib/api/completions";
import { toast } from "sonner";
import { useTopicCompletions, useCompletionsMutations } from "@/hooks/useCompletions";

// Define interfaces for API responses
interface TopicCompletion {
  id: string;
  user_id: string;
  topic_id: string;
  completed_at: string;
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface TabNavigationProps {
  activeTab: string;
  topicId: string;
}

// Tab data with fixed widths and routes
const tabData = [
  { id: "docs", label: "Docs", route: "docs" },
  { id: "notes", label: "Notes", route: "notes" },
  { id: "ppt", label: "PPT", route: "ppt" },
  { id: "videos", label: "Videos", route: "videos" },
  { id: "cps", label: "CPs", route: "cps" },
  { id: "aps", label: "APs", route: "aps" },
  { id: "objectives", label: "Objectives", route: "objectives" },
  { id: "outcome", label: "Outcome", route: "outcome" }
];

export function TabNavigation({ activeTab, topicId }: TabNavigationProps) {
  const router = useRouter();
  const { programId } = useProgramContext();
  const [isScrollView, setIsScrollView] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Use the completions hooks for better state management
  const { topicCompletions, isTopicCompleted, mutate: refreshTopicCompletions } = useTopicCompletions();
  const { markTopicComplete, unmarkTopicComplete, isSubmitting } = useCompletionsMutations();
  
  // Determine if the current topic is completed
  const isCompleted = useMemo(() => {
    return topicId ? isTopicCompleted(topicId) : false;
  }, [topicId, isTopicCompleted]);

  useEffect(() => {
    // Check screen size initially
    const checkScreenSize = () => {
      // Use 924px as the breakpoint for switching to scroll view
      setIsScrollView(window.innerWidth < 924);
      setIsSmallScreen(window.innerWidth < 640);
    };
    
    // Initial check
    checkScreenSize();
    
    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Check if topic is bookmarked
  useEffect(() => {
    if (!topicId || !programId) return;
    
    // Check if topic is bookmarked (bookmarks are still per browser)
    const bookmarkedTopics = JSON.parse(localStorage.getItem(`${programId}-bookmarked-topics`) || "[]");
    setIsBookmarked(bookmarkedTopics.includes(topicId));
    
  }, [topicId, programId]);

  // Toggle bookmark status
  const toggleBookmark = () => {
    if (!programId) return;
    
    const bookmarkedTopics = JSON.parse(localStorage.getItem(`${programId}-bookmarked-topics`) || "[]");
    
    if (isBookmarked) {
      // Remove from bookmarked topics
      const updatedTopics = bookmarkedTopics.filter((topic: string) => topic !== topicId);
      localStorage.setItem(`${programId}-bookmarked-topics`, JSON.stringify(updatedTopics));
      setIsBookmarked(false);
    } else {
      // Add to bookmarked topics
      bookmarkedTopics.push(topicId);
      localStorage.setItem(`${programId}-bookmarked-topics`, JSON.stringify(bookmarkedTopics));
      setIsBookmarked(true);
    }
  };
  
  // Toggle completion status using the hook
  const toggleCompletion = useCallback(async () => {
    if (!programId || !topicId) return;
    
    try {
      if (isCompleted) {
        await unmarkTopicComplete(topicId);
        toast.success("Topic marked as incomplete");
      } else {
        await markTopicComplete(topicId);
        toast.success("Topic marked as completed");
      }
      
      // Refresh completions data
      await refreshTopicCompletions();
      
      // Dispatch custom event to notify the sidebar
      const completedTopics = topicCompletions
        .filter(completion => completion.topic_id !== (isCompleted ? topicId : null))
        .map(completion => completion.topic_id);
        
      if (!isCompleted) {
        completedTopics.push(topicId);
      }
      
      window.dispatchEvent(new CustomEvent("topicCompletionChanged", {
        detail: { completedTopics }
      }));
      
    } catch (error) {
      console.error(`Failed to ${isCompleted ? 'remove' : 'mark'} topic completion:`, error);
      toast.error(`Failed to ${isCompleted ? 'remove' : 'mark'} topic completion. Please try again.`);
    }
  }, [programId, topicId, isCompleted, unmarkTopicComplete, markTopicComplete, refreshTopicCompletions, topicCompletions]);

  // Check if scroll buttons should be visible
  useEffect(() => {
    const checkScroll = () => {
      if (!tabsRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
    };
    
    // Initial check
    checkScroll();
    
    // Add event listener
    const tabsElement = tabsRef.current;
    if (tabsElement) {
      tabsElement.addEventListener('scroll', checkScroll);
    }
    
    // Cleanup
    return () => {
      if (tabsElement) {
        tabsElement.removeEventListener('scroll', checkScroll);
      }
    };
  }, [isScrollView]);

  // Automatically scroll active tab into view
  useEffect(() => {
    if (isScrollView && tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
      if (activeTabElement) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeTabRect = activeTabElement.getBoundingClientRect();
        
        // Check if the active tab is not fully visible
        if (activeTabRect.left < tabsRect.left || activeTabRect.right > tabsRect.right) {
          activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }
  }, [activeTab, isScrollView]);

  // Scroll functions
  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="w-full bg-background border-b relative">
      <div className="flex items-center justify-between w-full">
        <div className={cn(
          "flex-grow",
          isScrollView ? "w-[calc(100%-160px)]" : "w-[calc(100%-190px)]"
        )}>
          {/* Scroll buttons - show for all scroll view modes */}
          {isScrollView && (
            <>
              {showLeftScroll && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-background/80 shadow-sm"
                  onClick={scrollLeft}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              )}
              
              {showRightScroll && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-[160px] top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-background/80 shadow-sm"
                  onClick={scrollRight}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
          
          <div 
            ref={tabsRef}
            className={cn(
              "w-full h-12",
              isScrollView 
                ? "flex overflow-x-auto scrollbar-hide pl-6 sm:pl-8 pr-6 gap-1 sm:gap-2" 
                : "grid grid-cols-8 pl-6 sm:pl-8 pr-3 sm:pr-4"
            )}
          >
            {tabData.map((tab) => {
              // For small screens, abbreviate longer labels
              const displayLabel = isSmallScreen && tab.label.length > 4 
                ? tab.id === "objectives" 
                  ? "Obj." 
                  : tab.id === "outcome" 
                    ? "Out." 
                    : tab.label
                : tab.label;
              
              const isActive = activeTab === tab.id;
                
              return (
                <Link
                  key={tab.id}
                  href={`/programs/${programId}/resources/${topicId}/${tab.route}`}
                  data-tab-id={tab.id}
                  className={cn(
                    "group h-full flex items-center justify-center relative",
                    "rounded-none border-0",
                    "whitespace-nowrap text-sm font-medium",
                    "transition-all duration-200",
                    isScrollView 
                      ? "min-w-[80px] sm:min-w-[90px] flex-shrink-0 px-2 sm:px-3"
                      : "w-full"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center h-full relative",
                    isActive 
                      ? "text-primary font-semibold" 
                      : "text-muted-foreground hover:text-foreground/90"
                  )}>
                    <span className="inline-block">{displayLabel}</span>
                  </div>
                  
                  {/* Active indicator - solid underline */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-end pr-3 sm:pr-4 gap-1 sm:gap-2 h-12">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleBookmark}
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 rounded-full",
                    isBookmarked ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                  )}
                >
                  <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" fill={isBookmarked ? "currentColor" : "none"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center" className="text-xs">
                {isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant={isCompleted ? "default" : "outline"} 
            size="sm"
            onClick={toggleCompletion}
            disabled={isSubmitting}
            className={cn(
              "flex items-center gap-1 h-8 sm:h-9 rounded-md",
              isSmallScreen ? "w-auto px-2" : "w-[130px] justify-center",
              "text-sm font-medium",
              isCompleted ? "bg-green-600 hover:bg-green-700 border-0" : "border border-muted-foreground/30"
            )}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className={isSmallScreen ? "hidden sm:inline" : ""}>Completed</span>
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className={isSmallScreen ? "hidden sm:inline" : ""}>Mark Complete</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 