"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Trash2, Image as ImageIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { Note } from "@/lib/api/notes";
import { useNotesByTopic, useNotesMutations } from "@/hooks/useNotes";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TopicNotesProps {
  topicId?: string;
  isEditMode?: boolean;
}

export function TopicNotes({ topicId, isEditMode = false }: TopicNotesProps) {
  const [currentContent, setCurrentContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<string>("write");

  // Use our new hooks
  const { notes, isLoading, error, mutate } = useNotesByTopic(topicId || null);
  const { 
    createNote, 
    updateNote, 
    deleteNote, 
    uploadTopicImage: uploadImage,
    isSubmitting,
    formErrors 
  } = useNotesMutations();

  // Get the first note (if any)
  const note = notes?.[0] || null;

  useEffect(() => {
    if (note) {
      setCurrentContent(note.content);
    } else {
      setCurrentContent("");
    }
  }, [note]);

  const handleSaveNote = async () => {
    if (!currentContent.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    if (!topicId) {
      toast.error("Topic ID is required");
      return;
    }

    try {
      if (note) {
        await updateNote(note.id, {
          content: currentContent,
          topic_id: topicId
        });
      } else {
        await createNote({
          topic_id: topicId,
          content: currentContent
        });
      }
      
      // Refresh notes list
      mutate();
      
      toast.success(note ? "Note updated successfully" : "Note created successfully");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleRemoveNote = async () => {
    if (!note) return;
    
    try {
      await deleteNote(note.id);
      setCurrentContent("");
      // Refresh notes list
      mutate();
      toast.success("Note removed successfully");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!topicId) return;
      
      const items = e.clipboardData?.items;
      
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
          e.preventDefault();
          setIsUploading(true);
          
          try {
            const file = items[i].getAsFile();
            if (!file) continue;
            
            toast.info("Uploading image...");
            
            // Upload image to server
            const response = await uploadImage(topicId, file);
            const imageUrl = response.url;
            
            // Insert markdown at cursor position
            const textarea = textareaRef.current;
            if (textarea) {
              const startPos = textarea.selectionStart;
              const endPos = textarea.selectionEnd;
              const beforeText = currentContent.substring(0, startPos);
              const afterText = currentContent.substring(endPos);
              
              // Create markdown image syntax
              const imageMarkdown = `![Image](${imageUrl})`;
              
              // Update content state
              const newContent = `${beforeText}${imageMarkdown}${afterText}`;
              setCurrentContent(newContent);
              
              // Focus and set cursor position after inserted markdown
              setTimeout(() => {
                textarea.focus();
                const newCursorPos = startPos + imageMarkdown.length;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
              }, 0);
            }
            
            toast.success("Image uploaded successfully");
          } catch (error) {
            // Error is handled by the hook
          } finally {
            setIsUploading(false);
          }
        }
      }
    },
    [topicId, currentContent, uploadImage]
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!topicId || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    setIsUploading(true);
    
    try {
      toast.info("Uploading image...");
      
      const response = await uploadImage(topicId, file);
      const imageUrl = response.url;
      
      // Insert markdown at the end of the content
      const imageMarkdown = `![Image](${imageUrl})`;
      const newContent = currentContent 
        ? `${currentContent}\n\n${imageMarkdown}`
        : imageMarkdown;
      
      setCurrentContent(newContent);
      
      toast.success("Image uploaded successfully");
      
      // Reset the file input
      event.target.value = '';
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsUploading(false);
    }
  };

  if (!topicId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Please save the topic first to add notes.</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load notes. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{note ? "Edit Note" : "Create Note"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-2">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        id="content"
                        value={currentContent}
                        onChange={(e) => setCurrentContent(e.target.value)}
                        onPaste={handlePaste}
                        placeholder="Enter note content... Paste images directly into the textarea."
                        rows={6}
                        className={isUploading || isSubmitting ? "opacity-50" : ""}
                        disabled={isUploading || isSubmitting}
                      />
                      {(isUploading || isSubmitting) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    {formErrors.content && (
                      <p className="text-sm text-destructive">{formErrors.content}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Tip: You can paste images directly into the textarea or use the upload button below.
                      Markdown syntax is supported.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveNote} 
                      disabled={isUploading || isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Note
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        className="sr-only"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileUpload}
                        disabled={isUploading || isSubmitting}
                      />
                      <Label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md ${
                          isUploading || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <ImageIcon className="h-4 w-4" />
                        Upload Image
                      </Label>
                    </div>
                    {note && (
                      <Button
                        variant="destructive"
                        onClick={handleRemoveNote}
                        disabled={isUploading || isSubmitting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Note
                      </Button>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="min-h-[200px]">
                  {currentContent ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-4">
                      <ReactMarkdown>
                        {currentContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] border rounded-md">
                      <p className="text-muted-foreground">Nothing to preview</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {note && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(note.updated_at || note.created_at || '').toLocaleString()}
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-4">
                <ReactMarkdown>
                  {note.content}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 