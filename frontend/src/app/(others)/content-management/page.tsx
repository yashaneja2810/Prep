"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/page-container";
import { Users, BookOpen, Layers, FileText } from "lucide-react";

// Import the tab content components directly from TabContents.tsx
import { 
  CohortsTabContent, 
  ProgramsTabContent, 
  ModulesTabContent, 
  TopicsTabContent 
} from "./components/TabContents";

export default function ContentManagementDashboard() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "cohorts");

  useEffect(() => {
    // If no tab parameter is specified, set it to cohorts
    if (!tabParam) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "cohorts");
      window.history.pushState({}, "", url.toString());
    }
    // Update active tab when URL query parameter changes
    else if (["cohorts", "programs", "modules", "topics"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update the URL without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <div className="flex gap-2"></div>
      </div>
      <div className="px-4 pb-8">
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto py-1 no-scrollbar mb-6">
            <TabsTrigger value="cohorts" className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Users className="h-4 w-4" />
              <span>Cohorts</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <BookOpen className="h-4 w-4" />
              <span>Programs</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Layers className="h-4 w-4" />
              <span>Modules</span>
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <FileText className="h-4 w-4" />
              <span>Topics</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cohorts">
            <CohortsTabContent />
          </TabsContent>
          <TabsContent value="programs">
            <ProgramsTabContent />
          </TabsContent>
          <TabsContent value="modules">
            <ModulesTabContent />
          </TabsContent>
          <TabsContent value="topics">
            <TopicsTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 