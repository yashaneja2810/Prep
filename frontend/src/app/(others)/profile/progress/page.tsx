"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Award, BookOpen, CheckCircle2, CircleDot, Clock, Code, 
  FileCheck, Flame, GraduationCap, LineChart, Loader2, 
  Target, Terminal, Trophy, Zap
} from "lucide-react";
import { 
  getUserTopicCompletions, 
  getUserCpCompletions, 
  getUserObjectiveCompletions,
  getUserOutcomeCompletions,
  TopicCompletion,
  CpCompletion,
  ObjectiveCompletion,
  OutcomeCompletion
} from "@/lib/api/completions";
import { getUserPointsBreakdown } from "@/lib/api/points";
import { getUserApSubmissions, ApSubmission } from "@/lib/api/submissions";

export default function ProgressPage() {
  // State for loading status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for user progress data
  const [points, setPoints] = useState<any>(null);
  const [topicCompletions, setTopicCompletions] = useState<TopicCompletion[]>([]);
  const [cpCompletions, setCpCompletions] = useState<CpCompletion[]>([]);
  const [objectiveCompletions, setObjectiveCompletions] = useState<ObjectiveCompletion[]>([]);
  const [outcomeCompletions, setOutcomeCompletions] = useState<OutcomeCompletion[]>([]);
  const [apSubmissions, setApSubmissions] = useState<ApSubmission[]>([]);
  
  // Fetch all user progress data
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setLoading(true);
        
        // Fetch points
        try {
          const pointsResponse = await getUserPointsBreakdown();
          setPoints(pointsResponse);
          console.log("Points data fetched successfully:", pointsResponse);
        } catch (err) {
          console.error("Failed to fetch points data:", err);
          // Continue with empty points data
          setPoints({ total: 0, breakdown: {} });
        }
        
        // Fetch topic completions
        try {
          const topicResponse = await getUserTopicCompletions();
          setTopicCompletions(topicResponse);
        } catch (err) {
          console.warn("Failed to fetch topic completions:", err);
          setTopicCompletions([]);
        }
        
        // Fetch CP completions
        try {
          const cpResponse = await getUserCpCompletions();
          setCpCompletions(cpResponse);
        } catch (err) {
          console.warn("Failed to fetch CP completions:", err);
          setCpCompletions([]);
        }
        
        // Fetch objective completions
        try {
          const objectiveResponse = await getUserObjectiveCompletions();
          setObjectiveCompletions(objectiveResponse);
        } catch (err) {
          console.warn("Failed to fetch objective completions:", err);
          setObjectiveCompletions([]);
        }
        
        // Fetch outcome completions
        try {
          const outcomeResponse = await getUserOutcomeCompletions();
          setOutcomeCompletions(outcomeResponse);
        } catch (err) {
          console.warn("Failed to fetch outcome completions:", err);
          setOutcomeCompletions([]);
        }
        
        // Fetch AP submissions
        try {
          const submissionsResponse = await getUserApSubmissions();
          setApSubmissions(submissionsResponse);
        } catch (err) {
          console.warn("Failed to fetch AP submissions:", err);
          setApSubmissions([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user progress:", err);
        setError("Failed to load progress data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, []);
  
  // Calculate statistics
  const totalPoints = points?.total || 0;
  const completedTopics = topicCompletions.length;
  const completedCPs = cpCompletions.length;
  const completedObjectives = objectiveCompletions.length;
  const completedOutcomes = outcomeCompletions.length;
  const submittedAPs = apSubmissions.length;
  // Fix TypeScript errors by safely accessing properties
  const successfulAPs = apSubmissions.filter(ap => 
    (ap as any).status === "ACCEPTED" || (ap as any).is_correct
  ).length;
  
  // Get points breakdown by category
  const pointsBreakdown = points?.breakdown || {};
  const pointsCategories = Object.keys(pointsBreakdown);
  
  // Helper function to format date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return "N/A";
    }
  };
  
  // Helper function to get badge color for difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };
  
  if (loading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your progress data...</p>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <div className="px-4 py-6">
        <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="container max-w-7xl mx-auto px-3 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8">
          <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-br from-primary/5 to-transparent">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalPoints}</div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  All activities
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{completedTopics}</div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-600" />
                Concept Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{completedCPs}</div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Code className="h-4 w-4 text-purple-600" />
                AP Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {submittedAPs > 0 ? Math.round((successfulAPs / submittedAPs) * 100) : 0}%
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {successfulAPs}/{submittedAPs}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="points" className="w-full">
          <div className="bg-background/50 backdrop-blur-sm p-1 rounded-lg border mb-8">
            <TabsList className="w-full grid grid-cols-4 h-auto">
              <TabsTrigger value="points" className="py-2 data-[state=active]:bg-primary/10 transition-all">
                <Trophy className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Points</span>
              </TabsTrigger>
              <TabsTrigger value="topics" className="py-2 data-[state=active]:bg-primary/10 transition-all">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Topics</span>
              </TabsTrigger>
              <TabsTrigger value="cps" className="py-2 data-[state=active]:bg-primary/10 transition-all">
                <Terminal className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">CPs</span>
              </TabsTrigger>
              <TabsTrigger value="aps" className="py-2 data-[state=active]:bg-primary/10 transition-all">
                <Code className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">APs</span>
              </TabsTrigger>
          </TabsList>
          </div>

          {/* Points Tab */}
          <TabsContent value="points" className="space-y-6 animate-in fade-in duration-300">
            <Card className="overflow-hidden border-primary/10 hover:border-primary/20 transition-colors duration-300">
              <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-primary/10 sticky top-0 z-10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Points Overview
                </CardTitle>
                <CardDescription>Your learning progress</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {pointsCategories.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pointsCategories.map((category) => {
                      const categoryData = pointsBreakdown[category];
                      const totalCategoryPoints = categoryData.total;
                      
                      let icon;
                      let gradientColor;
                      let borderColor;
                      let shadowColor;
                      
                      if (category.includes('TOPIC')) {
                        icon = <BookOpen className="h-5 w-5 text-green-600" />;
                        gradientColor = 'from-green-500/5 via-green-500/2 to-transparent';
                        borderColor = 'border-green-500/10';
                        shadowColor = 'hover:shadow-green-500/5';
                      } else if (category.includes('CP')) {
                        icon = <Terminal className="h-5 w-5 text-blue-600" />;
                        gradientColor = 'from-blue-500/5 via-blue-500/2 to-transparent';
                        borderColor = 'border-blue-500/10';
                        shadowColor = 'hover:shadow-blue-500/5';
                      } else if (category.includes('AP')) {
                        icon = <Code className="h-5 w-5 text-purple-600" />;
                        gradientColor = 'from-purple-500/5 via-purple-500/2 to-transparent';
                        borderColor = 'border-purple-500/10';
                        shadowColor = 'hover:shadow-purple-500/5';
                      }
                      
                      return (
                        <div 
                          key={category} 
                          className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${gradientColor} ${borderColor} p-4 shadow-sm transition-all duration-300 hover:shadow-lg ${shadowColor} hover:-translate-y-0.5`}
                        >
                          <div className="absolute inset-0 bg-grid-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <div className="relative flex items-center gap-3">
                            <div className={`rounded-lg bg-card p-2.5 ring-1 ring-inset ${borderColor}`}>
                              {icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate font-medium">
                                {category.replace(/_/g, ' ').toLowerCase()
                                  .split(' ')
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ')}
                              </h4>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {totalCategoryPoints} points
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No points earned yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Complete topics, CPs, and APs to earn points</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-6 animate-in fade-in duration-300">
            <Card className="overflow-hidden border-primary/10 hover:border-primary/20 transition-colors duration-300">
              <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b border-primary/10 sticky top-0 z-10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Completed Topics
                </CardTitle>
                <CardDescription>Topics you've marked as complete</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {topicCompletions.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {topicCompletions.map((completion) => (
                      <div key={completion.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 transition-colors">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{(completion as any).topics?.title || "Topic"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(completion.completed_at)}
                            </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No topics completed yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Mark topics as complete to track your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CPs Tab */}
          <TabsContent value="cps" className="space-y-6 animate-in fade-in duration-300">
            <Card className="overflow-hidden border-primary/10 hover:border-primary/20 transition-colors duration-300">
              <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b border-primary/10 sticky top-0 z-10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-blue-600" />
                  Concept Practices
                </CardTitle>
                <CardDescription>Your completed concept practice exercises</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {cpCompletions.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {cpCompletions.map((completion) => (
                      <div key={completion.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 transition-colors">
                        <Terminal className="h-5 w-5 text-blue-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{(completion as any).cps?.title || "Concept Practice"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(completion.completed_at)}
                            </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getDifficultyColor((completion as any).cps?.difficulty || "beginner")}
                        >
                          {(completion as any).cps?.difficulty || "Beginner"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Terminal className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No concept practices completed yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Complete CPs to practice your skills</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* APs Tab */}
          <TabsContent value="aps" className="space-y-6 animate-in fade-in duration-300">
            <Card className="overflow-hidden border-primary/10 hover:border-primary/20 transition-colors duration-300">
              <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b border-primary/10 sticky top-0 z-10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  Application Problems
                </CardTitle>
                <CardDescription>Your submitted application problem solutions</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {apSubmissions.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {apSubmissions.map((submission) => (
                      <div key={submission.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 transition-colors">
                        <Code className="h-5 w-5 text-purple-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{(submission as any).aps?.title || "Application Problem"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(submission.submitted_at)}
                            </p>
                        </div>
                          <Badge 
                          variant="outline" 
                          className={getDifficultyColor((submission as any).aps?.difficulty || "beginner")}
                          >
                          {(submission as any).aps?.difficulty || "Beginner"}
                          </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No application problems submitted yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submit solutions to APs to demonstrate your skills
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 