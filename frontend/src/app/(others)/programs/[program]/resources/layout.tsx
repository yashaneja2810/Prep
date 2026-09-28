"use client";

import { useEffect, useState } from "react";
import { useProgramContext } from "../layout";
import { DynamicSidebar } from "./components/dynamic-sidebar";
import { cn } from "@/lib/utils";

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { program, programId } = useProgramContext();
  const [isMobileView, setIsMobileView] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Add a class to the html and body elements to prevent scrolling
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    
    // Check if we're in mobile view initially
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobileView();
    
    // Listen for window resize
    window.addEventListener('resize', checkMobileView);
    
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem(`${programId}-sidebar-expanded`);
    if (savedSidebarState !== null) {
      setSidebarExpanded(savedSidebarState === "true");
    }
    
    // Listen for sidebar state changes
    const handleSidebarStateChange = (e: CustomEvent<{expanded: boolean}>) => {
      setSidebarExpanded(e.detail.expanded);
    };
    
    window.addEventListener('sidebarStateChanged', handleSidebarStateChange as EventListener);
    
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
      window.removeEventListener('resize', checkMobileView);
      window.removeEventListener('sidebarStateChanged', handleSidebarStateChange as EventListener);
    };
  }, [programId]);
  
  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Content area with sidebar and main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar toggle button */}
        {isMobileView && (
          <button 
            onClick={toggleSidebar}
            className="fixed top-16 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-md"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        )}
        
        {/* Sidebar container - always present */}
        <div 
          className={cn(
            "h-full flex-shrink-0",
            isMobileView 
              ? sidebarOpen 
                ? 'fixed left-0 top-[50px] bottom-0 z-40' 
                : 'fixed left-0 top-[50px] bottom-0 z-40 -translate-x-full' 
              : ''
          )}
        >
          <DynamicSidebar />
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {isMobileView && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 top-[50px]"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Main content area - adjusts based on sidebar state */}
        <div 
          className={cn(
            "flex-1 h-full overflow-hidden transition-all duration-300",
            isMobileView ? 'w-full' : sidebarExpanded ? 'ml-0' : 'ml-0'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
} 