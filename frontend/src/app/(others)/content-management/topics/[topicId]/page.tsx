"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Plus, X, Trash, GripVertical, CheckCircle, Clock, Users, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getTopicById, TopicResponse } from "@/lib/api/topics";
import { toast } from "sonner";

export default function TopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [topicData, setTopicData] = useState<TopicResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentObjective, setCurrentObjective] = useState("");
  const [currentOutcome, setCurrentOutcome] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");

  // Fetch topic data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getTopicById(topicId);
        if (response.success) {
          setTopicData(response.data);
        } else {
          toast.error("Failed to load topic");
          router.push("/content-management/topics");
        }
      } catch (error) {
        console.error("Error fetching topic:", error);
        toast.error("Failed to load topic");
        router.push("/content-management/topics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [topicId, router]);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Welcome, John!" />
        <PageContainer>
          <div className="flex justify-center items-center h-64">
            <p>Loading topic data...</p>
          </div>
        </PageContainer>
      </>
    );
  }

  if (!topicData) {
    return (
      <>
        <PageHeader title="Welcome, John!" />
        <PageContainer>
          <div className="flex justify-center items-center h-64">
            <p>Topic not found</p>
          </div>
        </PageContainer>
      </>
    );
  }

  // Handle input changes
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTopicData({
      ...topicData,
      [name]: value
    });
  };

  // Handle toggle publish
  const handleTogglePublish = () => {
    setTopicData({
      ...topicData,
      status: topicData.status === "published" ? "draft" : "published"
    });
  };

  return (
    <>
      <PageHeader title="Welcome, John!" />
      <PageContainer>
        <div className="max-w-7xl mx-auto mt-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/content-management/topics")}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{topicData.title}</h1>
            <Badge variant={topicData.status === "published" ? "default" : "outline"}>
              {topicData.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="objectives">Objectives</TabsTrigger>
                <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                <TabsTrigger value="presentations">Presentations</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="classroom">CP</TabsTrigger>
                <TabsTrigger value="ap">AP</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic_code">Topic Code</Label>
                    <Input
                      id="topic_code"
                      name="topic_code"
                      value={topicData.topic_code}
                      onChange={handleTopicChange}
                      placeholder="e.g., INTRO_JS_001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={topicData.title}
                      onChange={handleTopicChange}
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
                    onChange={handleTopicChange}
                    placeholder="Enter a detailed description of the topic..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publish"
                    checked={topicData.status === "published"}
                    onCheckedChange={handleTogglePublish}
                  />
                  <Label htmlFor="publish">Publish Topic</Label>
                </div>
              </TabsContent>

              {/* Add other tab contents here */}
            </Tabs>
          </div>
        </div>
      </PageContainer>
    </>
  );
} 