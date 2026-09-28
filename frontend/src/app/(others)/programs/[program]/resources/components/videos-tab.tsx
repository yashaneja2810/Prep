"use client";

import { useState, useEffect, useRef } from "react";
import { Video, Play, Clock, ChevronRight, FileText, Book, Terminal, Bookmark, BookmarkCheck, X, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/apiClient";

interface TabProps {
  topicId: string;
}

interface Video {
  id: string;
  title: string;
  url: string;
  duration?: number;
  summary?: string;
  transcript?: string;
  timestamps?: string;
  topic_id: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  data: Video[];
  statusCode: number;
  success: boolean;
  message: string;
}

export function VideosTab({ topicId }: TabProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState("transcript");
  const contentRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isExtraSmallScreen, setIsExtraSmallScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  
  // Fetch videos from the API
  useEffect(() => {
    const fetchVideos = async () => {
      if (!topicId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<ApiResponse>(`/api/topics/${topicId}/videos`);
        
        if (response.data.success && response.data.data.length > 0) {
          setVideos(response.data.data);
          // Auto-select the first video
          setSelectedVideo(response.data.data[0]);
        } else {
          setVideos([]);
          setSelectedVideo(null);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
        setVideos([]);
        setSelectedVideo(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [topicId]);
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024); // lg breakpoint
      setIsExtraSmallScreen(window.innerWidth < 640); // sm breakpoint
      setIsMediumScreen(window.innerWidth < 884 && window.innerWidth >= 640); // specific 884px breakpoint
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
      @media (max-width: 1024px) {
        .video-container {
          display: flex !important;
          flex-direction: column !important;
          gap: 1rem !important;
        }
        
        .video-player-container {
          order: 1 !important;
          width: 100% !important;
        }
        
        .video-list-card {
          order: 0 !important;
          margin-bottom: 0 !important;
          width: 100% !important;
        }
      }
      
      /* Specific fix for 884px breakpoint */
      @media (max-width: 884px) {
        .video-container {
          display: block !important;
        }
        
        .medium-screen-layout {
          display: grid !important;
          grid-template-columns: 1fr !important;
        }
        
        .medium-screen-layout .video-player-container {
          order: 1 !important;
        }
        
        .medium-screen-layout .video-list-card {
          order: 0 !important;
        }
        
        .video-player-container {
          width: 100% !important;
          margin-bottom: 1rem !important;
        }
        
        .video-list-card {
          width: 100% !important;
        }
        
        .video-player-aspect {
          height: auto !important;
          max-height: 400px !important;
        }
        
        .video-player-title {
          font-size: 1rem !important;
        }
        
        .video-player-description {
          font-size: 0.8125rem !important;
        }
        
        .video-tabs-height {
          height: 280px !important;
        }
      }
      
      @media (max-width: 952px) {
        .video-main-container {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }
        
        .video-header {
          margin-bottom: 1rem !important;
        }
        
        .video-title {
          font-size: 1.5rem !important;
        }
        
        .video-description {
          font-size: 0.875rem !important;
        }
      }
      
      @media (max-width: 640px) {
        .video-main-container {
          padding-left: 0.5rem !important;
          padding-right: 0.5rem !important;
        }
        
        .video-header {
          margin-bottom: 0.75rem !important;
        }
        
        .video-title {
          font-size: 1.25rem !important;
          line-height: 1.5 !important;
        }
        
        .video-description {
          font-size: 0.75rem !important;
        }
        
        .video-card-content {
          padding: 0.75rem !important;
        }
        
        .video-tabs-height {
          height: 200px !important;
        }
        
        .video-list-height {
          height: 200px !important;
        }
        
        .video-tab-trigger {
          padding: 0.25rem 0.5rem !important;
        }
        
        .video-player-title {
          font-size: 0.875rem !important;
        }
        
        .video-player-description {
          font-size: 0.75rem !important;
        }
      }
      
      @media (max-width: 480px) {
        .video-tab-text {
          display: none !important;
        }
        
        .video-tab-icon {
          margin-right: 0 !important;
        }
        
        .video-card-content {
          padding: 0.5rem !important;
        }
        
        .video-tabs-height {
          height: 180px !important;
        }
        
        .video-list-height {
          height: 180px !important;
        }
        
        .video-play-button {
          height: 2rem !important;
          font-size: 0.7rem !important;
          padding-left: 0.5rem !important;
          padding-right: 0.5rem !important;
        }
      }
      
      @media (max-width: 360px) {
        .video-main-container {
          padding-left: 0.25rem !important;
          padding-right: 0.25rem !important;
        }
        
        .video-card-content {
          padding: 0.375rem !important;
        }
        
        .video-tabs-height {
          height: 150px !important;
        }
        
        .video-list-height {
          height: 150px !important;
        }
        
        .video-list-item {
          padding: 0.375rem 0.5rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Load watched and bookmarked videos from localStorage
  useEffect(() => {
    const savedWatchedVideos = localStorage.getItem(`watched-videos-${topicId}`);
    const savedBookmarkedVideos = localStorage.getItem(`bookmarked-videos-${topicId}`);
    
    if (savedWatchedVideos) {
      setWatchedVideos(JSON.parse(savedWatchedVideos));
    }
    
    if (savedBookmarkedVideos) {
      setBookmarkedVideos(JSON.parse(savedBookmarkedVideos));
    }
  }, [topicId]);
  
  // When a video is selected, play it automatically
  useEffect(() => {
    if (videoPlayerRef.current && selectedVideo) {
      videoPlayerRef.current.load();
      // Auto-play the video when selected
      try {
        videoPlayerRef.current.play().catch(err => {
          console.log('Autoplay prevented:', err);
          // Autoplay might be prevented by browser policy
        });
      } catch (err) {
        console.error('Error playing video:', err);
      }
    }
  }, [selectedVideo]);
  
  const toggleWatched = (videoId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    let newWatchedVideos: string[];
    
    if (watchedVideos.includes(videoId)) {
      newWatchedVideos = watchedVideos.filter(id => id !== videoId);
    } else {
      newWatchedVideos = [...watchedVideos, videoId];
    }
    
    setWatchedVideos(newWatchedVideos);
    localStorage.setItem(`watched-videos-${topicId}`, JSON.stringify(newWatchedVideos));
  };
  
  const toggleBookmark = (videoId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    let newBookmarkedVideos: string[];
    
    if (bookmarkedVideos.includes(videoId)) {
      newBookmarkedVideos = bookmarkedVideos.filter(id => id !== videoId);
    } else {
      newBookmarkedVideos = [...bookmarkedVideos, videoId];
    }
    
    setBookmarkedVideos(newBookmarkedVideos);
    localStorage.setItem(`bookmarked-videos-${topicId}`, JSON.stringify(newBookmarkedVideos));
  };
  
  const playVideo = (video: Video) => {
    // Don't mark as watched anymore
    setSelectedVideo(video);
  };
  
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Disable right-click on video
  useEffect(() => {
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const videoElement = videoPlayerRef.current;
    if (videoElement) {
      videoElement.addEventListener('contextmenu', disableRightClick);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('contextmenu', disableRightClick);
      }
    };
  }, [selectedVideo]);
  
  // Toggle play/pause when video is clicked
  const togglePlayPause = () => {
    if (videoPlayerRef.current) {
      if (videoPlayerRef.current.paused) {
        videoPlayerRef.current.play().catch(err => {
          console.log('Play prevented:', err);
        });
      } else {
        videoPlayerRef.current.pause();
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading videos...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div 
        ref={contentRef}
        className="w-full flex-1 overflow-y-auto scrollbar-thin pb-6"
      >
        <div className="p-2 sm:p-3 md:p-4 pl-8 sm:pl-10 w-full max-w-none video-main-container">
          {/* Videos header */}
          
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Video content */}
          {videos.length > 0 ? (
            <div className="w-full">
              {/* Video Player and Video List - Responsive Layout */}
              <div className={`grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full video-container ${isMediumScreen ? 'medium-screen-layout' : ''}`}>
                {/* Video Player */}
                <div className="lg:col-span-3 space-y-4 sm:space-y-6 w-full video-player-container">
                  {selectedVideo && (
                    <>
                      <Card className="border overflow-hidden bg-background w-full">
                        <div className="aspect-video relative overflow-hidden bg-muted w-full video-player-aspect">
                          <video 
                            ref={videoPlayerRef}
                            className="w-full h-full"
                            controls
                            controlsList="nodownload nofullscreen"
                            disablePictureInPicture
                            poster="/placeholder.jpg"
                            onContextMenu={(e) => e.preventDefault()}
                            onClick={togglePlayPause}
                          >
                            <source src={selectedVideo.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <CardContent className="p-3 sm:p-4 video-card-content">
                          <div className="flex items-center justify-between">
                            <h2 className="text-base sm:text-xl font-semibold video-player-title">{selectedVideo.title}</h2>
                            {selectedVideo.duration && (
                              <Badge variant="outline" className="flex items-center gap-1 ml-2">
                                <Clock className="h-3 w-3" />
                                {formatDuration(selectedVideo.duration)}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Transcript, Summary, and Timestamps Tabs */}
                      <Card className="w-full">
                        <CardHeader className="pb-0 w-full p-3 sm:p-4 video-card-content">
                          <Tabs defaultValue="transcript" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="transcript" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm video-tab-trigger">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 video-tab-icon" />
                                <span className="video-tab-text">Transcript</span>
                              </TabsTrigger>
                              <TabsTrigger value="summary" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm video-tab-trigger">
                                <Book className="h-3 w-3 sm:h-4 sm:w-4 mr-1 video-tab-icon" />
                                <span className="video-tab-text">Summary</span>
                              </TabsTrigger>
                              <TabsTrigger value="timestamps" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm video-tab-trigger">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 video-tab-icon" />
                                <span className="video-tab-text">Timestamps</span>
                              </TabsTrigger>
                            </TabsList>
                            
                            <div className="w-full border-t pt-3 sm:pt-4 relative">
                              {/* Fixed height container to prevent layout shifts */}
                              <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full relative video-tabs-height">
                                <TabsContent value="transcript" className="w-full m-0 absolute inset-0">
                                  <ScrollArea className="h-full w-full pr-4">
                                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line w-full">
                                      {selectedVideo.transcript || "No transcript available for this video."}
                                    </div>
                                  </ScrollArea>
                                </TabsContent>
                                
                                <TabsContent value="summary" className="w-full m-0 absolute inset-0">
                                  <ScrollArea className="h-full w-full pr-4">
                                    <div className="text-xs sm:text-sm leading-relaxed w-full">
                                      {selectedVideo.summary || "No summary available for this video."}
                                    </div>
                                  </ScrollArea>
                                </TabsContent>
                                
                                <TabsContent value="timestamps" className="w-full m-0 absolute inset-0">
                                  <ScrollArea className="h-full w-full pr-4">
                                    {selectedVideo.timestamps ? (
                                      <div className="space-y-2 text-xs sm:text-sm">
                                        <pre className="whitespace-pre-line font-sans">{selectedVideo.timestamps}</pre>
                                      </div>
                                    ) : (
                                      <div className="text-muted-foreground text-xs sm:text-sm">
                                        No timestamps available for this video.
                                      </div>
                                    )}
                                  </ScrollArea>
                                </TabsContent>
                              </div>
                            </div>
                          </Tabs>
                        </CardHeader>
                      </Card>
                    </>
                  )}
                </div>
                
                {/* Video List */}
                <div className="lg:col-span-1 w-full video-list-card">
                  <Card className="h-full">
                    <CardHeader className="pb-2 p-3 sm:p-4 video-card-content">
                      <CardTitle className="text-base sm:text-lg">All Videos</CardTitle>
                    </CardHeader>
                    <div className="h-[300px] sm:h-[400px] lg:h-[600px] w-full relative video-list-height">
                      <ScrollArea className="h-full w-full">
                        <div className="p-2">
                          {videos.map((video) => (
                            <div
                              key={video.id}
                              onClick={() => playVideo(video)}
                              className={cn(
                                "flex items-start gap-2 p-2 rounded-md cursor-pointer mb-2 transition-colors video-list-item",
                                selectedVideo?.id === video.id ? "bg-muted" : "hover:bg-muted/50"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-medium line-clamp-2">{video.title}</h4>
                                <div className="flex items-center mt-1 gap-2">
                                  {video.duration && (
                                    <span className="text-[9px] text-muted-foreground flex items-center">
                                      <Clock className="h-2.5 w-2.5 mr-0.5" />
                                      {formatDuration(video.duration)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 self-center" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>No videos available</AlertTitle>
              <AlertDescription>
                There are no videos available for this topic yet.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
} 