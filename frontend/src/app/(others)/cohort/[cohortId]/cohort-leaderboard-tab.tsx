"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search,
  CheckCircle2,
  Trophy,
  Loader2
} from "lucide-react";
import { getCohortLearners } from "@/lib/api/cohorts";
import { getUserPointsBreakdownById } from "@/lib/api/points";
import { 
  getUserTopicCompletions,
  getUserCpCompletions,
  TopicCompletion,
  CpCompletion
} from "@/lib/api/completions";
import { getUserApSubmissions, ApSubmission } from "@/lib/api/submissions";

interface LeaderboardProps {
  cohortId: string;
}

interface LearnerStats {
  id: string;
  name: string;
  email: string;
  points: number;
  rank: number;
  tasksCompleted: number;
  initials: string;
}

export function CohortLeaderboardTab({ cohortId }: LeaderboardProps) {
  const [loading, setLoading] = useState(true);
  const [learners, setLearners] = useState<LearnerStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("points");
  
  useEffect(() => {
    const fetchLearnerStats = async () => {
      try {
        setLoading(true);
        
        // Get cohort learners
        const cohortLearners = await getCohortLearners(cohortId);
        
        // Fetch stats for each learner
        const learnersWithStats = await Promise.all(
          cohortLearners.map(async (learner) => {
            const userId = learner.user_id;
            
            // Get points - this should now work for learners as well
            let points = 0;
            try {
              const pointsResponse = await getUserPointsBreakdownById(userId);
              points = pointsResponse.total || 0;
            } catch (err) {
              console.warn(`Failed to fetch points for user ${userId}:`, err);
            }
            
            // For task completion counts, we'll use a simple estimate since we can't
            // get accurate data for other users without admin privileges
            const estimatedTasks = Math.floor(points / 5); // Rough estimate based on points
            
            return {
              id: userId,
              name: `${learner.user.first_name || ''} ${learner.user.last_name || ''}`.trim() || learner.user.email,
              email: learner.user.email,
              points: points,
              rank: 0, // Will be calculated after sorting
              tasksCompleted: estimatedTasks,
              initials: learner.user.first_name ? 
                `${learner.user.first_name.charAt(0)}${learner.user.last_name ? learner.user.last_name.charAt(0) : ''}` :
                learner.user.email.substring(0, 2).toUpperCase()
            };
          })
        );
        
        // Sort by points and assign ranks
        learnersWithStats.sort((a, b) => b.points - a.points);
        learnersWithStats.forEach((learner, i) => {
          learner.rank = i + 1;
        });
        
        setLearners(learnersWithStats);
        setError(null);
      } catch (err) {
        console.error("Error fetching cohort learners:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLearnerStats();
  }, [cohortId]);
  
  // Filter and sort learners based on search query and sort criteria
  const filteredLearners = learners
    .filter(learner => 
      learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "points") {
        return b.points - a.points;
      } else if (sortBy === "tasks") {
        return b.tasksCompleted - a.tasksCompleted;
      }
      return 0;
    });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading leaderboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-destructive text-center">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] w-full flex flex-col overflow-hidden">
      {/* Leaderboard Header */}
      <div className="flex items-center justify-between pb-4 border-b flex-shrink-0 px-4 pt-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 md:h-7 md:w-7 text-amber-500" />
          <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent truncate">Cohort Leaderboard</CardTitle>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full py-4 flex-shrink-0 px-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search learners..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="tasks">Tasks Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Leaderboard List */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <Card className="h-full overflow-hidden">
          <CardContent className="p-0 h-full overflow-y-auto custom-scrollbar">
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(155, 155, 155, 0.5);
                border-radius: 20px;
                border: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: rgba(155, 155, 155, 0.7);
              }
              @media (max-width: 640px) {
                .custom-scrollbar::-webkit-scrollbar {
                  width: 4px;
                }
              }
            `}</style>
            <div className="divide-y">
              {filteredLearners.length === 0 ? (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground">No learners match your search criteria</p>
                </div>
              ) : (
                filteredLearners.map((learner) => (
                  <div key={learner.id} className="flex items-center p-4">
                    <div className="w-8 text-center font-medium text-muted-foreground">
                      {learner.rank}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Avatar>
                        <AvatarImage src="" alt={learner.name} />
                        <AvatarFallback>{learner.initials}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="font-medium truncate">{learner.name}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                          <span>{learner.tasksCompleted} tasks</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right flex-shrink-0">
                      <div className="font-semibold text-lg md:text-xl">{learner.points}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 