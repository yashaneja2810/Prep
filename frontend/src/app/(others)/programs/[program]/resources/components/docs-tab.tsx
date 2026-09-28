"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Code, Copy, Check, ExternalLink, BookOpen, ChevronDown, ChevronRight, Link as LinkIcon, Menu, X, PanelLeftClose } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import React from "react";
import { useProgramContext } from "../../layout";
import { getDocumentsByTopicId } from "@/lib/api/documents";

// Import DocsSidebar component
import { DocsSidebar } from "./docs-sidebar";

interface DocsTabProps {
  topicId: string;
}

interface DocumentData {
  id: string;
  topic_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  data: DocumentData[];
  statusCode: number;
  success: boolean;
  message: string;
}

interface Section {
  id: string;
  title: string;
  content: string;
  subsections: Subsection[];
}

interface Subsection {
  id: string;
  title: string;
  content: string;
  code?: string;
  explanation?: string;
  list?: string[];
  subsubsections?: {
    id: string;
    title: string;
    type: "cp" | "ap"; // Coding Practice or Assessment Practice
    description?: string;
  }[];
}

interface TopicDoc {
  title: string;
  description: string;
  sections: Section[];
}

// Component to render code with syntax highlighting
const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="mb-4 code-block">
      <div className="rounded-md overflow-hidden border shadow-sm">
        <div className="flex items-center justify-between bg-zinc-800 px-2 md:px-3 py-1.5 text-white">
          <div className="flex items-center gap-1 md:gap-2">
            <Code className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
            <span className="text-xs font-medium">Code</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 md:h-7 gap-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-700"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </Button>
        </div>
        <div className="bg-zinc-900 p-3 overflow-x-auto code-container">
          <pre className="text-xs md:text-sm text-white">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

// Parse markdown content into structured format
function parseMarkdownToSections(markdown: string): TopicDoc {
  // Default structure
  const defaultDoc: TopicDoc = {
    title: "Documentation",
    description: "Documentation for this topic",
    sections: []
  };
  
  if (!markdown) return defaultDoc;
  
  try {
    // Try to parse as JSON first in case it's already structured
    try {
      const jsonContent = JSON.parse(markdown);
      if (jsonContent.title && jsonContent.sections) {
        return jsonContent as TopicDoc;
      }
    } catch (e) {
      // Not JSON, continue with markdown parsing
    }
    
    // Split markdown by headers
    const lines = markdown.split('\n');
    let currentTitle = "Documentation";
    let currentDescription = "";
    let currentSection: Section | null = null;
    let currentSubsection: Subsection | null = null;
    const sections: Section[] = [];
    
    // Extract title and description from first lines if they look like a header
    if (lines[0]?.startsWith('# ')) {
      currentTitle = lines[0].substring(2).trim();
      if (lines[1] && !lines[1].startsWith('#')) {
        currentDescription = lines[1].trim();
      }
      lines.splice(0, currentDescription ? 2 : 1);
    }
    
    let codeBlock = false;
    let codeContent = "";
    let listItems: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.startsWith('```')) {
        codeBlock = !codeBlock;
        if (codeBlock) {
          codeContent = "";
        } else if (currentSubsection) {
          currentSubsection.code = codeContent.trim();
        }
        continue;
      }
      
      if (codeBlock) {
        codeContent += line + '\n';
        continue;
      }
      
      // Handle list items
      if (line.match(/^[\s]*[-*] /)) {
        listItems.push(line.replace(/^[\s]*[-*] /, '').trim());
        
        // If this is the last line or next line is not a list item, add the list
        if (i === lines.length - 1 || !lines[i + 1].match(/^[\s]*[-*] /)) {
          if (currentSubsection && listItems.length > 0) {
            currentSubsection.list = [...listItems];
            listItems = [];
          }
        }
        continue;
      }
      
      // Handle headers
      if (line.startsWith('## ')) {
        // New section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          id: `section-${sections.length}`,
          title: line.substring(3).trim(),
          content: "",
          subsections: []
        };
        currentSubsection = null;
        continue;
      }
      
      if (line.startsWith('### ')) {
        // New subsection
        if (currentSection) {
          currentSubsection = {
            id: `subsection-${currentSection.subsections.length}`,
            title: line.substring(4).trim(),
            content: "",
          };
          currentSection.subsections.push(currentSubsection);
        }
        continue;
      }
      
      // Handle content
      if (currentSubsection) {
        if (currentSubsection.content) {
          currentSubsection.content += ' ' + line.trim();
        } else {
          currentSubsection.content = line.trim();
        }
      } else if (currentSection) {
        if (currentSection.content) {
          currentSection.content += ' ' + line.trim();
        } else {
          currentSection.content = line.trim();
        }
      }
    }
    
    // Add the last section if exists
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // If no sections were created, create a default one with all content
    if (sections.length === 0) {
      sections.push({
        id: "section-0",
        title: "Content",
        content: markdown,
        subsections: []
      });
    }
    
    return {
      title: currentTitle,
      description: currentDescription,
      sections: sections
    };
  } catch (error) {
    console.error("Error parsing markdown:", error);
    return defaultDoc;
  }
}

export function DocsTab({ topicId }: DocsTabProps) {
  const { programId } = useProgramContext();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedDoc, setParsedDoc] = useState<TopicDoc | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedSubsections, setExpandedSubsections] = useState<Record<string, boolean>>({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 1024);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  // Fetch documents for the topic
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!topicId) return;
      
      try {
        setLoading(true);
        
        // Use the correct API endpoint from the documents API client
        const documentsData = await getDocumentsByTopicId(topicId).catch(error => {
          console.error("Failed to fetch documents:", error);
          return []; // Return empty array if API fails
        });
        
        setDocuments(documentsData);
        
        // Parse the first document if available
        if (documentsData.length > 0) {
          const doc = documentsData[0];
          const parsed = parseMarkdownToSections(doc.content);
          setParsedDoc(parsed);
          
          // Initialize expanded sections
          const initialExpandedSections: Record<string, boolean> = {};
          const initialExpandedSubsections: Record<string, boolean> = {};
          
          parsed.sections.forEach(section => {
            // Expand the first section by default
            initialExpandedSections[section.id] = section.id === 'section-0';
            
            // Expand subsections with subsubsections
            section.subsections.forEach(subsection => {
              if (subsection.subsubsections?.length) {
                initialExpandedSubsections[subsection.id] = true;
              }
            });
          });
          
          setExpandedSections(initialExpandedSections);
          setExpandedSubsections(initialExpandedSubsections);
          
          // Set active section to the first one
          setActiveSection(parsed.sections.length > 0 ? parsed.sections[0].id : null);
        } else {
          // Create a placeholder if no documents found
          createPlaceholderDocument();
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Failed to load documentation. Please try again later.");
        // Create a placeholder document on error
        createPlaceholderDocument();
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [topicId, programId]);
  
  // Create a placeholder document
  const createPlaceholderDocument = () => {
    // Create a placeholder document
    const placeholderDoc: TopicDoc = {
      title: "Documentation",
      description: "This topic doesn't have any documentation yet.",
      sections: [
        {
          id: "section-0",
          title: "Getting Started",
          content: "This is a placeholder for documentation content. The actual documentation for this topic has not been created yet.",
          subsections: [
            {
              id: "subsection-0",
              title: "Introduction",
              content: "When documentation is added, it will appear here with proper formatting and structure."
            }
          ]
        }
      ]
    };
    
    setParsedDoc(placeholderDoc);
    
    // Initialize expanded sections
    setExpandedSections({ 'section-0': true });
    
    // Set active section
    setActiveSection('section-0');
  };
  
  // Scroll to a section when it's made active
  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Close the sheet if it's open (mobile)
    if (isSheetOpen) {
      setIsSheetOpen(false);
    }
  };
  
  // Handle section clicks
  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    scrollToSection(sectionId);
  };
  
  // Toggle section expansion
  const toggleSection = (sectionId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Toggle subsection expansion
  const toggleSubsection = (subsectionId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setExpandedSubsections(prev => ({
      ...prev,
      [subsectionId]: !prev[subsectionId]
    }));
  };
  
  // Toggle sidebar visibility
  const toggleSidebarVisibility = () => {
    setShowSidebar(prev => !prev);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-sm text-muted-foreground">Loading documentation...</span>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Render no documentation state
  if (!parsedDoc) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Documentation Available</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          There is no documentation available for this topic yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex h-full w-full">
      {/* Sidebar for larger screens */}
      {showSidebar && !isSmallScreen && (
        <div className="w-64 h-full border-r flex-shrink-0 flex flex-col overflow-hidden">
          {/* Sidebar header */}
          <div className="sidebar-header bg-accent/20">
            <div className="flex items-center justify-between w-full">
              <div className="toc-title text-sm">
                <BookOpen className="h-4 w-4 mr-2 text-primary/70" />
                Table of Contents
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 p-0" 
                onClick={toggleSidebarVisibility}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Sidebar content */}
          <DocsSidebar 
            sections={parsedDoc.sections}
            activeSection={activeSection}
            expandedSections={expandedSections}
            expandedSubsections={expandedSubsections}
            onSectionClick={handleSectionClick}
            onToggleSection={toggleSection}
            onToggleSubsection={toggleSubsection}
            className="flex-1 sidebar-content"
          />
        </div>
      )}
      
      {/* Mobile sidebar toggle */}
      {isSmallScreen && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="fixed left-4 top-20 z-10 h-8 w-8 p-0 rounded-full shadow-md"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-primary/70" />
                Table of Contents
              </SheetTitle>
            </SheetHeader>
            <DocsSidebar 
              sections={parsedDoc.sections}
              activeSection={activeSection}
              expandedSections={expandedSections}
              expandedSubsections={expandedSubsections}
              onSectionClick={handleSectionClick}
              onToggleSection={toggleSection}
              onToggleSubsection={toggleSubsection}
              className="h-[calc(100vh-100px)] overflow-y-auto p-4"
            />
          </SheetContent>
        </Sheet>
      )}
      
      {/* Main content */}
      <div 
        ref={contentRef}
        className={cn(
          "flex-1 overflow-y-auto p-2 md:p-4",
          !showSidebar && !isSmallScreen ? "pl-6" : ""
        )}
      >
        {/* Document header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{parsedDoc.title}</h1>
          {parsedDoc.description && (
            <p className="text-muted-foreground mt-1">{parsedDoc.description}</p>
          )}
        </div>
        
        {/* Toggle sidebar button (non-mobile) */}
        {!showSidebar && !isSmallScreen && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSidebarVisibility}
            className="fixed left-4 top-20 z-10 h-8 w-8 p-0 rounded-full shadow-md"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        {/* Sections */}
        {parsedDoc.sections.map((section) => (
          <div key={section.id} id={section.id} className="mt-6 first:mt-0 scroll-mt-16">
            <h2 className="text-xl font-semibold tracking-tight mb-3">{section.title}</h2>
            {section.content && <p className="mb-3">{section.content}</p>}
            
            {/* Subsections */}
            {section.subsections.map((subsection) => (
              <div key={subsection.id} id={subsection.id} className="mt-4 scroll-mt-16">
                <h3 className="text-lg font-medium tracking-tight mb-2">{subsection.title}</h3>
                {subsection.content && <p className="mb-2">{subsection.content}</p>}
                
                {/* Code block */}
                {subsection.code && <CodeBlock code={subsection.code} />}
                
                {/* List items */}
                {subsection.list && subsection.list.length > 0 && (
                  <ul className="list-disc list-outside pl-5 mb-4 space-y-1.5">
                    {subsection.list.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                )}
                
                {/* Practice items */}
                {subsection.subsubsections && subsection.subsubsections.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {subsection.subsubsections.map((subsubsection) => (
                      <div key={subsubsection.id} id={subsubsection.id} className="border rounded-md p-3 bg-accent/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={subsubsection.type === "cp" ? "secondary" : "default"}>
                            {subsubsection.type === "cp" ? "Concept Practice" : "Application Practice"}
                          </Badge>
                          <span className="text-sm font-medium">{subsubsection.title}</span>
                        </div>
                        {subsubsection.description && (
                          <p className="text-sm text-muted-foreground">{subsubsection.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 