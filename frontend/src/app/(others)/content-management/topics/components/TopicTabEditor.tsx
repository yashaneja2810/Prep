"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { getPPTsByTopicId, PPT } from "@/lib/api/ppt";
import { TopicResponse, CreateTopicDto } from "@/lib/api/topics";
import { TopicBasicInfo } from "./TopicBasicInfo";
import { TopicDocuments } from "./TopicDocuments";
import { TopicPresentations } from "./TopicPresentations";
import { TopicVideos } from "./TopicVideos";
import { TopicNotes } from "./TopicNotes";
import { TopicCP } from "./TopicCP";
import { TopicAP } from "./TopicAP";
import { TopicLearningObjectives } from "./TopicLearningObjectives";
import { TopicLearningOutcomes } from "./TopicLearningOutcomes";

interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
}

interface Note {
  id: string;
  name: string;
  content: string;
  type: string;
  imageUrl?: string;
}

interface Video {
  id: string;
  name: string;
  description: string;
  fileName: string;
  url: string;
}

interface ClassroomPractice {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: "individual" | "group" | "pair";
  codeSnippet: string;
}

interface TopicTabEditorProps {
  onSubmit: (data: CreateTopicDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: TopicResponse;
  isEditMode?: boolean;
}

type ExerciseType = "individual" | "group" | "pair";

export function TopicTabEditor({ 
  onSubmit, 
  onCancel,
  isSubmitting = false,
  initialData 
}: TopicTabEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [topicData, setTopicData] = useState<TopicResponse>({
    id: initialData?.id || "",
    topic_code: initialData?.topic_code || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "draft",
    created_at: initialData?.created_at || new Date().toISOString(),
    updated_at: initialData?.updated_at || new Date().toISOString()
  });

  useEffect(() => {
    if (initialData) {
      setTopicData(initialData);
    }
  }, [initialData]);

  // State for learning objectives
  const [objectives, setObjectives] = useState<string[]>([]);
  const [currentObjective, setCurrentObjective] = useState("");

  // State for classroom practices
  const [classroomExercises, setClassroomExercises] = useState<ClassroomPractice[]>([]);
  const [currentExercise, setCurrentExercise] = useState<{
    title: string;
    description: string;
    duration: string;
    type: ExerciseType;
    codeSnippet: string;
  }>({
    title: "",
    description: "",
    duration: "",
    type: "individual",
    codeSnippet: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTopicData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Only send the required fields for topic creation/update
    const submitData: CreateTopicDto = {
      topic_code: topicData.topic_code,
      title: topicData.title,
      description: topicData.description,
      status: topicData.status
    };
    onSubmit(submitData);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-9">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="presentations">Presentations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="classroom">CP</TabsTrigger>
          <TabsTrigger value="ap">AP</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <TopicBasicInfo
            topicData={topicData}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="objectives" className="space-y-4">
          <TopicLearningObjectives
            topicId={initialData?.id}
            isEditMode={!!initialData?.id}
          />
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <TopicLearningOutcomes
            topicId={initialData?.id}
            isEditMode={!!initialData?.id}
          />
        </TabsContent>

        <TabsContent value="presentations" className="space-y-4">
          <TopicPresentations
            topicId={initialData?.id}
            isEditMode={!!initialData?.id}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <TopicDocuments
            topicId={initialData?.id}
            isEditMode={!!initialData?.id}
          />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <TopicNotes
            topicId={initialData?.id}
            isEditMode={!!initialData?.id}
          />
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <TopicVideos
            topicId={initialData?.id}
            isEditMode={!!initialData?.id}
          />
        </TabsContent>

        <TabsContent value="classroom" className="space-y-4">
          <TopicCP
            topicId={initialData?.id || ""}
          />
        </TabsContent>

        <TabsContent value="ap" className="space-y-4">
          <TopicAP
            topicId={initialData?.id || ""}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Topic"}
        </Button>
      </div>
    </div>
  );
} 