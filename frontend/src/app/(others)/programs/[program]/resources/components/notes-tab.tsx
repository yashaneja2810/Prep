"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, FileText } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { getNotesByTopicId } from "@/lib/api/notes";
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// Add styling for better markdown rendering
const markdownStyles = {
  // Add these styles to ensure tables are properly displayed
  table: "border-collapse border border-gray-300 my-4 w-full",
  th: "border border-gray-300 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-left",
  td: "border border-gray-300 px-4 py-2",
  // Code block styling
  pre: "bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto my-4",
  code: "bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm",
  // Image handling
  img: "max-w-full h-auto my-4 rounded-md",
  // List spacing
  ul: "list-disc pl-6 my-4 space-y-2",
  ol: "list-decimal pl-6 my-4 space-y-2",
  // Heading styles for better hierarchy
  h1: "text-2xl font-bold mt-6 mb-4",
  h2: "text-xl font-bold mt-5 mb-3",
  h3: "text-lg font-bold mt-4 mb-2",
};

// Custom component mapping for ReactMarkdown
const MarkdownComponents = {
  table: ({ node, ...props }: any) => <table className={markdownStyles.table} {...props} />,
  th: ({ node, ...props }: any) => <th className={markdownStyles.th} {...props} />,
  td: ({ node, ...props }: any) => <td className={markdownStyles.td} {...props} />,
  pre: ({ node, ...props }: any) => <pre className={markdownStyles.pre} {...props} />,
  code: ({ node, inline, ...props }: any) => 
    inline ? <code className={markdownStyles.code} {...props} /> : <code {...props} />,
  img: ({ node, ...props }: any) => <img className={markdownStyles.img} {...props} />,
  ul: ({ node, ...props }: any) => <ul className={markdownStyles.ul} {...props} />,
  ol: ({ node, ...props }: any) => <ol className={markdownStyles.ol} {...props} />,
  h1: ({ node, ...props }: any) => <h1 className={markdownStyles.h1} {...props} />,
  h2: ({ node, ...props }: any) => <h2 className={markdownStyles.h2} {...props} />,
  h3: ({ node, ...props }: any) => <h3 className={markdownStyles.h3} {...props} />,
};

interface TabProps {
  topicId: string;
}

interface Note {
  id: string;
  topic_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Note[];
  timestamp: string;
}

export function NotesTab({ topicId }: TabProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load note from API
  useEffect(() => {
    const fetchNote = async () => {
      if (!topicId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Try to get from API first
        const response = await apiClient.get<ApiResponse>(`/api/topics/${topicId}/notes`);
        
        // Since we now have only one note per topic, take the first one if it exists
        if (response.data.data && response.data.data.length > 0) {
          setNote(response.data.data[0]);
        } else {
          setNote(null);
        }
        
      } catch (err: any) {
        console.error('Error fetching note:', err);
        
        // Check for specific errors
        if (err.response?.status === 404) {
          setError('No note found for this topic');
        } else {
          setError('Failed to load note');
        }
        
        // Fallback to localStorage if API fails
        const savedNote = localStorage.getItem(`note-${topicId}`);
        if (savedNote) {
          setNote(JSON.parse(savedNote));
          setError(null); // Clear error if we have a local note
        } else {
          setNote(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchNote();
  }, [topicId]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="w-full h-full mt-0">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[calc(100vh-120px)] w-full mt-2" />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full mt-0">
      {error && !note ? (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : note ? (
        <ScrollArea className="h-[calc(100vh-90px)] w-full pr-4">
          <div className="prose prose-sm max-w-none dark:prose-invert pb-10">
            <ReactMarkdown components={MarkdownComponents}>
              {note.content}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      ) : (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>No notes available</AlertTitle>
          <AlertDescription>
            There are no notes for this topic yet.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 