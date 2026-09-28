"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProgramContext } from "../../layout";
import { getModuleTopics } from "@/lib/api/modules";
import { ChevronDown, ChevronUp, BookOpen, Circle, Check, PanelLeftClose, PanelLeftOpen, ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTopicCompletions } from "@/hooks/useCompletions";

interface Module {
  id: string;
  module_title: string;
  module_name: string;
  topics: any[];
}

export function DynamicSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { program, programId } = useProgramContext();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // Use the completions hook for better state management
  const { topicCompletions, isLoading: isLoadingCompletions } = useTopicCompletions();
  
  // Toggle sidebar expanded state
  const toggleSidebar = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    localStorage.setItem(`${programId}-sidebar-expanded`, newState.toString());
    
    // Dispatch custom event to notify the layout about sidebar state change
    window.dispatchEvent(new CustomEvent("sidebarStateChanged", {
      detail: { expanded: newState }
    }));
  };
  
  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    if (!isSidebarExpanded) return;
    
    const newExpandedModules = new Set(expandedModules);
    if (newExpandedModules.has(moduleId)) {
      newExpandedModules.delete(moduleId);
    } else {
      newExpandedModules.add(moduleId);
    }
    setExpandedModules(newExpandedModules);
    
    // Save expanded topics to localStorage
    localStorage.setItem(`${programId}-expanded-topics`, JSON.stringify([...newExpandedModules]));
  };
  
  // Expand all modules
  const expandAll = () => {
    const allModules = new Set<string>();
    modules.forEach(module => {
      allModules.add(module.id);
    });
    setExpandedModules(allModules);
    
    // Save expanded topics to localStorage
    localStorage.setItem(`${programId}-expanded-topics`, JSON.stringify([...allModules]));
  };
  
  // Collapse all modules
  const collapseAll = () => {
    setExpandedModules(new Set());
    
    // Save expanded topics to localStorage
    localStorage.setItem(`${programId}-expanded-topics`, JSON.stringify([]));
  };

  // Fetch topics for the program
  useEffect(() => {
    const fetchTopicsForProgram = async () => {
      if (!program || !programId) return;
      
      try {
        setLoading(true);
        
        // Using program.modules from the context
        const programModules = program.modules ?? [];
        
        if (programModules.length > 0) {
          // For each module, fetch its topics
          const modulesWithTopics: Module[] = [];
          const newExpandedModules = new Set<string>();
          
          for (const module of programModules) {
            try {
              const moduleTopics = await getModuleTopics(module.id);
              
              // Extract topic objects and filter out any undefined ones
              const topicsForModule = moduleTopics
                .map(mt => mt.topic)
                .filter(Boolean);
              
              if (topicsForModule.length > 0) {
                modulesWithTopics.push({
                  id: module.id,
                  module_title: module.module_title,
                  module_name: module.module_name,
                  topics: topicsForModule
                });
                
                // Expand modules by default
                newExpandedModules.add(module.id);
              }
            } catch (moduleErr) {
              console.error(`Error fetching topics for module ${module.module_title}:`, moduleErr);
            }
          }
          
          setModules(modulesWithTopics);
          setExpandedModules(newExpandedModules);
        } else {
          setError('No modules found for this program.');
        }
      } catch (err) {
        console.error('Error fetching program data:', err);
        setError('Failed to load topics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopicsForProgram();
    
    // Load sidebar expanded state from localStorage
    const savedSidebarState = localStorage.getItem(`${programId}-sidebar-expanded`);
    if (savedSidebarState !== null) {
      setIsSidebarExpanded(savedSidebarState === "true");
    } else {
      // Default to expanded
      setIsSidebarExpanded(true);
      localStorage.setItem(`${programId}-sidebar-expanded`, "true");
    }
    
    // Also load expanded topics from localStorage if available
    const savedExpandedTopics = localStorage.getItem(`${programId}-expanded-topics`);
    if (savedExpandedTopics) {
      try {
        const parsedTopics = JSON.parse(savedExpandedTopics);
        if (Array.isArray(parsedTopics) && parsedTopics.length > 0) {
          setExpandedModules(new Set(parsedTopics));
        }
      } catch (error) {
        console.error("Error parsing saved expanded topics:", error);
      }
    }
  }, [program, programId]);
  
  // Listen for custom events from the TopicContent component
  const handleCompletionChange = useCallback((e: CustomEvent<{completedTopics: string[], userId?: string}>) => {
    const newCompletedTopics = e.detail.completedTopics;
    // Only update state if the values actually changed
    if (JSON.stringify(newCompletedTopics) !== JSON.stringify(completedTopics)) {
      setCompletedTopics(newCompletedTopics);
    }
  }, [completedTopics]);
  
  // Add event listeners for localStorage changes and custom events
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('topicCompletionChanged', handleCompletionChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('topicCompletionChanged', handleCompletionChange as EventListener);
    };
  }, [programId, handleCompletionChange]);
  
  // Handle localStorage changes for completions
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === `${programId}-completed-topics` && e.newValue) {
      setCompletedTopics(JSON.parse(e.newValue));
    }
  };
  
  // Set selected topic from URL or localStorage
  useEffect(() => {
    // Check URL for topic ID
    const pathSegments = pathname.split('/');
    const topicIndex = pathSegments.findIndex(segment => segment === 'resources') + 1;
    
    if (pathSegments[topicIndex] && pathSegments[topicIndex] !== '[topic]') {
      setSelectedTopic(pathSegments[topicIndex]);
      localStorage.setItem(`${programId}-selected-topic`, pathSegments[topicIndex]);
      localStorage.setItem(`${programId}-current-topic-id`, pathSegments[topicIndex]);
    } else {
      // If not in URL, check localStorage
      const savedTopic = localStorage.getItem(`${programId}-selected-topic`);
      if (savedTopic) {
        setSelectedTopic(savedTopic);
      }
    }
  }, [pathname, programId]);
  
  // Get the current active tab from the URL
  const getActiveTabFromURL = useCallback(() => {
    const pathSegments = pathname.split('/');
    // Find the index of 'resources'
    const resourcesIndex = pathSegments.findIndex(segment => segment === 'resources');
    
    // If we have a path like /programs/[programId]/resources/[topicId]/[tab]
    if (resourcesIndex >= 0 && pathSegments.length >= resourcesIndex + 3) {
      const potentialTab = pathSegments[resourcesIndex + 3];
      // Check if it's a valid tab name (not another topic ID)
      const validTabs = ['docs', 'notes', 'ppt', 'videos', 'cps', 'aps', 'objectives', 'outcome'];
      if (validTabs.includes(potentialTab)) {
        return potentialTab;
      }
    }
    return "docs"; // Default tab
  }, [pathname]);
  
  // Handle topic selection
  const handleTopicSelect = useCallback((topicId: string) => {
    setSelectedTopic(topicId);
    
    // Save to localStorage
    localStorage.setItem(`${programId}-selected-topic`, topicId);
    localStorage.setItem(`${programId}-current-topic-id`, topicId);
    
    // Dispatch custom event for other components
    const event = new CustomEvent('topicSelected', { 
      detail: { topic: topicId } 
    });
    window.dispatchEvent(event);
    
    // Navigate to topic resources with the current tab
    const currentTab = getActiveTabFromURL();
    router.push(`/programs/${programId}/resources/${topicId}/${currentTab}`);
  }, [programId, router, getActiveTabFromURL]);
  
  // Update completedTopics when topicCompletions changes
  useEffect(() => {
    if (!topicCompletions) return;
    
    const completedTopicIds = topicCompletions.map(completion => completion.topic_id);
    // Only update state if the values actually changed
    if (JSON.stringify(completedTopicIds) !== JSON.stringify(completedTopics)) {
      setCompletedTopics(completedTopicIds);
    }
  }, [topicCompletions]);
  
  return (
    <div 
      ref={sidebarRef} 
      className={cn(
        "h-full bg-accent/20 border-r flex flex-col overflow-hidden transition-all duration-300",
        isSidebarExpanded ? "w-56" : "w-12"
      )}
    >
      {/* Sidebar header with expand/collapse controls */}
      <div className="flex items-center justify-between px-3 py-3 border-b bg-background/80 flex-shrink-0 h-12">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={toggleSidebar}
          >
            {isSidebarExpanded ? <PanelLeftClose className="h-4.5 w-4.5" /> : <PanelLeftOpen className="h-4.5 w-4.5" />}
          </Button>
          {isSidebarExpanded && <span className="text-sm font-semibold">Modules</span>}
        </div>
        {isSidebarExpanded && (
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full" 
                    onClick={expandAll}
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs py-1">
                  Expand All
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full" 
                    onClick={collapseAll}
                  >
                    <ArrowUpToLine className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs py-1">
                  Collapse All
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      {/* Sidebar content with modules and topics */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-500">{error}</div>
        ) : modules.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No modules available.</div>
        ) : (
          <div className="py-2 px-4">
            {modules.map((module) => (
              <Collapsible
                key={module.id}
                open={expandedModules.has(module.id) && isSidebarExpanded}
                onOpenChange={() => isSidebarExpanded && toggleModule(module.id)}
                className="w-full"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger className={cn(
                        "flex items-center w-full px-0 py-1.5 text-xs transition-colors",
                        "hover:bg-accent/50 hover:text-accent-foreground",
                        !isSidebarExpanded && "justify-center",
                        "font-bold"
                      )}>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          {isSidebarExpanded && (
                            <span className="font-medium truncate max-w-[120px]" title={module.module_title}>
                              {module.module_title}
                            </span>
                          )}
                        </div>
                        {isSidebarExpanded && (
                          <div className="ml-auto">
                            {expandedModules.has(module.id) ? (
                              <ChevronUp className="h-3 w-3 opacity-70" />
                            ) : (
                              <ChevronDown className="h-3 w-3 opacity-70" />
                            )}
                          </div>
                        )}
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    {!isSidebarExpanded && (
                      <TooltipContent side="right" className="text-xs">
                        {module.module_title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                
                {isSidebarExpanded && (
                  <CollapsibleContent>
                    {module.topics && module.topics.length > 0 && (
                      <div className="pl-4 py-1 space-y-1">
                        {module.topics.map((topic) => (
                          <div
                            key={topic.id}
                            className={cn(
                              "flex items-center px-0 py-0.5 text-xs transition-colors",
                              "hover:bg-accent/30 hover:text-accent-foreground cursor-pointer rounded-sm",
                              "text-muted-foreground",
                              selectedTopic === topic.id ? 'bg-accent text-accent-foreground' : ''
                            )}
                            onClick={() => handleTopicSelect(topic.id)}
                          >
                            {completedTopics.includes(topic.id) ? (
                              <Check className="h-3 w-3 mr-1 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="h-3 w-3 mr-1 text-muted-foreground/40 flex-shrink-0" />
                            )}
                            <span className="truncate font-normal" title={topic.title}>
                              {topic.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                )}
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 