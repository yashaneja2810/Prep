"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, ChevronDown, ChevronRight, ArrowUpToLine, ArrowDownToLine, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  subsections: {
    id: string;
    title: string;
    subsubsections?: {
      id: string;
      title: string;
      type?: string; // Can be "cp" or "ap" to indicate practice types
    }[];
  }[];
}

interface DocsSidebarProps {
  sections: Section[];
  activeSection: string | null;
  expandedSections: Record<string, boolean>;
  expandedSubsections?: Record<string, boolean>;
  onSectionClick: (sectionId: string) => void;
  onToggleSection: (sectionId: string, event?: React.MouseEvent) => void;
  onToggleSubsection?: (subsectionId: string, event?: React.MouseEvent) => void;
  onCollapseSidebar?: () => void;
  className?: string;
}

export function DocsSidebar({
  sections,
  activeSection,
  expandedSections,
  expandedSubsections = {},
  onSectionClick,
  onToggleSection,
  onToggleSubsection,
  onCollapseSidebar,
  className
}: DocsSidebarProps) {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [useCompactMode, setUseCompactMode] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Toggle subsection expansion - use prop if available, otherwise use local state
  const toggleSubsection = (subsectionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onToggleSubsection) {
      onToggleSubsection(subsectionId, event);
    } else {
      setLocalExpandedSubsections(prev => ({
        ...prev,
        [subsectionId]: !prev[subsectionId]
      }));
    }
  };
  
  // Local state for subsections if not provided via props
  const [localExpandedSubsections, setLocalExpandedSubsections] = useState<Record<string, boolean>>({});
  
  // Use either prop or local state for expanded subsections
  const effectiveExpandedSubsections = Object.keys(expandedSubsections).length > 0 
    ? expandedSubsections 
    : localExpandedSubsections;
  
  // Expand all sections and subsections
  const expandAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Create expanded state objects for all sections and subsections
    const allSectionsExpanded: Record<string, boolean> = {};
    const allSubsectionsExpanded: Record<string, boolean> = {};
    
    sections.forEach(section => {
      allSectionsExpanded[section.id] = true;
      
      section.subsections.forEach(subsection => {
        if (subsection.subsubsections?.length) {
          allSubsectionsExpanded[subsection.id] = true;
        }
      });
    });
    
    // Update both section and subsection states
    if (onToggleSection) {
      // For each section, call onToggleSection if it's not already expanded
      sections.forEach(section => {
        if (!expandedSections[section.id]) {
          onToggleSection(section.id);
        }
      });
    }
    
    if (onToggleSubsection) {
      // For each subsection with subsubsections, call onToggleSubsection if it's not already expanded
      sections.forEach(section => {
        section.subsections.forEach(subsection => {
          if (subsection.subsubsections?.length && !effectiveExpandedSubsections[subsection.id]) {
            onToggleSubsection(subsection.id);
          }
        });
      });
    } else {
      setLocalExpandedSubsections(allSubsectionsExpanded);
    }
  };
  
  // Collapse all sections and subsections
  const collapseAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Create collapsed state objects for all sections and subsections
    const allSectionsClosed: Record<string, boolean> = {};
    const allSubsectionsClosed: Record<string, boolean> = {};
    
    sections.forEach(section => {
      allSectionsClosed[section.id] = false;
      
      section.subsections.forEach(subsection => {
        if (subsection.subsubsections?.length) {
          allSubsectionsClosed[subsection.id] = false;
        }
      });
    });
    
    // Update both section and subsection states
    if (onToggleSection) {
      // For each section, call onToggleSection if it's currently expanded
      sections.forEach(section => {
        if (expandedSections[section.id]) {
          onToggleSection(section.id);
        }
      });
    }
    
    if (onToggleSubsection) {
      // For each subsection with subsubsections, call onToggleSubsection if it's currently expanded
      sections.forEach(section => {
        section.subsections.forEach(subsection => {
          if (subsection.subsubsections?.length && effectiveExpandedSubsections[subsection.id]) {
            onToggleSubsection(subsection.id);
          }
        });
      });
    } else {
      setLocalExpandedSubsections(allSubsectionsClosed);
    }
  };
  
  // Initialize expanded subsections
  useEffect(() => {
    if (Object.keys(expandedSubsections).length === 0) {
      const initialExpandedState: Record<string, boolean> = {};
      sections.forEach(section => {
        section.subsections.forEach(subsection => {
          if (subsection.subsubsections?.length) {
            initialExpandedState[subsection.id] = true;
          }
        });
      });
      setLocalExpandedSubsections(initialExpandedState);
    }
  }, [sections, expandedSubsections]);
  
  // Check orientation and device
  useEffect(() => {
    const checkDisplay = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsMobile(window.innerWidth < 768);
      setUseCompactMode(window.innerWidth < 1024);
    };
    
    // Initial check
    checkDisplay();
    
    // Add listener for changes
    window.addEventListener('resize', checkDisplay);
    
    return () => {
      window.removeEventListener('resize', checkDisplay);
    };
  }, []);

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-content {
        height: calc(100vh - 238px) !important; /* 200px for main reduction + 38px for header */
        overflow-y: scroll !important; /* Force scrolling */
        overflow-x: hidden !important;
        padding-bottom: 20px !important; /* Add padding to ensure content is visible */
        margin-bottom: 0 !important; /* Remove margin */
        -webkit-overflow-scrolling: touch !important;
        overscroll-behavior: contain;
        position: relative;
        margin-left: 0; /* Reset left margin */
        scrollbar-width: none !important; /* Hide scrollbar in Firefox */
        -ms-overflow-style: none !important; /* Hide scrollbar in IE and Edge */
        flex: 1;
      }
      
      /* Hide scrollbar for Chrome, Safari and Opera */
      .sidebar-content::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
      }
      
      .sidebar-content::-webkit-scrollbar-track {
        display: none !important;
      }
      
      .sidebar-content::-webkit-scrollbar-thumb {
        display: none !important;
      }
      
      .sidebar-header {
        padding: 6px 10px !important; /* Reduce top/bottom padding from 8px to 6px */
        min-height: 38px !important; /* Reduce from 40px to 38px */
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--border);
        background-color: var(--background);
        margin-left: 0; /* Reset left margin */
        flex-shrink: 0;
        z-index: 10;
        position: sticky;
        top: 0;
      }
      
      .toc-title {
        display: flex;
        align-items: center;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      
      .sidebar-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className={cn("flex flex-col h-full", className)} ref={sidebarRef}>
      {/* Sidebar header with expand/collapse actions - moved to parent component */}
      <div className="sidebar-header">
        <div className="flex items-center justify-between w-full">
          <div className="toc-title text-sm">
            <BookOpen className="h-4 w-4 mr-2 text-primary/70" />
            Contents
          </div>
          <div className="sidebar-actions">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={expandAll}
              title="Expand All"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={collapseAll}
              title="Collapse All"
            >
              <ArrowUpToLine className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Sidebar content */}
      <div ref={contentRef} className="sidebar-content">
        {sections.map((section) => (
          <div key={section.id} className="py-1">
            <div
              className={cn(
                "flex items-start px-3 py-1.5 text-sm font-medium cursor-pointer rounded-md",
                activeSection === section.id 
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "hover:bg-accent/50 hover:text-accent-foreground text-muted-foreground"
              )}
              onClick={() => onSectionClick(section.id)}
            >
              {section.subsections.length > 0 ? (
                <button
                  className="mr-1.5 h-4 w-4 flex items-center justify-center mt-0.5"
                  onClick={(e) => onToggleSection(section.id, e)}
                >
                  {expandedSections[section.id] ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <span className="mr-1.5 h-4 w-4" />
              )}
              <span className="text-left">{section.title}</span>
            </div>
            
            {/* Subsections */}
            {expandedSections[section.id] && section.subsections.length > 0 && (
              <div className="mt-1 ml-5 space-y-1">
                {section.subsections.map((subsection) => (
                  <div key={subsection.id}>
                    <div
                      className={cn(
                        "flex items-start px-3 py-1 text-xs rounded-md",
                        activeSection === subsection.id
                          ? "bg-accent/50 text-accent-foreground font-medium"
                          : "hover:bg-accent/30 hover:text-accent-foreground text-muted-foreground cursor-pointer"
                      )}
                      onClick={() => onSectionClick(subsection.id)}
                    >
                      {/* Show toggle icon only if there are subsubsections */}
                      {subsection.subsubsections && subsection.subsubsections.length > 0 ? (
                        <button
                          className="mr-1.5 h-3.5 w-3.5 flex items-center justify-center mt-0.5"
                          onClick={(e) => toggleSubsection(subsection.id, e)}
                        >
                          {effectiveExpandedSubsections[subsection.id] ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                      ) : (
                        <span className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      <span className="text-left">{subsection.title}</span>
                    </div>
                    
                    {/* Sub-subsections (practice items) */}
                    {effectiveExpandedSubsections[subsection.id] && 
                     subsection.subsubsections && 
                     subsection.subsubsections.length > 0 && (
                      <div className="mt-1 ml-5 space-y-1">
                        {subsection.subsubsections.map((subsubsection) => (
                          <div
                            key={subsubsection.id}
                            className={cn(
                              "flex items-center px-3 py-1 text-xs rounded-md",
                              activeSection === subsubsection.id
                                ? "bg-accent/30 text-accent-foreground font-medium"
                                : "hover:bg-accent/20 hover:text-accent-foreground text-muted-foreground cursor-pointer"
                            )}
                            onClick={() => onSectionClick(subsubsection.id)}
                          >
                            <span className="mr-1.5 h-2 w-2 rounded-full bg-current opacity-40" />
                            <span className="text-left flex-1 truncate">
                              {subsubsection.title}
                            </span>
                            {subsubsection.type && (
                              <span
                                className={cn(
                                  "text-[10px] uppercase ml-1 px-1 py-0.5 rounded-sm",
                                  subsubsection.type === "cp" 
                                    ? "bg-secondary/20 text-secondary-foreground" 
                                    : "bg-primary/20 text-primary-foreground"
                                )}
                              >
                                {subsubsection.type}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 