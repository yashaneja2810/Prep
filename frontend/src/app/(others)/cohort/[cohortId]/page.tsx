"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Trophy, Video, RotateCw, X, BookOpen, Database } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCohortContext } from "./layout";
import { getCohortSessions, getSessionSummary, CohortSession, SessionSummary } from "@/lib/api/cohort-sessions";
import { LiveSessionsTab } from "./live-sessions";
import { SessionSummaryTab } from "./session-summary-tab";
import { CohortLeaderboardTab } from "./cohort-leaderboard-tab";
import { SessionNotesTab } from "./session-notes-tab";
import { SessionResourcesTab } from "./session-resources-tab";

// Lecture interface to represent session data with resources
interface Lecture {
  id: string;
  sessionId: string;
  title: string;
  date: string;
  time: string;
  instructor: string;
  description?: string;
  topicsCovered?: string[];
  actionPoints?: string[];
  quickRecap?: string;
  summary?: string;
  notes?: string;
  classFilesUrl?: string;
  recordingLink?: string;
  lectureNumber?: number;
}

export default function CohortPage() {
  const { cohort, cohortId, isLoading, error } = useCohortContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the active tab from URL or default to 'live'
  const activeTab = searchParams.get('tab') || 'live';
  
  // State for session data
  const [sessions, setSessions] = useState<CohortSession[]>([]);
  const [sessionsSummaries, setSessionsSummaries] = useState<Map<string, SessionSummary>>(new Map());
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  // Get sessionId from URL
  const sessionId = searchParams.get('session') || '';

  // Fetch sessions data
  useEffect(() => {
    const fetchData = async () => {
      if (!cohortId) return;
      
      try {
        setDataLoading(true);
        console.log("Fetching sessions for cohort ID:", cohortId);
        
        // Fetch cohort sessions
        const sessionsData = await getCohortSessions(cohortId);
        console.log("Sessions loaded:", sessionsData.length, sessionsData);
        setSessions(sessionsData);
        
        // Fetch summaries for each session
        const summariesMap = new Map<string, SessionSummary>();
        const lecturesArray: Lecture[] = [];
        
        for (const session of sessionsData) {
          console.log("Processing session:", session.id, session.title);
          
          try {
            const summary = await getSessionSummary(session.id);
            console.log("Session summary for", session.id, ":", summary);
            
            if (summary) {
              summariesMap.set(session.id, summary);
            }
            
            // Create lecture object from session and summary
            const sessionDate = new Date(session.session_date);
            const lecture: Lecture = {
              id: session.id,
              sessionId: session.id,
              title: session.title,
              date: sessionDate.toLocaleDateString(),
              time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              instructor: session.trainer?.first_name && session.trainer?.last_name 
                ? `${session.trainer.first_name} ${session.trainer.last_name}`
                : "Unknown",
              description: session.description,
              topicsCovered: typeof summary?.topics_covered === 'string'
                ? summary.topics_covered.split('\n').filter(Boolean)
                : [],
              actionPoints: typeof summary?.action_points === 'string'
                ? summary.action_points.split('\n').filter(Boolean)
                : [],
              quickRecap: summary?.quick_recap || "",
              summary: summary?.summary || "",
              notes: summary?.notes || "",
              classFilesUrl: summary?.class_files_url || "",
              recordingLink: summary?.recording_link || "",
              lectureNumber: undefined  // Default to undefined since it doesn't exist on CohortSession
            };
            
            console.log("Created lecture object:", lecture);
            lecturesArray.push(lecture);
          } catch (err) {
            console.error("Error processing session", session.id, ":", err);
          }
        }
        
        console.log("Final lectures array:", lecturesArray);
        setSessionsSummaries(summariesMap);
        setLectures(lecturesArray);
        
        // Select initial lecture if available
        if (lecturesArray.length > 0) {
          const initialLecture = sessionId 
            ? lecturesArray.find(l => l.id === sessionId) 
            : lecturesArray[0];
          
          console.log("Setting selected lecture:", initialLecture);
          setSelectedLecture(initialLecture || lecturesArray[0]);
        } else {
          console.log("No lectures available to select");
        }
        
        setDataError(null);
      } catch (err) {
        console.error("Error fetching cohort sessions data:", err);
        setDataError("Failed to load cohort sessions. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [cohortId, sessionId]);

  // Group lectures by weeks for the sidebar
  const groupLecturesByWeek = (lectures: Lecture[]) => {
    if (!lectures.length) return [];
    
    console.log("Grouping lectures by week:", lectures.length, "lectures");
    
    const weeks: { week: string; lectures: Lecture[] }[] = [];
    const lecturesByWeek = new Map<string, Lecture[]>();
    
    lectures.forEach(lecture => {
      const lectureDate = new Date(lecture.date);
      const year = lectureDate.getFullYear();
      const month = lectureDate.getMonth();
      const weekNumber = Math.ceil((lectureDate.getDate() - 1 + (new Date(year, month, 1).getDay())) / 7);
      const weekKey = `Week ${weekNumber} (${new Date(year, month).toLocaleString('default', { month: 'short' })} ${year})`;
      
      if (!lecturesByWeek.has(weekKey)) {
        lecturesByWeek.set(weekKey, []);
      }
      
      lecturesByWeek.get(weekKey)?.push(lecture);
    });
    
    lecturesByWeek.forEach((lectures, week) => {
      weeks.push({ week, lectures });
    });
    
    console.log("Grouped lectures:", weeks);
    return weeks;
  };
  
  const lecturesByWeek = groupLecturesByWeek(lectures);

  // Handle tab change
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    router.push(`/cohort/${cohortId}?tab=${value}${sessionId ? `&session=${sessionId}` : ''}`);
  };
  
  // Handle lecture selection
  const handleLectureSelect = (lecture: Lecture) => {
    console.log("Selected lecture:", lecture);
    setSelectedLecture(lecture);
    router.push(`/cohort/${cohortId}?tab=${activeTab}&session=${lecture.id}`);
  };

  // Loading state for the entire cohort
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <RotateCw className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading cohort data...</p>
      </div>
    );
  }

  // Error state for the cohort
  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <X className="h-8 w-8 text-destructive" />
        <p className="mt-4 text-destructive">Error: {error}</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Tabs with full page width border and centered buttons */}
      <div className="border-b w-full flex-shrink-0">
        <div className="flex justify-center">
          <Tabs defaultValue="live" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center mb-[-1px]">
              <TabsList className="h-auto py-0 bg-transparent space-x-4 md:space-x-8">
                <TabsTrigger 
                  value="live" 
                  className="flex items-center gap-1 md:gap-2 py-3 px-2 data-[state=active]:border-b-2 data-[state=active]:border-black border-b-2 border-transparent text-sm md:text-base"
                >
                  <Video className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">Live Sessions</span>
                  <span className="sm:hidden">Live</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="summary" 
                  className="flex items-center gap-1 md:gap-2 py-3 px-2 data-[state=active]:border-b-2 data-[state=active]:border-black border-b-2 border-transparent text-sm md:text-base"
                >
                  <FileText className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">Session Summary</span>
                  <span className="sm:hidden">Summary</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="leaderboard" 
                  className="flex items-center gap-1 md:gap-2 py-3 px-2 data-[state=active]:border-b-2 data-[state=active]:border-black border-b-2 border-transparent text-sm md:text-base"
                >
                  <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">Leaderboard</span>
                  <span className="sm:hidden">Leaders</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="flex items-center gap-1 md:gap-2 py-3 px-2 data-[state=active]:border-b-2 data-[state=active]:border-black border-b-2 border-transparent text-sm md:text-base"
                >
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">My Notes</span>
                  <span className="sm:hidden">Notes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  className="flex items-center gap-1 md:gap-2 py-3 px-2 data-[state=active]:border-b-2 data-[state=active]:border-black border-b-2 border-transparent text-sm md:text-base"
                >
                  <Database className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">Session Resources</span>
                  <span className="sm:hidden">Resources</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="overflow-auto h-[calc(100vh-120px)]">
              <TabsContent value="live" className="m-0 p-0">
                <LiveSessionsTab cohortId={cohortId || ""} />
              </TabsContent>
              
              <TabsContent value="summary" className="m-0 p-0">
                {dataLoading ? (
                  <div className="flex flex-col h-screen items-center justify-center">
                    <RotateCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading session data...</p>
                  </div>
                ) : dataError ? (
                  <div className="flex flex-col h-screen items-center justify-center">
                    <X className="h-8 w-8 text-destructive" />
                    <p className="mt-4 text-destructive">Error: {dataError}</p>
                  </div>
                ) : (
                  <SessionSummaryTab 
                    cohortId={cohortId || ""} 
                    lecture={selectedLecture || undefined} 
                    lectureGroups={lecturesByWeek}
                    onLectureSelect={handleLectureSelect}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="leaderboard" className="m-0 p-0">
                <CohortLeaderboardTab cohortId={cohortId || ""} />
              </TabsContent>
              
              <TabsContent value="notes" className="m-0 p-0">
                <SessionNotesTab cohortId={cohortId || ""} />
              </TabsContent>
              
              <TabsContent value="resources" className="m-0 p-0">
                <SessionResourcesTab cohortId={cohortId || ""} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 