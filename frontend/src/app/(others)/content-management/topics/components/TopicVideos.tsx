"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Trash2, Video, Loader2 } from "lucide-react";
import { Video as VideoType, formatDuration } from "@/lib/api/videos";
import { useVideosByTopic, useVideoMutations } from "@/hooks/useVideos";

interface TopicVideosProps {
  topicId?: string;
  isEditMode?: boolean;
}

export function TopicVideos({ topicId, isEditMode = false }: TopicVideosProps) {
  // Use our custom hooks instead of direct API calls
  const { 
    videos, 
    isLoading, 
    error, 
    mutate: refreshVideos,
    filteredVideos
  } = useVideosByTopic(topicId || null);

  const {
    uploadVideo,
    deleteVideo: deleteVideoMutation,
    isSubmitting
  } = useVideoMutations();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentVideo, setCurrentVideo] = useState({
    title: "",
    duration: 0,
    transcript: "",
    summary: "",
    timestamps: "",
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setCurrentVideo(prev => ({
          ...prev,
          file,
          title: file.name // Set title to filename by default
        }));
      } else {
        console.error("Invalid file type");
        // Toast is handled by the error handler in the hook
      }
    }
  };

  const handleAddVideo = async () => {
    if (!currentVideo.title.trim() || !currentVideo.file || !topicId) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", currentVideo.file);
      formData.append("topic_id", topicId);
      formData.append("title", currentVideo.title);
      formData.append("duration", currentVideo.duration.toString());
      formData.append("transcript", currentVideo.transcript);
      formData.append("summary", currentVideo.summary);
      formData.append("timestamps", currentVideo.timestamps);

      await uploadVideo(formData);
      
      // Reset form
      setCurrentVideo({
        title: "",
        duration: 0,
        transcript: "",
        summary: "",
        timestamps: "",
        file: null
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Refresh the videos list
      refreshVideos();
    } catch (error) {
      console.error("Failed to add video:", error);
    }
  };

  const handleRemoveVideo = async (id: string) => {
    try {
      await deleteVideoMutation(id);
      refreshVideos();
    } catch (error) {
      console.error("Failed to remove video:", error);
    }
  };

  if (!topicId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Please save the topic first to add videos.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading videos...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8 bg-destructive/10 rounded-md border border-dashed border-destructive">
          <p className="text-destructive">Error loading videos: {error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refreshVideos()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Video</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video">Video File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Choose Video
                </Button>
              </div>
              {currentVideo.file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {currentVideo.file.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={currentVideo.title}
                onChange={(e) => setCurrentVideo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={currentVideo.duration}
                onChange={(e) => setCurrentVideo(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                placeholder="Enter duration in seconds..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transcript">Transcript</Label>
              <Textarea
                id="transcript"
                value={currentVideo.transcript}
                onChange={(e) => setCurrentVideo(prev => ({ ...prev, transcript: e.target.value }))}
                placeholder="Enter video transcript..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={currentVideo.summary}
                onChange={(e) => setCurrentVideo(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Enter video summary..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timestamps">Timestamps</Label>
              <Textarea
                id="timestamps"
                value={currentVideo.timestamps}
                onChange={(e) => setCurrentVideo(prev => ({ ...prev, timestamps: e.target.value }))}
                placeholder="Enter timestamps (e.g., 00:00 Introduction&#10;02:30 Variables)"
                rows={3}
              />
            </div>
            <Button onClick={handleAddVideo} disabled={isSubmitting || !currentVideo.title.trim() || !currentVideo.file}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Add Video
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVideos.length === 0 ? (
            <p className="text-muted-foreground">No videos added yet.</p>
          ) : (
            <div className="space-y-4">
              {filteredVideos.map((video) => (
                <div key={video.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      Duration: {formatDuration(video.duration)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVideo(video.id)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 