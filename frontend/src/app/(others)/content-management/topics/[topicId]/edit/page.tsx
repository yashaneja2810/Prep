"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { TopicTabEditor } from "../../components/TopicTabEditor";
import { getTopicById, TopicResponse, updateTopic, CreateTopicDto } from "@/lib/api/topics";
import { toast } from "sonner";

export default function EditTopicPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicData, setTopicData] = useState<TopicResponse>({
    id: '',
    topic_code: '',
    title: '',
    description: '',
    status: 'draft',
    created_at: '',
    updated_at: ''
  });

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        setIsLoading(true);
        const response = await getTopicById(topicId);
        setTopicData(response);
      } catch (error) {
        console.error("Error fetching topic:", error);
        toast.error("Failed to load topic data");
        router.push("/content-management/topics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopicData();
  }, [topicId, router]);

  const handleUpdateTopic = async (updatedData: CreateTopicDto) => {
    try {
      setIsSubmitting(true);
      const response = await updateTopic(topicId, updatedData);
      toast.success("Topic updated successfully");
      router.push("/content-management/topics");
    } catch (error) {
      console.error("Error updating topic:", error);
      toast.error("Failed to update topic");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <p>Loading topic data...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <PageHeader title="Edit Topic" />
      <PageContainer>
        <div className="max-w-7xl mx-auto mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Edit Topic: {topicData?.title}</h1>
            <div className="w-[100px]"></div>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <TopicTabEditor
              initialData={topicData}
              onSubmit={handleUpdateTopic}
              onCancel={() => router.push(`/content-management/topics/${topicId}`)}
              isEditMode={true}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </PageContainer>
    </>
  );
} 