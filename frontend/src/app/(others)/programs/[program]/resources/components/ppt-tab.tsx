"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize, 
  Terminal, 
  Loader2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "@/hooks/use-toast";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TabProps {
  topicId: string;
}

interface Presentation {
  id: string;
  topic_id: string;
  title: string;
  url: string;
}

interface ApiResponse {
  data: Presentation[];
  statusCode: number;
  success: boolean;
  message: string;
}

// Options for PDF rendering
const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
};

export function PptTab({ topicId }: TabProps) {
  // States
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullView, setIsFullView] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Fetch presentations from the API
  useEffect(() => {
    const fetchPresentations = async () => {
      if (!topicId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<ApiResponse>(`/api/topics/${topicId}/ppt`);
        const data = response.data.data || [];
        setPresentations(data);
      } catch (err) {
        console.error('Error fetching presentations:', err);
        setError('Failed to load presentations');
        setPresentations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPresentations();
  }, [topicId]);
  
  // Handle document load success
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }
  
  // Navigation functions
  const nextPresentation = () => {
    if (currentSlide < presentations.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setPageNumber(1);
    }
  };
  
  const prevPresentation = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setPageNumber(1);
    }
  };
  
  const nextPage = () => {
    if (pageNumber < (numPages || 1)) {
      setPageNumber(pageNumber + 1);
    }
  };
  
  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };
  
  // Toggle view mode
  const toggleViewMode = () => {
    setIsFullView(!isFullView);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };
  
  // Zoom functions
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullView) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          nextPage();
        } else if (e.key === 'ArrowLeft') {
          prevPage();
        } else if (e.key === 'Escape') {
          setIsFullView(false);
        } else if (e.key === '+') {
          zoomIn();
        } else if (e.key === '-') {
          zoomOut();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullView, pageNumber, numPages]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading presentations...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (presentations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-500">No presentations available</p>
      </div>
    );
  }

  const currentPresentation = presentations[currentSlide];
  
  return (
    <div className="relative" ref={contentRef}>
      <Card className={cn(
        "transition-all duration-300",
        isFullView ? "fixed inset-0 z-50 m-0 rounded-none" : "relative"
      )}>
        <CardHeader className="flex flex-row items-center justify-between py-2 px-3 border-b">
          <CardTitle className="text-sm font-medium truncate max-w-[60%]">{currentPresentation.title}</CardTitle>
          <div className="flex items-center space-x-2">
            {/* Zoom controls moved to header */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomOut}
                disabled={scale <= 0.5}
                title="Zoom out"
                className="h-7 w-7"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              
              <div className="text-xs min-w-[40px] text-center">
                {Math.round(scale * 100)}%
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomIn}
                disabled={scale >= 3}
                title="Zoom in"
                className="h-7 w-7"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleViewMode}
              title={isFullView ? "Exit fullscreen" : "Enter fullscreen"}
              className="h-7 w-7"
            >
              {isFullView ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className={cn(
          "flex flex-col items-center p-4", 
          isFullView ? "h-[calc(100vh-68px)]" : "h-full"
        )}>
          <div className={cn(
            "overflow-auto w-full flex-1 flex items-center justify-center relative",
            isFullView ? "max-h-[calc(100vh-180px)]" : "max-h-[600px]"
          )}>
            {/* Page navigation buttons on the sides of the PDF */}
            <Button
              variant="ghost"
              size="icon"
              onClick={prevPage}
              disabled={pageNumber <= 1}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextPage}
              disabled={pageNumber >= (numPages || 1)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
            
            <Document
              file={currentPresentation.url}
              onLoadSuccess={onDocumentLoadSuccess}
              options={options}
              loading={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
              error={
                <div className="text-center p-4">
                  <p className="text-red-500">Failed to load PDF. Please try again later.</p>
                </div>
              }
              className="flex justify-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          </div>
          
          <div className="w-full mt-4 flex flex-wrap items-center justify-between gap-2">
            {/* Presentation navigation */}
            {presentations.length > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPresentation}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous File
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPresentation}
                  disabled={currentSlide === presentations.length - 1}
                >
                  Next File
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
            
            {/* Page counter */}
            <div className="text-sm">
              Page {pageNumber} of {numPages || '?'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}