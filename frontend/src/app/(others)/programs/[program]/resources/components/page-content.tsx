"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TabNavigation } from "./tab-navigation";
import { useProgramContext } from "../../layout";
import { DocsTab } from "./docs-tab";
import { NotesTab } from "./notes-tab";
import { PptTab } from "./ppt-tab";
import { VideosTab } from "./videos-tab";
import { CpsTab } from "./cps-tab";
import { ApsTab } from "./aps-tab";
import { LearningObjectivesTab } from "./learning-objectives-tab";
import { LearningOutcomeTab } from "./learning-outcome-tab";

interface PageContentProps {
  topicId: string;
}

export function PageContent({ topicId }: PageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { programId } = useProgramContext();
  
  // Determine active tab from URL
  const getActiveTabFromURL = () => {
    const pathSegments = pathname.split('/');
    // The last segment should be the tab name (docs, notes, etc.)
    const activeTab = pathSegments[pathSegments.length - 1];
    const validTabs = ["docs", "notes", "ppt", "videos", "cps", "aps", "objectives", "outcome"];
    
    return validTabs.includes(activeTab) ? activeTab : "docs";
  };
  
  const activeTab = getActiveTabFromURL();
  
  // Render the appropriate tab content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "docs":
        return <DocsTab topicId={topicId} />;
      case "notes":
        return <NotesTab topicId={topicId} />;
      case "ppt":
        return <PptTab topicId={topicId} />;
      case "videos":
        return <VideosTab topicId={topicId} />;
      case "cps":
        return <CpsTab topicId={topicId} />;
      case "aps":
        return <ApsTab topicId={topicId} />;
      case "objectives":
        return <LearningObjectivesTab topicId={topicId} />;
      case "outcome":
        return <LearningOutcomeTab topicId={topicId} />;
      default:
        return <DocsTab topicId={topicId} />;
    }
  };
  
  // Add a class to the body to prevent scrolling
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);
  
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Tab navigation */}
      <div className="flex-shrink-0 sticky top-0 z-10">
        <TabNavigation activeTab={activeTab} topicId={topicId} />
      </div>
      
      {/* Content area - Only this part should be scrollable */}
      <div className="flex-1 overflow-hidden pt-1">
        <div className="h-full overflow-y-auto px-3 sm:px-5 py-2 sm:py-3">
          <div className="border rounded-md bg-background h-full">
            <div className="p-3 sm:p-4 h-full">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 