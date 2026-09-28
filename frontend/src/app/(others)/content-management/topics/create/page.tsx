"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { TopicTabEditor } from "../components/TopicTabEditor";
import { createTopic, CreateTopicDto } from "@/lib/api/topics";
import { toast } from "sonner";

export default function CreateTopicPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTopic = async (topicData: CreateTopicDto) => {
    try {
      console.log("Creating topic with data:", topicData);
      setIsSubmitting(true);
      const response = await createTopic({
        ...topicData,
        status: "draft" // Default status for new topics
      });
      
      console.log("API Response:", response);
      
      if (response.success) {
        toast.success("Topic created successfully");
        // Navigate to the topics tab on the Content Management
        router.push("/content-management?tab=topics");
      } else {
        toast.error(response.message || "Failed to create topic");
      }
    } catch (error: any) {
      console.error("Error creating topic:", error);
      toast.error(error.response?.data?.message || "Failed to create topic");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Welcome, John!" />
      <PageContainer>
        <div className="max-w-7xl mx-auto mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Create New Topic</h1>
            <div className="w-[100px]"></div> {/* Empty div for flex spacing */}
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <TopicTabEditor
              onSubmit={handleCreateTopic}
              onCancel={() => router.push("/content-management/topics")}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </PageContainer>
    </>
  );
} 