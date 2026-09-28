"use client";

// TopicBasicInfo component
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TopicResponse } from "@/lib/api/topics";

interface TopicBasicInfoProps {
  topicData: TopicResponse;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function TopicBasicInfo({ topicData, onInputChange }: TopicBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topic_code">Topic Code</Label>
          <Input
            id="topic_code"
            name="topic_code"
            value={topicData.topic_code}
            onChange={onInputChange}
            placeholder="e.g., INTRO_JS_001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={topicData.title}
            onChange={onInputChange}
            placeholder="e.g., Introduction to JavaScript Variables"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={topicData.description}
          onChange={onInputChange}
          placeholder="Enter a detailed description of the topic..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
} 