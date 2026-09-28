"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Users, Github, ChevronLeft, ChevronRight, LinkIcon, Plus, RotateCw, X, User2, ArrowLeft, FileText, BookOpen, Edit, Trash2, ClipboardCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "next/navigation";
import { CohortSession, getCohortSessions, createCohortSession, updateSessionSummary, SessionSummaryDto, getSessionSummary, updateCohortSession, deleteCohortSession, getSessionAttendance, recordSessionAttendance, SessionAttendance, SessionAttendanceDto } from "@/lib/api/cohort-sessions";
import { getTrainersByCohort } from "@/lib/api/trainers";
import { TrainerProfile } from "@/store/slices/trainers";
import { getCohortLearners } from "@/lib/api/cohorts";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Updated to match the interface in page.tsx
interface Lecture {
  id: string;
  lectureNumber?: number;
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
  sessionId: string;
}

interface LiveSessionsTabProps {
  lecture?: Lecture;
  cohortId: string;
}

interface NewSessionState {
  title: string;
  description: string;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  trainer_id: string | null;
  meeting_link?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

interface SessionSummaryState {
  activeTab: "content" | "resources" | "recordings" | "notes";
  topics_covered: string;
  action_points: string;
  quick_recap: string;
  summary: string;
  notes: string;
  class_files_url: string;
  recording_link: string;
}

interface AttendanceState {
  attendanceRecords: {
    cohort_learner_id: string;
    status: 'present' | 'absent';
    learner_name: string;
  }[];
  loading: boolean;
}

const initialNewSessionState: NewSessionState = {
  title: "",
  description: "",
  session_date: "",
  session_time: "",
  duration_minutes: 60,
  trainer_id: null,
  meeting_link: "",
  status: "scheduled"
};

const initialSummaryState: SessionSummaryState = {
  activeTab: "content",
  topics_covered: "",
  action_points: "",
  quick_recap: "",
  summary: "",
  notes: "",
  class_files_url: "",
  recording_link: ""
};

export function LiveSessionsTab({ lecture, cohortId }: LiveSessionsTabProps) {
  const params = useParams();
  
  const [sessions, setSessions] = useState<CohortSession[]>([]);
  const [filteredUpcomingSessions, setFilteredUpcomingSessions] = useState<CohortSession[]>([]);
  const [filteredPastSessions, setFilteredPastSessions] = useState<CohortSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Schedule dialog state
  const [schedulingSession, setSchedulingSession] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newSession, setNewSession] = useState<NewSessionState>(initialNewSessionState);
  const [sessionDate, setSessionDate] = useState<Date | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    title: false,
    date: false,
    time: false,
    duration: false,
    trainer: false
  });

  // Session summary state
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummaryState>(initialSummaryState);
  const [savingSummary, setSavingSummary] = useState(false);
  
  // Edit session state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<NewSessionState>(initialNewSessionState);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [updatingSession, setUpdatingSession] = useState(false);
  
  // Delete session state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);
  
  // Attendance state
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({
    attendanceRecords: [],
    loading: false
  });
  const [selectedAttendanceSessionId, setSelectedAttendanceSessionId] = useState<string | null>(null);
  const [savingAttendance, setSavingAttendance] = useState(false);
  
  // Fetch trainers by cohort
  useEffect(() => {
    const fetchTrainers = async () => {
      setLoadingTrainers(true);
      try {
        // Use cohort-specific trainers instead of all trainers
        const trainersData = await getTrainersByCohort(cohortId);
        console.log('Fetched trainers for cohort:', trainersData);
        
        // Log both IDs for debugging
        trainersData.forEach(trainer => {
          console.log(`Trainer: ${trainer.first_name || 'Unknown'}, ID: ${trainer.id}, User ID: ${trainer.user_id}`);
        });
        
        setTrainers(trainersData);
        
        if (trainersData.length === 0) {
          toast({
            title: "No trainers found",
            description: "There are no trainers assigned to this cohort. Please add trainers first.",
          });
        }
      } catch (error) {
        console.error("Error fetching trainers:", error);
        toast({
          title: "Error fetching trainers",
          description: "Could not load trainers for this cohort.",
          variant: "destructive"
        });
      } finally {
        setLoadingTrainers(false);
      }
    };
    
    if (cohortId) {
      fetchTrainers();
    }
  }, [cohortId]);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!showScheduleDialog) {
      // Reset form
      setNewSession(initialNewSessionState);
      setSessionDate(undefined);
      setFormErrors({
        title: false,
        date: false,
        time: false,
        duration: false,
        trainer: false
      });
    }
  }, [showScheduleDialog]);
  
  // Fetch sessions data
  useEffect(() => {
    // Test API connectivity
    fetch('http://localhost:5000/api/health-check')
      .then(response => {
        console.log("Backend API health check:", response.status, response.ok);
        return response.text();
      })
      .then(data => console.log("API health response:", data))
      .catch(err => console.error("API health check failed:", err));

    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Use cohortId to get sessions for specific cohort
        const sessionsData = await getCohortSessions(cohortId);
        
        // Set sessions directly from API response
        setSessions(sessionsData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to load sessions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [cohortId]);
  
  // Filter sessions whenever the sessions state or activeTab changes
  useEffect(() => {
    console.log("Sessions state changed, re-filtering...");
    console.log("Total sessions:", sessions.length);
    
    // Debug each session's data
    sessions.forEach(session => {
      console.log(`Session ${session.id}: Title=${session.title}, Status=${session.status}, Date=${session.session_date}`);
    });
    
    // Handle case when status might be missing or undefined
    const upcoming = sessions.filter(session => {
      // Consider 'scheduled' or missing/undefined status as upcoming
      return session.status === 'scheduled' || !session.status;
    });
    
    const past = sessions.filter(session => {
      return session.status === 'completed';
    });
    
    console.log(`Filtered: ${upcoming.length} upcoming, ${past.length} past sessions`);
    
    setFilteredUpcomingSessions(upcoming);
    setFilteredPastSessions(past);
    
  }, [sessions, activeTab]);
  
  // Helper functions for date formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };
  
  const formatTime = (dateString: string, timeString?: string) => {
    if (timeString) {
      return timeString;
    }
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to get days with sessions for the calendar view
  const getDaysWithSessions = () => {
    const result: number[] = [];
    sessions.forEach(session => {
      if (session.status === 'scheduled') {
        const sessionDate = new Date(session.session_date);
        if (
          sessionDate.getMonth() === currentMonth.getMonth() &&
          sessionDate.getFullYear() === currentMonth.getFullYear()
        ) {
          result.push(sessionDate.getDate());
        }
      }
    });
    return result;
  };
  
  // Current month days with sessions
  const daysWithSessions = getDaysWithSessions();
  
  // For displaying in the calendar
  const allSessionDays = [...daysWithSessions];
  
  // Create a new session
  const handleCreateSession = async () => {
    // Add debug logging
    console.log("Schedule button clicked", { newSession, cohortId });
    
    // Extra check for cohortId
    if (!cohortId) {
      console.error("Missing cohortId:", cohortId);
      toast({
        title: "Configuration error",
        description: "Missing cohort ID. Please try again or contact support.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate form inputs
    const errors = {
      title: !newSession.title.trim(),
      date: !newSession.session_date.trim(),
      time: !newSession.session_time.trim(),
      duration: !newSession.duration_minutes,
      trainer: !newSession.trainer_id
    };
    
    console.log("Form validation", { errors });
    setFormErrors(errors);
    
    if (Object.values(errors).some(Boolean)) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSchedulingSession(true);
      
      // Ensure duration is a number
      const durationMinutes = typeof newSession.duration_minutes === 'number' 
        ? newSession.duration_minutes 
        : parseInt(String(newSession.duration_minutes));
      
      if (isNaN(durationMinutes)) {
        throw new Error("Duration must be a valid number");
      }
      
      // The session_date is already in yyyy-MM-dd format from the date input
      const sessionData = {
        cohort_id: cohortId, 
        title: newSession.title,
        description: newSession.description,
        session_date: newSession.session_date,
        session_time: newSession.session_time,
        duration_minutes: durationMinutes,
        trainer_id: newSession.trainer_id as string, // This is now the user_id from the trainer
        meeting_link: newSession.meeting_link || '',
        status: 'scheduled' as const
      };
      
      console.log("Submitting session data", sessionData);
      console.log("Selected trainer ID (user_id):", newSession.trainer_id);
      
      const createdSession = await createCohortSession(sessionData);
      console.log("Response from createCohortSession", createdSession);
      
      if (createdSession) {
        // Add the new session to the state
        setSessions(prevSessions => [...prevSessions, createdSession]);
        setShowScheduleDialog(false);
        toast({
          title: "Session scheduled",
          description: `${newSession.title} has been scheduled successfully.`
        });
      } else {
        throw new Error("Failed to create session - no response received");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error scheduling session",
        description: "There was a problem scheduling your session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSchedulingSession(false);
    }
  };
  
  // Calendar generation and navigation
  const generateCalendarDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and how many days are in the month
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get day of week of first day (0 is Sunday)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push({
        day: "",
        date: null,
        isCurrentMonth: false,
        hasSession: false,
        isToday: false,
        isHighlighted: false
      });
    }
    
    // Add cells for days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if this day has any sessions
      const hasSession = daysWithSessions.includes(day);
      
      // Today's date
      const today = new Date();
      const isToday = today.getDate() === day && 
                      today.getMonth() === month && 
                      today.getFullYear() === year;
      
      days.push({
        day,
        date,
        isCurrentMonth: true,
        hasSession,
        isToday,
        isHighlighted: hasSession // Only highlight days with sessions
      });
    }
    
    return days;
  };
  
  // Memoized calendar days that update when sessions or current month changes
  const calendarDays = useMemo(() => generateCalendarDays(), [sessions, currentMonth]);
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };
  
  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };
  
  // Handle session summary
  const handleOpenSummaryDialog = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setSessionSummary({...initialSummaryState, activeTab: "content"});
    
    try {
      // Try to fetch existing summary
      const existingSummary = await getSessionSummary(sessionId);
      if (existingSummary) {
        setSessionSummary({
          activeTab: "content",
          topics_covered: existingSummary.topics_covered || "",
          action_points: existingSummary.action_points || "",
          quick_recap: existingSummary.quick_recap || "",
          summary: existingSummary.summary || "",
          notes: existingSummary.notes || "",
          class_files_url: existingSummary.class_files_url || "",
          recording_link: existingSummary.recording_link || ""
        });
      }
    } catch (error) {
      console.error("Error fetching session summary:", error);
    }
    
    setShowSummaryDialog(true);
  };
  
  const handleSaveSummary = async () => {
    if (!selectedSessionId) return;
    
    try {
      setSavingSummary(true);
      
      const summaryData: SessionSummaryDto = {
        topics_covered: sessionSummary.topics_covered,
        action_points: sessionSummary.action_points,
        quick_recap: sessionSummary.quick_recap,
        summary: sessionSummary.summary,
        notes: sessionSummary.notes,
        class_files_url: sessionSummary.class_files_url,
        recording_link: sessionSummary.recording_link
      };
      
      console.log("Saving session summary:", summaryData);
      
      const updatedSummary = await updateSessionSummary(selectedSessionId, summaryData);
      
      if (updatedSummary) {
        setShowSummaryDialog(false);
        toast({
          title: "Summary updated",
          description: "Session summary has been updated successfully."
        });
      } else {
        throw new Error("Failed to update session summary");
      }
    } catch (error) {
      console.error("Error saving session summary:", error);
      toast({
        title: "Error updating summary",
        description: "There was a problem updating the session summary.",
        variant: "destructive"
      });
    } finally {
      setSavingSummary(false);
    }
  };
  
  // Handle opening the edit session dialog
  const handleOpenEditDialog = (session: CohortSession) => {
    // Format the date to YYYY-MM-DD for the input field
    const dateObj = new Date(session.session_date);
    const formattedDate = dateObj.toISOString().split('T')[0];
    
    // Extract time or use default
    const timeMatch = session.session_date.match(/T(\d{2}:\d{2})/);
    const formattedTime = session.session_time || (timeMatch ? timeMatch[1] : "09:00");
    
    setEditingSession({
      title: session.title,
      description: session.description || "",
      session_date: formattedDate,
      session_time: formattedTime,
      duration_minutes: session.duration_minutes,
      trainer_id: session.trainer_id,
      meeting_link: session.meeting_link,
      status: session.status
    });
    
    setEditSessionId(session.id);
    setShowEditDialog(true);
  };
  
  // Handle updating a session
  const handleUpdateSession = async () => {
    // Validate form
    const errors = {
      title: !editingSession.title.trim(),
      date: !editingSession.session_date,
      time: !editingSession.session_time,
      duration: !editingSession.duration_minutes || editingSession.duration_minutes <= 0,
      trainer: !editingSession.trainer_id
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(Boolean)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (!editSessionId) {
      toast({
        title: "Error",
        description: "No session selected for update.",
        variant: "destructive"
      });
      return;
    }
    
    setUpdatingSession(true);
    
    try {
      const updatedSession = await updateCohortSession(editSessionId, {
        title: editingSession.title,
        description: editingSession.description,
        session_date: editingSession.session_date,
        session_time: editingSession.session_time,
        duration_minutes: editingSession.duration_minutes,
        trainer_id: editingSession.trainer_id || undefined,
        meeting_link: editingSession.meeting_link,
        status: editingSession.status
      });
      
      if (updatedSession) {
        // Update the sessions list
        setSessions(prev => prev.map(session => 
          session.id === editSessionId ? updatedSession : session
        ));
        
        toast({
          title: "Session Updated",
          description: "The session has been updated successfully."
        });
        
        setShowEditDialog(false);
      } else {
        throw new Error("Failed to update session");
      }
    } catch (error) {
      console.error("Error updating session:", error);
      toast({
        title: "Error updating session",
        description: "There was a problem updating the session.",
        variant: "destructive"
      });
    } finally {
      setUpdatingSession(false);
    }
  };
  
  // Handle opening the delete confirmation dialog
  const handleOpenDeleteDialog = (sessionId: string) => {
    setDeleteSessionId(sessionId);
    setShowDeleteDialog(true);
  };
  
  // Handle deleting a session
  const handleDeleteSession = async () => {
    if (!deleteSessionId) {
      toast({
        title: "Error",
        description: "No session selected for deletion.",
        variant: "destructive"
      });
      return;
    }
    
    setDeletingSession(true);
    
    try {
      const success = await deleteCohortSession(deleteSessionId);
      
      if (success) {
        // Update the sessions list
        setSessions(prev => prev.filter(session => session.id !== deleteSessionId));
        
        toast({
          title: "Session Deleted",
          description: "The session has been deleted successfully."
        });
        
        setShowDeleteDialog(false);
      } else {
        throw new Error("Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error deleting session",
        description: "There was a problem deleting the session.",
        variant: "destructive"
      });
    } finally {
      setDeletingSession(false);
    }
  };
  
  // Handle opening the attendance dialog
  const handleOpenAttendanceDialog = async (sessionId: string) => {
    setSelectedAttendanceSessionId(sessionId);
    setAttendanceState(prev => ({ ...prev, loading: true }));
    
    try {
      // Get cohort learners
      const learners = await getCohortLearners(cohortId);
      console.log("Learners:", learners);
      
      // Get existing attendance records
      const existingAttendance = await getSessionAttendance(sessionId);
      console.log("Existing attendance:", existingAttendance);
      
      // Create attendance records for each learner
      const attendanceRecords = learners.map(learner => {
        // Find existing record if any
        const existingRecord = existingAttendance.find(
          record => record.cohort_learner_id === learner.id
        );
        
        // Map 'late' and 'excused' to 'absent' for backward compatibility
        let status = 'absent';
        if (existingRecord) {
          status = existingRecord.status === 'present' ? 'present' : 'absent';
        }
        
        return {
          cohort_learner_id: learner.id,
          status: status as 'present' | 'absent',
          learner_name: `${learner.user.first_name || ''} ${learner.user.last_name || ''}`.trim() || learner.user.email
        };
      });
      
      setAttendanceState({
        attendanceRecords,
        loading: false
      });
      
      setShowAttendanceDialog(true);
    } catch (error) {
      console.error("Error preparing attendance dialog:", error);
      toast({
        title: "Error loading attendance",
        description: "Could not load learners or attendance records.",
        variant: "destructive"
      });
      setAttendanceState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Handle attendance status change
  const handleAttendanceStatusChange = (learnerId: string, isPresent: boolean) => {
    setAttendanceState(prev => ({
      ...prev,
      attendanceRecords: prev.attendanceRecords.map(record => 
        record.cohort_learner_id === learnerId ? 
        { ...record, status: isPresent ? 'present' : 'absent' } : 
        record
      )
    }));
  };
  
  // Add function to mark all as present or absent
  const handleMarkAll = (status: 'present' | 'absent') => {
    setAttendanceState(prev => ({
      ...prev,
      attendanceRecords: prev.attendanceRecords.map(record => ({
        ...record,
        status
      }))
    }));
  };
  
  // Handle saving attendance
  const handleSaveAttendance = async () => {
    if (!selectedAttendanceSessionId) return;
    
    setSavingAttendance(true);
    
    try {
      // Ensure we only send 'present' or 'absent' status values
      const attendanceData: SessionAttendanceDto = {
        attendance: attendanceState.attendanceRecords.map(record => ({
          cohort_learner_id: record.cohort_learner_id,
          status: record.status === 'present' ? 'present' : 'absent'
        }))
      };
      
      const result = await recordSessionAttendance(selectedAttendanceSessionId, attendanceData);
      
      if (result) {
        toast({
          title: "Attendance recorded",
          description: "Session attendance has been successfully recorded.",
        });
        
        setShowAttendanceDialog(false);
      } else {
        throw new Error("Failed to record attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error recording attendance",
        description: "Failed to save attendance records. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingAttendance(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-140px)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <RotateCw className="h-6 w-6 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading sessions...</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="w-full h-[calc(100vh-140px)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <X className="h-6 w-6 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
            <Button onClick={() => window.location.reload()} className="mt-2">Try Again</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-[calc(100vh-140px)] overflow-hidden flex flex-col">
      {/* Tabs and header */}
      <div className="flex justify-between items-center mb-4 px-4 pt-4">
        <div>
          <div className="flex space-x-1">
            <Button
              variant={activeTab === "upcoming" ? "default" : "outline"}
              className="text-xs md:text-sm h-8 px-3"
              onClick={() => setActiveTab("upcoming")}
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Upcoming Sessions</span>
              <span className="sm:hidden">Upcoming</span>
            </Button>
            <Button
              variant={activeTab === "past" ? "default" : "outline"}
              className="text-xs md:text-sm h-8 px-3"
              onClick={() => setActiveTab("past")}
            >
              <Video className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Past Sessions</span>
              <span className="sm:hidden">Past</span>
            </Button>
          </div>
        </div>
        
        <Button onClick={() => setShowScheduleDialog(true)} className="text-xs md:text-sm h-8 px-3">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          <span className="hidden sm:inline">Schedule Session</span>
          <span className="sm:hidden">Schedule</span>
        </Button>
      </div>
      
      {/* Sessions and Calendar */}
      <div className="flex flex-col lg:flex-row gap-4 w-full h-[calc(100vh-200px)] overflow-hidden px-4 pb-4">
        {/* Left side: Sessions list */}
        <div className="w-full lg:flex-1 h-full overflow-y-auto custom-scrollbar pr-2">
          {/* Upcoming Sessions Tab */}
          {activeTab === "upcoming" && (
            <div className="space-y-3 w-full">
              {filteredUpcomingSessions.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium mb-1">No upcoming sessions available</h3>
                  <p className="text-sm text-muted-foreground">There are currently no upcoming sessions scheduled for this cohort.</p>
                  <p className="text-sm text-muted-foreground mt-1">Click on "Schedule Session" to create a new session.</p>
                </div>
              ) : (
                filteredUpcomingSessions.map((session) => (
                  <Card key={session.id} className="overflow-hidden border">
                    <CardContent className="p-0">
                      <div className="p-3">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold line-clamp-1">{session.title}</h3>
                            <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              {formatDate(session.session_date)} • {formatTime(session.session_date, session.session_time)} • {session.duration_minutes} minutes
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <User2 className="h-3 w-3 flex-shrink-0" />
                              <span className="line-clamp-1">Instructor: {session.trainer?.first_name} {session.trainer?.last_name}</span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col gap-1.5 flex-shrink-0">
                            <Button className="gap-1.5 text-xs h-8 flex-1" asChild>
                              <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Video className="h-3 w-3" />
                                <span className="hidden sm:inline">Join Session</span>
                              </a>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0.5">
                            Upcoming
                          </Badge>
                          <div className="flex gap-1.5">
                            <Button
                              variant="outline"
                              className="gap-1.5 text-xs h-8 flex-1"
                              onClick={() => handleOpenAttendanceDialog(session.id)}
                            >
                              <ClipboardCheck className="h-3 w-3" />
                              <span className="hidden sm:inline">Attendance</span>
                            </Button>
                            <Button variant="outline" className="gap-1.5 text-xs h-8 flex-1" onClick={() => handleOpenSummaryDialog(session.id)}>
                              <FileText className="h-3 w-3" />
                              <span className="hidden sm:inline">Summary</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => handleOpenEditDialog(session)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleOpenDeleteDialog(session.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
          
          {/* Past Sessions Tab */}
          {activeTab === "past" && (
            <div className="space-y-3">
              {filteredPastSessions.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium mb-1">No past sessions available</h3>
                  <p className="text-sm text-muted-foreground">There are no completed sessions for this cohort yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Past sessions will appear here once they are marked as completed.</p>
                </div>
              ) : (
                filteredPastSessions.map((session) => (
                  <Card key={session.id} className="overflow-hidden border">
                    <CardContent className="p-0">
                      <div className="p-3">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold line-clamp-1">{session.title}</h3>
                            <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              {formatDate(session.session_date)} • {formatTime(session.session_date, session.session_time)} • {session.duration_minutes} minutes
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <User2 className="h-3 w-3 flex-shrink-0" />
                              <span className="line-clamp-1">Instructor: {session.trainer?.first_name} {session.trainer?.last_name}</span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col gap-1.5 flex-shrink-0">
                            {session.recording_link ? (
                              <Button variant="outline" className="gap-1.5 text-xs h-8 flex-1" asChild>
                                <a href={session.recording_link} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-3 w-3" />
                                  <span className="hidden sm:inline">Watch</span>
                                </a>
                              </Button>
                            ) : (
                              <Button variant="outline" className="gap-1.5 text-xs h-8 flex-1" disabled>
                                <Video className="h-3 w-3" />
                                <span className="hidden sm:inline">No Recording</span>
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-xs py-0.5">
                            Completed
                          </Badge>
                          <div className="flex gap-1.5">
                            <Button
                              variant="outline"
                              className="gap-1.5 text-xs h-8 flex-1"
                              onClick={() => handleOpenAttendanceDialog(session.id)}
                            >
                              <ClipboardCheck className="h-3 w-3" />
                              <span className="hidden sm:inline">Attendance</span>
                            </Button>
                            <Button variant="outline" className="gap-1.5 text-xs h-8 flex-1" onClick={() => handleOpenSummaryDialog(session.id)}>
                              <FileText className="h-3 w-3" />
                              <span className="hidden sm:inline">Summary</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => handleOpenEditDialog(session)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleOpenDeleteDialog(session.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Right side: Calendar */}
        <div className="hidden lg:block w-80 h-full flex-shrink-0 overflow-y-auto custom-scrollbar">
          <div className="border rounded-md overflow-hidden bg-card">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">
                {filteredUpcomingSessions.length} Upcoming Sessions
                {filteredUpcomingSessions.length === 0 && (
                  <span className="block text-sm font-normal text-muted-foreground mt-1">
                    No upcoming sessions scheduled
                  </span>
                )}
              </h3>
              
              <div className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h4 className="text-sm font-medium">
                  {format(currentMonth, 'MMMM yyyy')}
                </h4>
                <button onClick={handleNextMonth} className="text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-xs font-medium text-muted-foreground h-8 flex items-center justify-center">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "h-8 flex items-center justify-center text-xs rounded-full",
                      day.isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                      day.isToday && "border border-primary",
                      day.hasSession && "bg-blue-500 text-white font-medium",
                      day.date === selectedDate && "ring-2 ring-primary",
                      "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => {
                      if (day.date === selectedDate) {
                        setSelectedDate(null);
                      } else if (day.date instanceof Date) {
                        // Format the date to string in YYYY-MM-DD format
                        const dateStr = day.date.toISOString().split('T')[0];
                        setSelectedDate(dateStr);
                      }
                    }}
                  >
                    {day.day}
                  </div>
                ))}
              </div>
            </div>
            
            {selectedDate && (
              <div className="border-t p-4">
                <h4 className="text-sm font-medium mb-2">Sessions on {selectedDate}</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {sessions
                    .filter(session => session.session_date === selectedDate)
                    .map(session => (
                      <div key={session.id} className="text-xs p-2 border rounded-md">
                        <div className="font-medium mb-1">{session.title}</div>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(session.session_date, session.session_time)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Session Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule a New Session</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateSession();
          }}>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="session-name" className="text-sm font-medium">
                  Session Title<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="session-name"
                  placeholder="Enter session title"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-500">Session title is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="session-description"
                  placeholder="Enter session description"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-date" className="text-sm font-medium">
                    Date<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="session-date"
                    type="date"
                    value={newSession.session_date}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      setNewSession({ ...newSession, session_date: dateValue });
                      if (dateValue) {
                        const [year, month, day] = dateValue.split('-').map(Number);
                        setSessionDate(new Date(year, month - 1, day));
                      } else {
                        setSessionDate(undefined);
                      }
                    }}
                    className={formErrors.date ? "border-red-500" : ""}
                  />
                  {formErrors.date && (
                    <p className="text-xs text-red-500">Date is required</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-time" className="text-sm font-medium">
                    Time<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="session-time"
                    type="time"
                    value={newSession.session_time}
                    onChange={(e) => setNewSession({ ...newSession, session_time: e.target.value })}
                    className={formErrors.time ? "border-red-500" : ""}
                  />
                  {formErrors.time && (
                    <p className="text-xs text-red-500">Time is required</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium">
                    Duration (minutes)<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    placeholder="120"
                    value={newSession.duration_minutes}
                    onChange={(e) => setNewSession({ ...newSession, duration_minutes: parseInt(e.target.value) })}
                    className={formErrors.duration ? "border-red-500" : ""}
                  />
                  {formErrors.duration && (
                    <p className="text-xs text-red-500">Duration is required</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trainer" className="text-sm font-medium">
                    Trainer<span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={newSession.trainer_id || ""} 
                    onValueChange={(value) => setNewSession({ ...newSession, trainer_id: value || null })}
                    disabled={trainers.length === 0}
                  >
                    <SelectTrigger id="trainer" className={formErrors.trainer ? "border-red-500" : ""}>
                      <SelectValue placeholder={trainers.length === 0 ? "No trainers available" : "Select a trainer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingTrainers ? (
                        <SelectItem value="loading" disabled>
                          Loading trainers...
                        </SelectItem>
                      ) : trainers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No trainers assigned to this cohort
                        </SelectItem>
                      ) : (
                        trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.user_id}>
                            {trainer.first_name || trainer.email || 'Unknown Trainer'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.trainer && (
                    <p className="text-xs text-red-500">Trainer is required</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meeting-link" className="text-sm font-medium">
                  Meeting Link
                </Label>
                <Input
                  id="meeting-link"
                  placeholder="e.g., https://meet.google.com/abc-defg-hij"
                  value={newSession.meeting_link || ""}
                  onChange={(e) => setNewSession({ ...newSession, meeting_link: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setShowScheduleDialog(false)} className="mr-2">
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={schedulingSession}
                className="gap-2" 
              >
                {schedulingSession && <RotateCw className="h-4 w-4 animate-spin" />}
                Schedule Session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Summary</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveSummary();
          }}>
            {/* Tab Navigation */}
            <div className="flex border-b space-x-1 mb-4">
              <button
                type="button"
                onClick={() => setSessionSummary({...sessionSummary, activeTab: "content"})}
                className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  sessionSummary.activeTab === "content" 
                    ? "border-b-2 border-primary text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Content</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSessionSummary({...sessionSummary, activeTab: "resources"})}
                className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  sessionSummary.activeTab === "resources" 
                    ? "border-b-2 border-primary text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Resources</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSessionSummary({...sessionSummary, activeTab: "recordings"})}
                className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  sessionSummary.activeTab === "recordings" 
                    ? "border-b-2 border-primary text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Recordings</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSessionSummary({...sessionSummary, activeTab: "notes"})}
                className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  sessionSummary.activeTab === "notes" 
                    ? "border-b-2 border-primary text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Notes</span>
                </div>
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="space-y-4 mt-2">
              {/* Content Tab */}
              {sessionSummary.activeTab === "content" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="topics-covered" className="text-sm font-medium">
                      Topics Covered
                    </Label>
                    <Textarea
                      id="topics-covered"
                      placeholder="Enter topics covered in this session"
                      value={sessionSummary.topics_covered}
                      onChange={(e) => setSessionSummary({
                        ...sessionSummary,
                        topics_covered: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quick-recap" className="text-sm font-medium">
                      Quick Recap
                    </Label>
                    <Textarea
                      id="quick-recap"
                      placeholder="Enter a short recap of the session"
                      value={sessionSummary.quick_recap}
                      onChange={(e) => setSessionSummary({
                        ...sessionSummary,
                        quick_recap: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="summary" className="text-sm font-medium">
                      Summary
                    </Label>
                    <Textarea
                      id="summary"
                      placeholder="Enter a detailed summary of the session"
                      value={sessionSummary.summary}
                      onChange={(e) => setSessionSummary({
                        ...sessionSummary,
                        summary: e.target.value
                      })}
                      rows={4}
                    />
                  </div>
                </>
              )}
              
              {/* Resources Tab */}
              {sessionSummary.activeTab === "resources" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="class-files-url" className="text-sm font-medium">
                      Class Files URL
                    </Label>
                    <Input
                      id="class-files-url"
                      placeholder="Enter a URL to class files (e.g., GitHub repository)"
                      value={sessionSummary.class_files_url}
                      onChange={(e) => setSessionSummary({
                        ...sessionSummary,
                        class_files_url: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="action-points" className="text-sm font-medium">
                      Action Points
                    </Label>
                    <Textarea
                      id="action-points"
                      placeholder="Enter key action points from this session"
                      value={sessionSummary.action_points}
                      onChange={(e) => setSessionSummary({
                        ...sessionSummary,
                        action_points: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              {/* Recordings Tab */}
              {sessionSummary.activeTab === "recordings" && (
                <div className="space-y-2">
                  <Label htmlFor="recording-link" className="text-sm font-medium">
                    Recording Link
                  </Label>
                  <Input
                    id="recording-link"
                    placeholder="Enter the session recording URL"
                    value={sessionSummary.recording_link}
                    onChange={(e) => setSessionSummary({
                      ...sessionSummary,
                      recording_link: e.target.value
                    })}
                  />
                  
                  {sessionSummary.recording_link && (
                    <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
                      <h4 className="font-medium mb-2">Recording Preview</h4>
                      <a 
                        href={sessionSummary.recording_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Video className="h-4 w-4" />
                        <span>View Recording</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              {/* Notes Tab */}
              {sessionSummary.activeTab === "notes" && (
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes"
                    value={sessionSummary.notes}
                    onChange={(e) => setSessionSummary({
                      ...sessionSummary,
                      notes: e.target.value
                    })}
                    rows={8}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setShowSummaryDialog(false)} className="mr-2">
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={savingSummary}
                className="gap-2"
              >
                {savingSummary && <RotateCw className="h-4 w-4 animate-spin" />}
                Save Summary
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Session Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateSession();
          }}>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="edit-session-name" className="text-sm font-medium">
                  Session Title<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-session-name"
                  placeholder="Enter session title"
                  value={editingSession.title}
                  onChange={(e) => setEditingSession({ ...editingSession, title: e.target.value })}
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-500">Session title is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-session-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-session-description"
                  placeholder="Enter session description"
                  value={editingSession.description}
                  onChange={(e) => setEditingSession({ ...editingSession, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-session-date" className="text-sm font-medium">
                    Date<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-session-date"
                    type="date"
                    value={editingSession.session_date}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      setEditingSession({ ...editingSession, session_date: dateValue });
                    }}
                    className={formErrors.date ? "border-red-500" : ""}
                  />
                  {formErrors.date && (
                    <p className="text-xs text-red-500">Date is required</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-session-time" className="text-sm font-medium">
                    Time<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-session-time"
                    type="time"
                    value={editingSession.session_time}
                    onChange={(e) => setEditingSession({ ...editingSession, session_time: e.target.value })}
                    className={formErrors.time ? "border-red-500" : ""}
                  />
                  {formErrors.time && (
                    <p className="text-xs text-red-500">Time is required</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration" className="text-sm font-medium">
                    Duration (minutes)<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="15"
                    step="15"
                    placeholder="120"
                    value={editingSession.duration_minutes}
                    onChange={(e) => setEditingSession({ ...editingSession, duration_minutes: parseInt(e.target.value) })}
                    className={formErrors.duration ? "border-red-500" : ""}
                  />
                  {formErrors.duration && (
                    <p className="text-xs text-red-500">Duration is required</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-trainer" className="text-sm font-medium">
                    Trainer<span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={editingSession.trainer_id || ""} 
                    onValueChange={(value) => setEditingSession({ ...editingSession, trainer_id: value || null })}
                    disabled={trainers.length === 0}
                  >
                    <SelectTrigger id="edit-trainer" className={formErrors.trainer ? "border-red-500" : ""}>
                      <SelectValue placeholder={trainers.length === 0 ? "No trainers available" : "Select a trainer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingTrainers ? (
                        <SelectItem value="loading" disabled>
                          Loading trainers...
                        </SelectItem>
                      ) : trainers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No trainers assigned to this cohort
                        </SelectItem>
                      ) : (
                        trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.user_id}>
                            {trainer.first_name || trainer.email || 'Unknown Trainer'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.trainer && (
                    <p className="text-xs text-red-500">Trainer is required</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-meeting-link" className="text-sm font-medium">
                    Meeting Link
                  </Label>
                  <Input
                    id="edit-meeting-link"
                    placeholder="e.g., https://meet.google.com/abc-defg-hij"
                    value={editingSession.meeting_link || ""}
                    onChange={(e) => setEditingSession({ ...editingSession, meeting_link: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    Status<span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={editingSession.status || "scheduled"} 
                    onValueChange={(value) => setEditingSession({ ...editingSession, status: value as 'scheduled' | 'completed' })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setShowEditDialog(false)} className="mr-2">
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updatingSession}
                className="gap-2" 
              >
                {updatingSession && <RotateCw className="h-4 w-4 animate-spin" />}
                Update Session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Session Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-center">Are you sure you want to delete this session? This action cannot be undone.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="mr-2">
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteSession}
              disabled={deletingSession}
              className="gap-2"
            >
              {deletingSession && <RotateCw className="h-4 w-4 animate-spin" />}
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Attendance Dialog */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Session Attendance</DialogTitle>
          </DialogHeader>
          
          {attendanceState.loading ? (
            <div className="flex items-center justify-center py-8">
              <RotateCw className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : (
            <>
              <div className="flex justify-end space-x-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMarkAll('present')}
                >
                  Mark All Present
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMarkAll('absent')}
                >
                  Mark All Absent
                </Button>
              </div>

              <div className="grid gap-4 py-2">
                {attendanceState.attendanceRecords.length === 0 ? (
                  <p className="text-center text-muted-foreground">No learners found in this cohort.</p>
                ) : (
                  <div className="space-y-4">
                    {attendanceState.attendanceRecords.map((record) => (
                      <div key={record.cohort_learner_id} className="flex items-center justify-between border p-3 rounded-md">
                        <div className="font-medium">{record.learner_name}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`attendance-${record.cohort_learner_id}`} 
                              checked={record.status === 'present'}
                              onCheckedChange={(checked) => handleAttendanceStatusChange(
                                record.cohort_learner_id,
                                !!checked
                              )}
                            />
                            <Label 
                              htmlFor={`attendance-${record.cohort_learner_id}`}
                              className="text-sm cursor-pointer"
                            >
                              Present
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveAttendance} 
                  disabled={savingAttendance || attendanceState.attendanceRecords.length === 0}
                >
                  {savingAttendance && <RotateCw className="mr-2 h-4 w-4 animate-spin" />}
                  Save Attendance
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </div>
  );
} 


