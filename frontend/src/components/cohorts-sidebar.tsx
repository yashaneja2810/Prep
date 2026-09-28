"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Lecture {
  id: string;
  lectureNumber?: number;
  title: string;
  date: string;
  time: string;
  instructor: string;
  description?: string;
  topicsCovered?: string[];
  actionPoints?: string[];
  quickRecap?: string;
  summary?: string;
  notes?: string;
  classFilesUrl?: string;
  recordingLink?: string;
  sessionId: string;
}

interface WeekGroup {
  week: string;
  lectures: Lecture[];
}

interface CohortsSidebarProps {
  lectureGroups: WeekGroup[];
  selectedLectureId: string;
  onLectureSelect: (lecture: Lecture) => void;
}

export function CohortsSidebar({ lectureGroups, selectedLectureId, onLectureSelect }: CohortsSidebarProps) {
  // Flatten all lectures from week groups
  const allLectures = lectureGroups.flatMap(group => group.lectures);
  
  return (
    <div className="w-80 h-full border-r border-border flex flex-col bg-background">
      {/* Sidebar Header */}
      <div className="h-12 border-b border-border flex items-center px-4">
        <h3 className="text-sm font-medium">Lectures</h3>
      </div>
      
      {/* Sidebar Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {allLectures.map((lecture) => (
            <Card
              key={lecture.id}
              className={`overflow-hidden cursor-pointer transition-colors ${
                selectedLectureId === lecture.id
                  ? "bg-primary/10 border-l-2 border-primary"
                  : "hover:bg-muted"
              }`}
              onClick={() => onLectureSelect(lecture)}
            >
              <div className="p-3">
                <div className="font-medium text-sm">{lecture.lectureNumber ? `Lecture ${lecture.lectureNumber}` : 'Session'}</div>
                <div className="text-sm text-primary font-medium">{lecture.title}</div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {lecture.date}
                  <Clock className="h-3.5 w-3.5 ml-1" />
                  {lecture.time}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 