"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Upload, File, Calendar, Clock, RotateCw, X, Check, ArrowUpCircle, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CohortSession, 
  getCohortSessions, 
  getUserSessionNotes,
  addLearnerNotes,
  updateLearnerNotes,
  LearnerNotes
} from "@/lib/api/cohort-sessions";

interface SessionNotesTabProps {
  cohortId: string;
}

export function SessionNotesTab({ cohortId }: SessionNotesTabProps) {
  const [sessions, setSessions] = useState<CohortSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<CohortSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [existingNotes, setExistingNotes] = useState<LearnerNotes | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch sessions data
  useEffect(() => {
    const fetchSessions = async () => {
      if (!cohortId) return;
      
      try {
        setLoading(true);
        setErrorMessage(null);
        
        const sessionsData = await getCohortSessions(cohortId);
        setSessions(sessionsData);
        
        // Filter completed sessions
        const completed = sessionsData.filter(session => session.status === 'completed');
        setCompletedSessions(completed);
        
        // Select first completed session by default if available
        if (completed.length > 0 && !selectedSessionId) {
          setSelectedSessionId(completed[0].id);
          fetchUserNotes(completed[0].id);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setErrorMessage("Failed to load sessions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [cohortId]);

  // Fetch user notes for the selected session
  const fetchUserNotes = async (sessionId: string) => {
    if (!sessionId) return;
    
    try {
      // Use 'me' as the userId - backend will replace with authenticated user's ID
      const notes = await getUserSessionNotes(sessionId, 'me');
      
      if (notes) {
        setExistingNotes(notes);
        setNoteFile(null);
      } else {
        setExistingNotes(null);
        setNoteFile(null);
      }
    } catch (error) {
      console.error("Error fetching user notes:", error);
      toast({
        title: "Error",
        description: "Failed to load your notes for this session.",
        variant: "destructive"
      });
    }
  };

  // Handle session selection
  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    fetchUserNotes(sessionId);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNoteFile(file);
    
    if (file) {
      toast({
        title: "File selected",
        description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`
      });
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!selectedSessionId) {
      toast({
        title: "Error",
        description: "Please select a session.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      if (!noteFile) {
        toast({
          title: "Error",
          description: "Please select a file to upload.",
          variant: "destructive"
        });
        return;
      }

      console.log(`Uploading notes for session ${selectedSessionId}`);
      console.log(`File selected: ${noteFile.name}, size: ${noteFile.size}`);

      let result;
      
      // Always use updateLearnerNotes with 'me' as the userId
      // This will work for both new and existing notes
      console.log(`Using updateLearnerNotes for session ${selectedSessionId}`);
      result = await updateLearnerNotes(
        selectedSessionId,
        'me', // Use 'me' - backend will replace with authenticated user's ID
        { notes_content: "" },  // This will be replaced with file content in the API function
        noteFile
      );

      console.log("Notes upload result:", result);

      if (result) {
        toast({
          title: "Success",
          description: existingNotes 
            ? "Your file has been updated successfully." 
            : "Your file has been uploaded successfully! You earned 5 points for submitting session notes.",
          variant: "default"
        });
        
        // Refresh notes to get the updated data
        fetchUserNotes(selectedSessionId);
      } else {
        throw new Error("Failed to save notes");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to upload your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format time
  const formatTime = (dateString: string, timeString?: string) => {
    if (timeString) {
      return timeString;
    }
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Handle file download
  const handleDownload = async (url: string) => {
    try {
      // Check if URL is valid
      if (!url) {
        toast({
          title: "Error",
          description: "File URL is not available. Please try uploading the file again.",
          variant: "destructive"
        });
        return;
      }

      // Create a signed URL for the file
      const fileName = url.split('/').pop() || '';
      const signedUrl = url + "?download=" + encodeURIComponent(fileName);

      // Try to fetch the file first
      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create object URL
      const objectUrl = URL.createObjectURL(blob);

      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName; // This will force download instead of opening in new tab
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(objectUrl);
      
      toast({
        title: "Success",
        description: "File download started.",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <RotateCw className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <X className="h-8 w-8 text-destructive" />
        <p className="mt-4 text-destructive">{errorMessage}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // No completed sessions
  if (completedSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No completed sessions available for notes.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Notes can only be added to sessions that have been marked as completed.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-140px)] overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Session Files</h2>
        <p className="text-sm text-muted-foreground">
          Upload files for completed sessions such as notes, assignments, or other resources.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Completed Sessions</CardTitle>
              <CardDescription className="text-sm">Select a session to add or view your files</CardDescription>
            </CardHeader>
            <CardContent className="px-1">
              <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
                {completedSessions.map(session => (
                  <Button
                    key={session.id}
                    variant={selectedSessionId === session.id ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto py-2 px-3 ${
                      selectedSessionId === session.id ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => handleSessionChange(session.id)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{session.title}</span>
                      <div className="flex items-center text-xs mt-1 space-x-2">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(session.session_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatTime(session.session_date, session.session_time)}</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">
                {selectedSessionId && 
                  sessions.find(s => s.id === selectedSessionId)?.title || 
                  "Session Files"
                }
              </CardTitle>
              <CardDescription className="text-sm">
                {selectedSessionId && 
                  `${formatDate(sessions.find(s => s.id === selectedSessionId)?.session_date || "")} • 
                  ${formatTime(
                    sessions.find(s => s.id === selectedSessionId)?.session_date || "", 
                    sessions.find(s => s.id === selectedSessionId)?.session_time
                  )}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {existingNotes?.notes_upd ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Your uploaded notes</p>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {formatDate(existingNotes.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      onClick={() => existingNotes?.notes_upd && handleDownload(existingNotes.notes_upd)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <div>
                    <Label>Upload new version</Label>
                    <div className="mt-2">
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.md"
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Upload your notes</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.md"
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            
            {selectedSessionId && (
              <CardFooter className="justify-between">
                <div>
                  {existingNotes?.notes_upd && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Last updated: {new Date(existingNotes.uploaded_at).toLocaleString()}
                    </Badge>
                  )}
                </div>
                <Button 
                  onClick={handleSaveNotes} 
                  disabled={submitting || !noteFile}
                >
                  {submitting ? (
                    <>
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : existingNotes?.notes_upd ? (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Update File
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      
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
      `}</style>
    </div>
  );
} 