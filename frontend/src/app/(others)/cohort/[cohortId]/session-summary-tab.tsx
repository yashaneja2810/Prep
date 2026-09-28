"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CheckSquare, FileDigit, FileText, BookOpen, Github, ListChecks, FileImage, Film, Code, File, ExternalLink, Download, X } from "lucide-react";
import { CohortsSidebar } from "@/components/cohorts-sidebar";
import { useState, useEffect } from "react";
import { getSessionResources, SessionResource } from "@/lib/api/cohort-sessions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

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

interface LectureGroup {
  week: string;
  lectures: Lecture[];
}

interface SessionSummaryTabProps {
  lecture?: Lecture;
  lectureGroups?: LectureGroup[];
  onLectureSelect?: (lecture: Lecture) => void;
  cohortId: string;
}

// Resource Preview Component
const ResourcePreview = ({ sessionId }: { sessionId: string }) => {
  const [resources, setResources] = useState<SessionResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState<SessionResource | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      if (!sessionId) return;
      
      try {
        setIsLoading(true);
        const resourcesData = await getSessionResources(sessionId);
        setResources(resourcesData);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [sessionId]);

  // Get icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="h-5 w-5 text-blue-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'code':
        return <Code className="h-5 w-5 text-green-500" />;
      case 'image':
        return <FileImage className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle preview click
  const handlePreviewClick = (resource: SessionResource) => {
    if (resource.resource_type === 'video' || resource.resource_type === 'image') {
      setPreviewResource(resource);
    }
  };

  // Get embedded YouTube video ID from URL
  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Render preview content based on resource type
  const renderPreviewContent = () => {
    if (!previewResource) return null;

    if (previewResource.resource_type === 'video') {
      // Check if it's an external link (YouTube)
      if (previewResource.external_link) {
        const videoId = getYoutubeVideoId(previewResource.external_link);
        if (videoId) {
          return (
            <div className="w-full aspect-video">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoId}`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          );
        }
      }
      
      // If not YouTube or no external link, use the file URL if available
      if (previewResource.file_url) {
        return (
          <div className="w-full aspect-video">
            <video 
              controls 
              className="w-full h-full" 
              src={previewResource.file_url}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
    }
    
    if (previewResource.resource_type === 'image' && previewResource.file_url) {
      return (
        <div className="max-h-[70vh] flex items-center justify-center">
          <img 
            src={previewResource.file_url} 
            alt="Preview" 
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      );
    }
    
    return <p className="text-center p-4">No preview available</p>;
  };

  if (isLoading) {
    return <p className="text-muted-foreground italic">Loading resources...</p>;
  }

  if (resources.length === 0) {
    return <p className="text-muted-foreground italic">No resources available for this session.</p>;
  }

  return (
    <>
      <div className="space-y-4">
        {resources.map((resource) => (
          <div 
            key={resource.id} 
            className={`flex items-start p-3 rounded-md border bg-muted/30 hover:bg-muted transition-colors ${(resource.resource_type === 'video' || resource.resource_type === 'image') ? 'cursor-pointer' : ''}`}
            onClick={() => handlePreviewClick(resource)}
          >
            <div className="mr-3 mt-1">
              {getResourceIcon(resource.resource_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium capitalize mb-1">
                {resource.resource_type}
                {(resource.resource_type === 'video' || resource.resource_type === 'image') && 
                  <span className="ml-2 text-xs text-blue-500">(Click to preview)</span>
                }
              </h4>
              <div className="space-y-1">
                {resource.file_url && resource.resource_type !== 'video' && resource.resource_type !== 'image' && (
                  <div className="flex items-center text-sm">
                    <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a 
                      href={resource.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Uploaded File
                    </a>
                  </div>
                )}
                
                {resource.external_link && (
                  <div className="flex items-center text-sm">
                    <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a 
                      href={resource.external_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {resource.external_link}
                    </a>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Added on {new Date(resource.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewResource} onOpenChange={(open) => !open && setPreviewResource(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span className="capitalize">
                {previewResource?.resource_type} Preview
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {renderPreviewContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export function SessionSummaryTab({ lecture, lectureGroups = [], onLectureSelect, cohortId }: SessionSummaryTabProps) {
  // Handle empty state when no lecture is selected
  if (!lecture) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No session selected.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please select a session from the list or check back later for new sessions.
        </p>
      </div>
    );
  }
  
  // Add console log to see the lecture data
  console.log('Lecture data:', lecture);
  console.log('Topics covered:', lecture.topicsCovered);
  console.log('Action points:', lecture.actionPoints);
  
  return (
    <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
      {/* Sidebar with custom scrollbar - hide on mobile, show on md and up */}
      <div className="hidden md:block w-64 lg:w-80 flex-shrink-0 border-r pr-2 h-[calc(100vh-140px)] overflow-y-auto sidebar-scroll">
        <style jsx global>{`
          .sidebar-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          
          .content-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .content-scroll::-webkit-scrollbar-track {
            background: #e9e9e9;
            border-radius: 6px;
          }
          .content-scroll::-webkit-scrollbar-thumb {
            background: #2563eb;
            border-radius: 6px;
          }
          .content-scroll::-webkit-scrollbar-thumb:hover {
            background: #1d4ed8;
          }
        `}</style>
        {lectureGroups.length > 0 && onLectureSelect && (
          <CohortsSidebar 
            lectureGroups={lectureGroups} 
            selectedLectureId={lecture.id} 
            onLectureSelect={onLectureSelect} 
          />
        )}
      </div>
      
      {/* Content with custom scrollbar */}
      <div className="flex-grow w-full md:max-w-[calc(100%-16rem)] lg:max-w-[calc(100%-20rem)] p-4 h-[calc(100vh-140px)] overflow-y-auto content-scroll">
        {/* Combined Summary Card */}
        <Card className="w-full mb-6">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-xl md:text-2xl font-bold">{lecture.title}</CardTitle>
            <div className="text-sm text-muted-foreground mt-2">
              {lecture.lectureNumber && `Lecture ${lecture.lectureNumber} • `}{lecture.date}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Topics Covered */}
            {(!lecture.topicsCovered || lecture.topicsCovered.length === 0) ? (
              <div>
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Topics Covered
                </h3>
                <p className="text-muted-foreground italic">No topics covered information available.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Topics Covered
                </h3>
                <ul className="space-y-2">
                  {lecture.topicsCovered.map((topic, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="flex-1">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Points */}
            {(!lecture.actionPoints || lecture.actionPoints.length === 0) ? (
              <div>
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                  <CheckSquare className="h-5 w-5 text-amber-500" />
                  Action Points
                </h3>
                <p className="text-muted-foreground italic">No action points available.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                  <CheckSquare className="h-5 w-5 text-amber-500" />
                  Action Points
                </h3>
                <ul className="space-y-2">
                  {lecture.actionPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-amber-600">{index + 1}</span>
                      </div>
                      <span className="flex-1">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Recap */}
            {lecture.quickRecap && (
              <div>
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                  <FileDigit className="h-5 w-5 text-blue-500" />
                  Quick Recap
                </h3>
                <p className="break-words">{lecture.quickRecap}</p>
              </div>
            )}

            {/* Detailed Summary */}
            {lecture.summary && (
              <div>
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Detailed Summary
                </h3>
                <p className="whitespace-pre-line break-words">{lecture.summary}</p>
              </div>
            )}

            {/* Notes */}
            {lecture.notes && (
              <div>
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  Notes
                </h3>
                <p className="whitespace-pre-line break-words">{lecture.notes}</p>
              </div>
            )}

            {/* Session Resources */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                <File className="h-5 w-5 text-indigo-500" />
                Session Resources
              </h3>
              <ResourcePreview sessionId={lecture.sessionId} />
            </div>

            {/* Class Files */}
            {lecture.classFilesUrl && (
              <div>
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                  <Github className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                  Class Files
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <p className="text-muted-foreground mb-2 sm:mb-0">Access the code and files used during this lecture.</p>
                  <Button variant="outline" className="gap-2" asChild>
                    <a href={lecture.classFilesUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      <span>View Repository</span>
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 