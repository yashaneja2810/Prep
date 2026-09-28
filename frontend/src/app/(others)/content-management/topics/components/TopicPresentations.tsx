"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isValidPPTFile, getPPTFileSize, PPT } from "@/lib/api/ppt";
import { usePPTsByTopic, usePPTMutations } from "@/hooks/usePPTs";

interface TopicPresentationsProps {
  topicId?: string;
  isEditMode: boolean;
}

export function TopicPresentations({ topicId, isEditMode }: TopicPresentationsProps) {
  const [currentPresentation, setCurrentPresentation] = useState({
    title: "",
    description: "",
    file: null as File | null
  });

  // Use our new hooks
  const { ppts, isLoading, error, mutate } = usePPTsByTopic(topicId || '');
  const { uploadTopicFile, remove } = usePPTMutations();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidPPTFile(file)) {
      toast.error("Please upload a valid presentation file (PPT, PPTX, PDF, DOC, DOCX)");
      return;
    }

    // Validate file size (10MB max)
    const fileSizeMB = getPPTFileSize(file);
    if (fileSizeMB > 10) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setCurrentPresentation(prev => ({
      ...prev,
      file
    }));
  };

  const handleAddPresentation = async () => {
    if (!topicId) {
      toast.error("Topic ID is required to upload presentations");
      return;
    }

    if (!currentPresentation.title.trim() || !currentPresentation.file) {
      toast.error("Please provide a title and select a file");
      return;
    }

    try {
      // Upload the file with title and description
      await uploadTopicFile(
        topicId, 
        currentPresentation.file, 
        currentPresentation.title,
        currentPresentation.description || undefined
      );
      
      // Reset form on success
      setCurrentPresentation({
        title: "",
        description: "",
        file: null
      });

      // Refresh the presentations list
      mutate();
      
      toast.success("Presentation uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload presentation");
    }
  };

  const handleRemovePresentation = async (id: string) => {
    try {
      await remove(id);
      mutate(); // Refresh the list
      toast.success("Presentation deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete presentation");
    }
  };

  if (!topicId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Please save the topic first to add presentations.</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load presentations. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isEditMode && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                placeholder="Presentation Title"
                value={currentPresentation.title}
                onChange={(e) => setCurrentPresentation(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="file"
                accept=".ppt,.pptx,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <Textarea
            placeholder="Presentation Description (Optional)"
            value={currentPresentation.description}
            onChange={(e) => setCurrentPresentation(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-[100px]"
          />
          <Button
            onClick={handleAddPresentation}
            disabled={!currentPresentation.title || !currentPresentation.file}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Presentation
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Added Presentations</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Loading presentations...</p>
        ) : error ? (
          <p className="text-destructive">Error loading presentations</p>
        ) : ppts && ppts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ppts.map((presentation) => (
              <Card key={presentation.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {presentation.title}
                  </CardTitle>
                  {isEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePresentation(presentation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {presentation.description && (
                    <p className="text-sm text-muted-foreground mb-2">{presentation.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <a 
                      href={presentation.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {presentation.file_name || "View Presentation"}
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {presentation.file_size && `${(presentation.file_size / (1024 * 1024)).toFixed(2)} MB`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No presentations added yet</p>
        )}
      </div>
    </div>
  );
} 