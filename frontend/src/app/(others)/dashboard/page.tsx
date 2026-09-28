"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ChevronRight, Award, BookOpen, BarChart, Activity, Info, Trophy, Star, Lock } from "lucide-react";
import Link from "next/link";
// Removed useAuthStore import
import {
  getAllPrograms,
  getPublishedPrograms,
  getPublishedProgramsCounts,
  Program,
  getProgramModules
} from "@/lib/api/programs";
import {
  getUserTopicCompletions, 
  getUserCpCompletions, 
  getUserObjectiveCompletions,
  TopicCompletion,
  CpCompletion,
  ObjectiveCompletion
} from "@/lib/api/completions";
import { getAPsByTopicId, getAllAPs, AP } from "@/lib/api/aps";
import { getCPsByTopicId, getAllCPs, CP } from "@/lib/api/cps";
import { getUserPointsBreakdown } from "@/lib/api/points";
import { getUserApSubmissions, ApSubmission } from "@/lib/api/submissions";
import { Module as ModuleType, ModuleTopic, isModuleCompleted, getModuleTopics } from "@/lib/api/modules";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

// Define program level colors
const PROGRAM_LEVEL_COLORS: Record<string, string> = {
  "Foundation": "from-blue-500 to-blue-600",
  "Intermediate": "from-purple-500 to-purple-600",
  "Advanced": "from-amber-500 to-amber-600",
  "Expert": "from-pink-500 to-pink-600",
  "default": "from-emerald-500 to-emerald-600"
};

// Define types for submissions
interface DashboardApSubmission {
  id: string;
  ap_id: string;
  status?: string;
  score?: number;
  submitted_at?: string;
  is_correct?: boolean; // Added is_correct
}

interface Topic {
  id: string;
  title: string;
  description?: string;
  [key: string]: any;
}

interface Module {
  id: string;
  module_code: string;
  module_title: string;
  module_name: string;
  description?: string;
  topics?: Topic[];
  [key: string]: any;
}

type ProgramWithModules = Program & {
  modules?: ModuleType[];
};

export default function DashboardPage() {
  // Removed user from auth store
  
  // State for data
  const [programs, setPrograms] = useState<ProgramWithModules[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [topicCompletions, setTopicCompletions] = useState<TopicCompletion[]>([]);
  const [cpCompletions, setCpCompletions] = useState<CpCompletion[]>([]);
  const [objectiveCompletions, setObjectiveCompletions] = useState<ObjectiveCompletion[]>([]);
  const [apTasks, setApTasks] = useState({ completed: 0, remaining: 0 });
  const [cpTasks, setCpTasks] = useState({ completed: 0, remaining: 0 });
  const [courseProgress, setCourseProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState<any>(null);
  const [apSubmissions, setApSubmissions] = useState<DashboardApSubmission[]>([]);
  
  // For task completion streak
  const [activeStreakTab, setActiveStreakTab] = useState<'overall' | 'cp' | 'ap'>('overall');
  
  // Raw counts - the actual number of completions per day
  const [rawCpCounts, setRawCpCounts] = useState<Record<string, number>>({});
  const [rawApCounts, setRawApCounts] = useState<Record<string, number>>({});
  const [rawOverallCounts, setRawOverallCounts] = useState<Record<string, number>>({});
  
  // Activity levels for coloring (0-4)
  const [activityLevels, setActivityLevels] = useState<Record<string, number>>(() => {
    // Set all days to "no completion" (level 0)
    const levels: Record<string, number> = {};
    const today = new Date();
    
    // Set all days in the last 365 days to level 0 (no completion)
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Format as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];

      // Set to no completion
      levels[formattedDate] = 0;
    }
    
    return levels;
  });

  // Separate activity levels for CP and AP
  const [cpActivityLevels, setCpActivityLevels] = useState<Record<string, number>>(() => {
    // Set all days to "no completion" (level 0)
    const levels: Record<string, number> = {};
    const today = new Date();
    
    // Set all days in the last 365 days to level 0 (no completion)
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Format as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];

      // Set to no completion
      levels[formattedDate] = 0;
    }
    
    return levels;
  });

  const [apActivityLevels, setApActivityLevels] = useState<Record<string, number>>(() => {
    // Set all days to "no completion" (level 0)
    const levels: Record<string, number> = {};
    const today = new Date();
    
    // Set all days in the last 365 days to level 0 (no completion)
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Format as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];

      // Set to no completion
      levels[formattedDate] = 0;
    }
    
    return levels;
  });
  
  // State for module details dialog
  const [selectedModuleDetails, setSelectedModuleDetails] = useState<{
    programTitle: string;
    programId: string;
    module: ModuleType | null;
    isOpen: boolean;
    viewAllModules: boolean;
  }>({
    programTitle: "",
    programId: "",
    module: null,
    isOpen: false,
    viewAllModules: false
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Removed user check since we're using cookies now
      
      try {
        setIsLoading(true);
        console.log("Starting to fetch dashboard data");
        
        // Fetch programs
        const programsData = await getPublishedPrograms();
        
        // Fetch user completions first
        const topicCompletionsData = await getUserTopicCompletions();
        const cpCompletionsData = await getUserCpCompletions();
        const objectiveCompletionsData = await getUserObjectiveCompletions();
        
        // Store completions in state
        setTopicCompletions(topicCompletionsData);
        setCpCompletions(cpCompletionsData);
        setObjectiveCompletions(objectiveCompletionsData);
  
        // Fetch modules for each program with topics
        const programsWithModules = await Promise.all(
          programsData.map(async (program) => {
            try {
              // Get modules for this program
              const modules = await getProgramModules(program.id);
              
              // For each module, fetch its topics
              const modulesWithTopics = await Promise.all(
                modules.map(async (module) => {
                  try {
                    // If module already has topics, use them
                    if (module.topics && module.topics.length > 0) {
                      return module;
                    }
                    
                    // Otherwise fetch topics
                    const topics = await getModuleTopics(module.id);
                    console.log(`Fetched ${topics.length} topics for module ${module.module_title}`);
                    
                    return {
                      ...module,
                      topics
                    };
                  } catch (error) {
                    console.error(`Failed to fetch topics for module ${module.id}:`, error);
                    return module;
                  }
                })
              );
              
              return {
                ...program,
                modules: modulesWithTopics
              } as ProgramWithModules;
            } catch (error) {
              console.error(`Failed to fetch modules for program ${program.id}:`, error);
              return {
                ...program,
                modules: []
              } as ProgramWithModules;
            }
          })
        );
        
        setPrograms(programsWithModules);
        console.log("Programs with modules and topics:", programsWithModules);
        
        // Set default selected program if available
        if (programsWithModules.length > 0 && !selectedProgram) {
          setSelectedProgram(programsWithModules[0].id);
        }
        
        // Fetch user points
        try {
          const pointsResponse = await getUserPointsBreakdown();
          setPoints(pointsResponse);
          console.log("Points data:", pointsResponse);
        } catch (err) {
          console.warn("Failed to fetch points data:", err);
          setPoints({ total: 0, breakdown: {} });
        }
        
        // Fetch AP submissions
        let submissionsData: DashboardApSubmission[] = [];
        try {
          const submissionsResponse = await getUserApSubmissions();
          submissionsData = submissionsResponse;
          setApSubmissions(submissionsData);
          console.log("AP submissions:", submissionsData);
        } catch (err) {
          console.warn("Failed to fetch AP submissions:", err);
          setApSubmissions([]);
        }
        
        // Get AP and CP counts from the new endpoint
        try {
          const programCountsResponse = await getPublishedProgramsCounts();
          console.log("Program counts:", programCountsResponse);
          
          const totalAPs = programCountsResponse.ap_count;
          const totalCPs = programCountsResponse.cp_count;
          
          // Count completed APs from submissions
          const completedAPs = submissionsData.filter(sub => 
            (sub.status === "ACCEPTED") || (sub.is_correct)
          ).length;
          
          // Count completed CPs directly from completions data
          const completedCPs = cpCompletionsData.length;
          
          console.log("Final AP counts - Total:", totalAPs, "Completed:", completedAPs);
          console.log("Final CP counts - Total:", totalCPs, "Completed:", completedCPs);

          // Set task counts
          setApTasks({
            completed: completedAPs,
            remaining: Math.max(0, totalAPs - completedAPs)
          });
          
          setCpTasks({
            completed: completedCPs,
            remaining: Math.max(0, totalCPs - completedCPs)
          });
          
          // Calculate overall progress
          const totalTasks = totalAPs + totalCPs;
          const completedTasks = completedAPs + completedCPs;
          setCourseProgress(totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
          
        } catch (error) {
          console.error("Failed to fetch program counts:", error);
          
          // Fallback to the old method
          console.warn("Falling back to manual AP and CP counting");
          
          // Get all APs
          let totalAPs = 0;
          try {
            const allAPsResponse = await getAllAPs();
            if (allAPsResponse) {
              totalAPs = allAPsResponse.length;
            }
          } catch (error) {
            console.error("Failed to fetch all APs:", error);
          }
          
          // Get all CPs
          let totalCPs = 0;
          try {
            const allCPsResponse = await getAllCPs();
            if (allCPsResponse) {
              totalCPs = allCPsResponse.length;
            }
          } catch (error) {
            console.error("Failed to fetch all CPs:", error);
          }
          
          // Count completed APs from submissions
          const completedAPs = submissionsData.filter(sub => 
            (sub.status === "ACCEPTED") || (sub.is_correct)
          ).length;
          
          // Count completed CPs directly from completions data
          const completedCPs = cpCompletionsData.length;
          
          // Set task counts
          setApTasks({
            completed: completedAPs,
            remaining: Math.max(0, totalAPs - completedAPs)
          });
          
          setCpTasks({
            completed: completedCPs,
            remaining: Math.max(0, totalCPs - completedCPs)
          });
          
          // Calculate overall progress
          const totalTasks = totalAPs + totalCPs;
          const completedTasks = completedAPs + completedCPs;
          setCourseProgress(totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
        }
        
        // Initialize raw counts
        const newRawCpCounts: Record<string, number> = {};
        const newRawApCounts: Record<string, number> = {};
        const newRawOverallCounts: Record<string, number> = {};
        
        // Generate activity levels based on completion dates
        const newActivityLevels = { ...activityLevels };
        const newCpActivityLevels = { ...cpActivityLevels };
        const newApActivityLevels = { ...apActivityLevels };

        // First, collect raw counts for each CP completion
        cpCompletionsData.forEach(completion => {
          // Extract just the date part (YYYY-MM-DD) directly from the string
          // This avoids timezone issues completely
          const datePart = completion.completed_at.split('T')[0];
          
          // Update raw counts using the exact date from the API
          newRawCpCounts[datePart] = (newRawCpCounts[datePart] || 0) + 1;
          newRawOverallCounts[datePart] = (newRawOverallCounts[datePart] || 0) + 1;
          
          // For activity levels (coloring), we still need a consistent approach
          // but we'll use the same direct string extraction
          newCpActivityLevels[datePart] = (newCpActivityLevels[datePart] || 0) + 1;
          newActivityLevels[datePart] = (newActivityLevels[datePart] || 0) + 1;
        });

        // Next, collect raw counts for each AP submission
        submissionsData.forEach(submission => {
          if (submission.submitted_at) {
            // Extract just the date part (YYYY-MM-DD) directly from the string
            const datePart = submission.submitted_at.split('T')[0];
            
            // Update raw counts using the exact date from the API
            newRawApCounts[datePart] = (newRawApCounts[datePart] || 0) + 1;
            newRawOverallCounts[datePart] = (newRawOverallCounts[datePart] || 0) + 1;
            
            // For activity levels (coloring)
            newApActivityLevels[datePart] = (newApActivityLevels[datePart] || 0) + 1;
            newActivityLevels[datePart] = (newActivityLevels[datePart] || 0) + 1;
          }
        });

        // Topic completions only contribute to overall counts
        topicCompletionsData.forEach(completion => {
          // Extract just the date part (YYYY-MM-DD) directly from the string
          const datePart = completion.completed_at.split('T')[0];
          
          newActivityLevels[datePart] = (newActivityLevels[datePart] || 0) + 1;
          newRawOverallCounts[datePart] = (newRawOverallCounts[datePart] || 0) + 1;
        });

        // Find maximum activity counts for relative scaling
        const maxOverallActivity = Math.max(1, ...Object.values(newActivityLevels));
        const maxCpActivity = Math.max(1, ...Object.values(newCpActivityLevels));
        const maxApActivity = Math.max(1, ...Object.values(newApActivityLevels));
        
        console.log("Max activity levels - Overall:", maxOverallActivity, "CP:", maxCpActivity, "AP:", maxApActivity);
        
        // Helper function to normalize activity levels with relative scaling (0-4 levels)
        const normalizeActivityLevels = (levels: Record<string, number>, maxActivity: number) => {
          const result = { ...levels };
          Object.keys(result).forEach(date => {
            if (result[date] === 0) {
              // Keep 0 as is (gray)
              return;
            }
            
            // Calculate relative level (1-4) based on percentage of max
            const percentage = result[date] / maxActivity;
            
            if (percentage <= 0.25) {
              result[date] = 1; // Light green (1-25% of max)
            } else if (percentage <= 0.5) {
              result[date] = 2; // Medium-light green (26-50% of max)
            } else if (percentage <= 0.75) {
              result[date] = 3; // Medium-dark green (51-75% of max)
            } else {
              result[date] = 4; // Darkest green (76-100% of max)
            }
          });
          return result;
        };

        // Apply relative scaling to all activity levels (for coloring)
        const normalizedOverallLevels = normalizeActivityLevels(newActivityLevels, maxOverallActivity);
        const normalizedCpLevels = normalizeActivityLevels(newCpActivityLevels, maxCpActivity);
        const normalizedApLevels = normalizeActivityLevels(newApActivityLevels, maxApActivity);

        // Store normalized levels for coloring
        setActivityLevels(normalizedOverallLevels);
        setCpActivityLevels(normalizedCpLevels);
        setApActivityLevels(normalizedApLevels);
        
        // Store raw counts for tooltips
        setRawCpCounts(newRawCpCounts);
        setRawApCounts(newRawApCounts);
        setRawOverallCounts(newRawOverallCounts);
        
        console.log("Raw CP counts:", newRawCpCounts);
        console.log("Raw AP counts:", newRawApCounts);
        console.log("Raw overall counts:", newRawOverallCounts);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []); // Removed user dependency
  
  // Function to generate the day grid for the GitHub-style contribution chart
  const generateDayGrid = () => {
    // For cell coloring - use normalized activity level
    const currentActivityLevels = activeStreakTab === 'cp' 
      ? cpActivityLevels 
      : activeStreakTab === 'ap' 
        ? apActivityLevels 
        : activityLevels;

    // For tooltips - use raw counts
    const currentRawCounts = activeStreakTab === 'cp' 
      ? rawCpCounts 
      : activeStreakTab === 'ap' 
        ? rawApCounts 
        : rawOverallCounts;

    const today = new Date();
    const weeks: JSX.Element[][] = [];
    const monthLabelsMap: Record<number, string> = {};
    
    // Generate data for the last 52 weeks (1 year)
    for (let week = 0; week < 52; week++) {
      const weekDays: JSX.Element[] = [];
      
      for (let day = 0; day < 7; day++) {
        // Calculate date by subtracting days from today
        // Start from the end of the week (Saturday) and go backwards
        const date = new Date(today);
        date.setDate(today.getDate() - ((52 - week - 1) * 7 + (6 - day)));
        
        // Skip future dates
        if (date > today) {
          weekDays.push(
            <div 
              key={`empty-${week}-${day}`} 
              className="w-[18px] h-[18px] opacity-0"
            />
          );
          continue;
        }
        
        // Format date as YYYY-MM-DD for lookup - using a consistent method
        // that matches how we stored the data
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayOfMonth = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayOfMonth}`;
        
        // Get activity level for this date (0, 1, 2, 3, or 4)
        const activityLevel = currentActivityLevels[dateStr] || 0;
        
        // Get color based on activity level (consistent green shades)
        const getColorClass = (level: number) => {
          switch (level) {
            case 0: return 'bg-gray-700'; // No activity
            case 1: return 'bg-green-900'; // Light green (1-25%)
            case 2: return 'bg-green-700'; // Medium-light green (26-50%)
            case 3: return 'bg-green-500'; // Medium-dark green (51-75%)
            case 4: return 'bg-green-300'; // Darkest green (76-100%)
            default: return 'bg-gray-700';
          }
        };
        
        // Get description based on activity level
        const getActivityDescription = (level: number) => {
          switch (level) {
            case 0: return 'No completion';
            case 1: return 'Low activity (1-25% of max)';
            case 2: return 'Medium activity (26-50% of max)';
            case 3: return 'High activity (51-75% of max)';
            case 4: return 'Highest activity (76-100% of max)';
            default: return 'No completion';
          }
        };
        
        // Create the day element with appropriate class based on activity level
        const dayElement = (
          <div 
            key={dateStr} 
            className={`
              w-[18px] h-[18px] rounded-sm transform transition-transform hover:scale-110
              ${getColorClass(activityLevel)}
            `}
            title={`${format(date, 'MMM d, yyyy')}: ${getActivityDescription(activityLevel)} (${currentRawCounts[dateStr] || 0} ${activeStreakTab === 'cp' ? 'CP' : activeStreakTab === 'ap' ? 'AP' : 'task'}${(currentRawCounts[dateStr] || 0) === 1 ? '' : 's'} completed)`}
          />
        );
        
        weekDays.push(dayElement);
        
        // Track first day of each month for labels
        if (date.getDate() === 1) {
          const month = format(date, 'MMM');
          monthLabelsMap[week] = month;
        }
      }
      
      weeks.push(weekDays);
    }
    
    // Generate month labels JSX - spaced evenly
    const monthLabels: JSX.Element[] = [];
    
    // Get all month positions
    const positions = Object.keys(monthLabelsMap).map(pos => parseInt(pos));
    
    // Select a subset of positions to avoid overcrowding
    const selectedPositions: number[] = [];
    if (positions.length > 0) {
      selectedPositions.push(positions[0]); // Always include the first month
      
      // Add more months with spacing
      let lastAdded = positions[0];
      for (let i = 1; i < positions.length; i++) {
        if (positions[i] - lastAdded >= 4) { // Ensure at least 4 weeks spacing
          selectedPositions.push(positions[i]);
          lastAdded = positions[i];
        }
      }
    }
    
    // Create labels for selected positions
    selectedPositions.forEach(pos => {
      monthLabels.push(
        <div 
          key={`month-${pos}`} 
          className="inline-block text-center"
          style={{ 
            position: 'absolute',
            left: `${pos * 20 + 2}px`, // Adjusted for wider cells
          }}
        >
          {monthLabelsMap[pos]}
        </div>
      );
    });
    
    return { weekGrids: weeks, monthLabels };
  };

  // Weekday labels - short form
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate the day grid and month labels
  const { weekGrids, monthLabels } = generateDayGrid();
  
  // Get program icon

  
  // Get program color based on level
  const getProgramColor = (level: string) => {
    return PROGRAM_LEVEL_COLORS[level] || PROGRAM_LEVEL_COLORS.default;
  };
  
  // Calculate program progress
  const calculateProgramProgress = (programId: string) => {
    // Get program modules
    const program = programs.find(p => p.id === programId);
    if (!program?.modules) {
      return 0;
    }

    // Count total and completed modules
    const totalModules = program.modules.length;
    if (totalModules === 0) return 0;

    // Count completed modules using the helper function
    const completedModules = program.modules.filter(module => 
      isModuleCompleted(module, topicCompletions)
    ).length;

    return Math.round((completedModules / totalModules) * 100);
  };
  
  // Get module counts for a program
  const getModuleCounts = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program?.modules) {
      return { total: 0, completed: 0 };
    }

    const totalModules = program.modules.length;
    const completedModules = program.modules.filter(module => 
      isModuleCompleted(module, topicCompletions)
    ).length;

    return {
      total: totalModules,
      completed: completedModules
    };
  };
  
  // Check if program is completed
  const isProgramCompleted = (programId: string) => {
    const progress = calculateProgramProgress(programId);
    return progress === 100;
  };
  
  // Format last accessed time
  const formatLastAccessed = (program: Program) => {
    // In a real application, you would use the actual last accessed timestamp from the program
    // For now, we'll generate a random time between 1 minute and 7 days ago
    const now = new Date();
    const randomMinutes = Math.floor(Math.random() * 10080) + 1; // Between 1 minute and 7 days (10080 minutes)
    const lastAccessed = new Date(now.getTime() - randomMinutes * 60000);
    
    const minutesAgo = Math.floor((now.getTime() - lastAccessed.getTime()) / 60000);
    
    if (minutesAgo < 60) {
      return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
    } else if (minutesAgo < 1440) { // Less than 24 hours
      const hoursAgo = Math.floor(minutesAgo / 60);
      return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
    } else {
      const daysAgo = Math.floor(minutesAgo / 1440);
      return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
    }
  };
  
  // Function to open module details dialog
  const openModuleDetails = (programTitle: string, programId: string, module: ModuleType, viewAllModules: boolean = false) => {
    setSelectedModuleDetails({
      programTitle,
      programId,
      module,
      isOpen: true,
      viewAllModules
    });
  };
  
  // Function to close module details dialog
  const closeModuleDetails = () => {
    setSelectedModuleDetails(prev => ({
      ...prev,
      isOpen: false
    }));
  };
  
  return (
    <div className="w-full p-6 bg-background min-h-screen">
      {/* Navigation Tabs with Points */}
      <div className="flex items-center justify-between mb-8">
        <div className="grid grid-cols-2 gap-2 flex-1 max-w-md">
          <Link href="/dashboard" className="bg-amber-500 text-white rounded-lg py-3 text-center font-medium shadow-md hover:shadow-lg transition-all">
            Dashboard
          </Link>
          <Link href="/dashboard/learning" className={`rounded-lg py-3 text-center font-medium shadow-sm border transition-all ${
            isLoading ? "bg-gray-100 text-gray-400 border-gray-200" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}>
            Learning
          </Link>
            </div>
        
        {!isLoading && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Your Points</div>
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
              <Award className="h-4 w-4 text-amber-500" />
              <span className="font-bold text-amber-700 dark:text-amber-400">{points?.total || 0}</span>
            </div>
          </div>
        )}
                </div>
      
      {/* Progress Section */}
      <div className="mb-8 bg-card p-6 rounded-xl shadow-sm border border-border relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Overall Progress
            </h3>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1">
              {courseProgress}% Complete
                  </Badge>
                </div>
          <Progress value={courseProgress} className="h-3 bg-gray-100">
            <div className="h-full bg-amber-500 rounded-full"></div>
          </Progress>
                </div>
                </div>
      
      {/* Task Completion Streak */}
      <div className="mb-8 bg-gray-900 p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="relative">
            <style jsx>{`
              .contribution-chart {
                width: 100%;
                overflow-x: hidden;
              }
              
              .month-labels {
                padding-left: 30px;
              }
              
              .grid-container {
                max-width: 100%;
                overflow-x: visible;
                width: 100%;
              }
              
              .day-labels {
                width: 30px;
              }
            `}</style>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart className="h-5 w-5 text-amber-400" />
                Task Completion Streak
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs text-white border-gray-600 hover:bg-gray-700 hover:text-white"
                asChild
              >
                <Link href="/">
                  <Info className="h-3 w-3 mr-1" />
                  Know More
                </Link>
              </Button>
                </div>
            
            {/* Tabs */}
            <div className="flex mb-4 border-b border-gray-700">
              <button 
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  activeStreakTab === 'overall' 
                    ? 'text-amber-400 border-b-2 border-amber-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveStreakTab('overall')}
              >
                Overall
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  activeStreakTab === 'cp' 
                    ? 'text-emerald-400 border-b-2 border-emerald-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveStreakTab('cp')}
              >
                Concept Practices
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  activeStreakTab === 'ap' 
                    ? 'text-purple-400 border-b-2 border-purple-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveStreakTab('ap')}
              >
                Application Problems
              </button>
                </div>
            
            <div className="rounded-md p-4 bg-gray-800 text-white mb-4">
              {/* GitHub-style contribution chart */}
              <div className="contribution-chart">
                {/* Month labels */}
                <div className="month-labels flex text-xs text-gray-400 mb-1 pl-10 relative h-5">
                  {monthLabels}
                </div>
                
                {/* Days and grid */}
                <div className="flex w-full">
                  {/* Day labels */}
                  <div className="day-labels flex flex-col justify-between text-xs text-gray-400 pr-2 h-[146px]">
                    {weekdays.map((day, index) => (
                      <div key={`day-label-${index}`} className="h-[18px] text-right">
                        {index % 2 === 0 ? day : ''}
                      </div>
                    ))}
                  </div>
          
                  {/* Grid */}
                  <div className="grid-container flex-grow">
                    <div className="grid grid-flow-col gap-[1px] w-full">
                      {weekGrids.map((week, weekIndex) => (
                        <div key={`week-${weekIndex}`} className="flex flex-col gap-[1px] flex-1">
                          {week}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex justify-between items-center text-xs text-gray-300 mt-2">
              <div>
                {activeStreakTab === 'overall' && 'Task completion over the last 365 days'}
                {activeStreakTab === 'cp' && 'Concept Practice completions over the last 365 days'}
                {activeStreakTab === 'ap' && 'Application Problem submissions over the last 365 days'}
              </div>
              <div className="flex items-center gap-2">
                <span>None</span>
                <div className="w-3 h-3 bg-gray-700" title="No activities"></div>
                <div className="w-3 h-3 bg-green-900" title="Low activity (1-25% of max)"></div>
                <div className="w-3 h-3 bg-green-700" title="Medium activity (26-50% of max)"></div>
                <div className="w-3 h-3 bg-green-500" title="High activity (51-75% of max)"></div>
                <div className="w-3 h-3 bg-green-300" title="Highest activity (76-100% of max)"></div>
                <span>Max</span>
              </div>
            </div>
          </div>
      </div>
                            
      {/* Coding Task Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Coding Task Summary
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-1 rounded-lg"
            disabled={isLoading || (apTasks.completed === 0 && apTasks.remaining === 0 && cpTasks.completed === 0 && cpTasks.remaining === 0)}
          >
            View Details
            <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AP Task Stats */}
          <Card className="shadow-md border-border overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
            <div className="h-1 w-full bg-blue-500"></div>
            <CardContent className="p-4">
              <h4 className="text-md font-bold mb-3 text-foreground">AP Task Stats</h4>
              {isLoading ? (
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                          </div>
                    <div className="h-6 w-8 bg-gray-200 animate-pulse mx-auto mb-1"></div>
                    <div className="h-4 w-16 bg-gray-200 animate-pulse mx-auto"></div>
                        </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                      </div>
                    <div className="h-6 w-8 bg-gray-200 animate-pulse mx-auto mb-1"></div>
                    <div className="h-4 w-16 bg-gray-200 animate-pulse mx-auto"></div>
                    </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="text-xl font-bold text-foreground">{apTasks.completed}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <div className="text-xl font-bold text-foreground">{apTasks.remaining}</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
            
          {/* CP Task Stats - Similar structure with loading state */}
          <Card className="shadow-md border-border overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
            <div className="h-1 w-full bg-amber-500"></div>
            <CardContent className="p-4">
              <h4 className="text-md font-bold mb-3 text-foreground">CP Task Stats</h4>
              {isLoading ? (
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="h-6 w-8 bg-gray-200 animate-pulse mx-auto mb-1"></div>
                    <div className="h-4 w-16 bg-gray-200 animate-pulse mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="h-6 w-8 bg-gray-200 animate-pulse mx-auto mb-1"></div>
                    <div className="h-4 w-16 bg-gray-200 animate-pulse mx-auto"></div>
                  </div>
                  </div>
              ) : (
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="text-xl font-bold text-foreground">{cpTasks.completed}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <div className="text-xl font-bold text-foreground">{cpTasks.remaining}</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
              )}
                </CardContent>
              </Card>
            
          {/* Task Progress Bars - Now spans 2 columns */}
          <Card className="shadow-md border-border overflow-hidden sm:col-span-2 bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
            <div className="h-1 w-full bg-purple-500"></div>
            <CardContent className="p-4">
              <h4 className="text-md font-bold mb-3 text-foreground">Task Progress</h4>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between text-sm mb-1">
                        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-8 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                      <div className="h-3 bg-gray-200 animate-pulse rounded-full"></div>
                            </div>
                  ))}
                          </div>
              ) : (
                <div className="space-y-4">
                  {/* Learning Progress Bar - New */}
                  <div className="group">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                        Learning Progress
                      </span>
                      <span className="text-muted-foreground">{courseProgress}%</span>
                        </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all group-hover:opacity-80"
                        style={{ width: `${courseProgress}%` }}
                      ></div>
                      </div>
                  </div>
                  
                  <div className="group">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        AP Task Progress
                      </span>
                      <span className="text-muted-foreground">
                        {apTasks.completed + apTasks.remaining > 0 
                          ? Math.round((apTasks.completed / (apTasks.completed + apTasks.remaining)) * 100)
                          : 0}%
                      </span>
                  </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all group-hover:opacity-80"
                        style={{ 
                          width: `${apTasks.completed + apTasks.remaining > 0 
                            ? (apTasks.completed / (apTasks.completed + apTasks.remaining)) * 100
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                        CP Task Progress
                      </span>
                      <span className="text-muted-foreground">
                        {cpTasks.completed + cpTasks.remaining > 0 
                          ? Math.round((cpTasks.completed / (cpTasks.completed + cpTasks.remaining)) * 100)
                          : 0}%
                      </span>
                      </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-amber-500 rounded-full transition-all group-hover:opacity-80"
                        style={{ 
                          width: `${cpTasks.completed + cpTasks.remaining > 0 
                            ? (cpTasks.completed / (cpTasks.completed + cpTasks.remaining)) * 100
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
                  </CardContent>
                </Card>
            </div>
          </div>
          
      {/* Programs Section */}
      <div className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Programs
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-1 rounded-lg"
            disabled={isLoading || programs.length === 0}
          >
            View All
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="grid gap-3">
          {isLoading ? (
            // Loading skeleton
            <div className="bg-white dark:bg-gray-800/50 border rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 bg-blue-50/50 dark:bg-blue-900/10 p-3 flex flex-col justify-center items-center">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12 mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex-1 p-3">
                  <div className="flex flex-col h-full justify-between">
                <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center">
                          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1"></div>
                          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center">
                          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1"></div>
                          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                      </div>
                    </div>
                  </div>
                    
                    <div className="flex justify-end">
                      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Actual programs
            programs.map((program) => {
              const progress = calculateProgramProgress(program.id);
              const completed = isProgramCompleted(program.id);
              
              // Calculate modules and completed modules
              const { total: totalModules, completed: completedModules } = getModuleCounts(program.id);
              
              return (
                <div key={program.id} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/3 bg-blue-50 dark:bg-blue-900/20 p-3 flex flex-col justify-center items-center">
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 mb-2">
                        <BookOpen className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{program.title}</div>
                      </div>
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex flex-col h-full justify-between">
                <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-sm font-medium">Course Progress</div>
                            <div className="text-sm">{progress}%</div>
                </div>
                          <Progress value={progress} className="h-2 mb-3">
                            <div className="h-full bg-blue-500 rounded-full"></div>
                          </Progress>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded p-2 text-center">
                              <div className="text-xs text-muted-foreground">Modules</div>
                              <div className="font-medium">{totalModules}</div>
                            </div>
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded p-2 text-center">
                              <div className="text-xs text-muted-foreground">Completed</div>
                              <div className="font-medium">{completedModules}</div>
                            </div>
                          </div>
                          
                          {/* Button to view module details */}
                          {program.modules && program.modules.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mb-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                              onClick={() => {
                                if (program.modules && program.modules.length > 0) {
                                  openModuleDetails(program.title, program.id, program.modules[0], true);
                                }
                              }}
                            >
                              <BookOpen className="h-3 w-3" />
                              View Module Details
                  </Button>
                          )}
                </div>
                        
                        <div className="flex justify-end">
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600" asChild>
                            <Link href={`/programs/${program.id}`}>Continue Learning</Link>
                          </Button>
              </div>
                        </div>
                      </div>
                    </div>
                    </div>
              );
            })
          )}
                  </div>
              </div>
      
      
      {/* Module Details Dialog */}
      <Dialog open={selectedModuleDetails.isOpen} onOpenChange={(open) => {
        if (!open) closeModuleDetails();
      }}>
        <DialogContent className={`${selectedModuleDetails.viewAllModules ? 'sm:max-w-[700px]' : 'sm:max-w-[500px]'}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              {selectedModuleDetails.viewAllModules 
                ? `${selectedModuleDetails.programTitle} Modules` 
                : selectedModuleDetails.module?.module_title || "Module Details"
              }
            </DialogTitle>
            <DialogDescription>
              {selectedModuleDetails.viewAllModules 
                ? `All modules in this program` 
                : `Program: ${selectedModuleDetails.programTitle}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedModuleDetails.viewAllModules ? (
              // Show all modules
              <div className="space-y-4">
                {programs.find(p => p.id === selectedModuleDetails.programId)?.modules?.map(module => {
                  const totalTopics = module.topics?.length || 0;
                  const completedTopics = module.topics?.filter(topic => 
                    topicCompletions.some(completion => completion.topic_id === topic.topic_id)
                  ).length || 0;
                  const moduleCompleted = isModuleCompleted(module, topicCompletions);
                  
                  return (
                    <div 
                      key={module.id} 
                      className={`p-3 rounded-md border ${
                        moduleCompleted 
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30' 
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{module.module_title}</h4>
                        <Badge 
                          className={`${
                            moduleCompleted 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {moduleCompleted ? "Completed" : "In Progress"}
                        </Badge>
                </div>
                      
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Topics Completed</span>
                        <span>{completedTopics} of {totalTopics}</span>
                      </div>
                      <Progress 
                        value={totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0} 
                        className="h-2 mb-2" 
                      />
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => openModuleDetails(selectedModuleDetails.programTitle, selectedModuleDetails.programId, module, false)}
                      >
                        View Module Details
                </Button>
              </div>
                  );
                })}
              </div>
            ) : (
              // Show single module details
              selectedModuleDetails.module && (
                <>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Module Progress</h4>
                    {selectedModuleDetails.module.topics && selectedModuleDetails.module.topics.length > 0 ? (
                      <>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Topics Completed</span>
                          <span>
                            {selectedModuleDetails.module.topics.filter(topic => 
                              topicCompletions.some(completion => completion.topic_id === topic.topic_id)
                            ).length} of {selectedModuleDetails.module.topics.length}
                          </span>
                        </div>
                        <Progress 
                          value={
                            selectedModuleDetails.module.topics.length > 0 
                              ? (selectedModuleDetails.module.topics.filter(topic => 
                                  topicCompletions.some(completion => completion.topic_id === topic.topic_id)
                                ).length / selectedModuleDetails.module.topics.length) * 100
                              : 0
                          } 
                          className="h-2 mb-4" 
                        />
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No topics found for this module.</p>
                    )}
                      </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Topics</h4>
                    <div className="max-h-[300px] overflow-y-auto pr-2">
                      {selectedModuleDetails.module.topics && selectedModuleDetails.module.topics.length > 0 ? (
                        <div className="space-y-2">
                          {selectedModuleDetails.module.topics.map(topic => {
                            const isCompleted = topicCompletions.some(
                              completion => completion.topic_id === topic.topic_id
                            );
                            
                            return (
                              <div 
                                key={topic.topic_id} 
                                className={`p-2 rounded-md border ${
                                  isCompleted 
                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30' 
                                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="font-medium text-sm">{topic.topic?.title || "Unnamed Topic"}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {topic.topic?.description?.substring(0, 100) || "No description available"}
                                      {topic.topic?.description && topic.topic.description.length > 100 ? '...' : ''}
                        </div>
                        </div>
                                  <Badge 
                                    className={`ml-2 ${
                                      isCompleted 
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    }`}
                                  >
                                    {isCompleted ? "Completed" : "Pending"}
                                  </Badge>
                        </div>
                      </div>
                            );
                          })}
              </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No topics found for this module.</p>
                      )}
        </div>
      </div>
                </>
              )
            )}
          </div>
          
          <DialogFooter>
            {selectedModuleDetails.viewAllModules ? (
              <Button variant="outline" onClick={closeModuleDetails}>Close</Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => openModuleDetails(
                    selectedModuleDetails.programTitle, 
                    selectedModuleDetails.programId, 
                    selectedModuleDetails.module!, 
                    true
                  )}
                >
                  View All Modules
                </Button>
                <Button variant="outline" onClick={closeModuleDetails}>Close</Button>
                <Button asChild>
                  <Link href={`/programs/${selectedModuleDetails.programId}/modules/${selectedModuleDetails.module?.id}`}>
                    Go to Module
                  </Link>
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 