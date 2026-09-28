import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ModuleBasicInfo } from "./ModuleBasicInfo";
import { ModuleTopics } from "./ModuleTopics";

// Define types for module data
interface Topic {
  id: string;
  topicCode: string;
  title: string;
  status: string;
}

interface ModuleData {
  moduleCode: string;
  title: string;
  name: string;
  description: string;
  topics: Topic[];
  status: 'complete' | 'in-progress';
}

interface ModuleTabEditorProps {
  initialData?: ModuleData;
  onSubmit: (moduleData: ModuleData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

export function ModuleTabEditor({ initialData, onSubmit, onCancel, isEditMode = false }: ModuleTabEditorProps) {
  const [currentTab, setCurrentTab] = useState("basic-info");
  const [moduleData, setModuleData] = useState<ModuleData>({
    moduleCode: "",
    title: "",
    name: "",
    description: "",
    topics: [],
    status: "in-progress"
  });

  // Initialize with provided data if in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setModuleData(initialData);
    }
  }, [isEditMode, initialData]);

  // Handlers for basic info
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setModuleData({
      ...moduleData,
      [name]: value
    });
  };

  // Handlers for topics
  const handleAddTopic = (topic: Topic) => {
    setModuleData({
      ...moduleData,
      topics: [...moduleData.topics, topic]
    });
  };

  const handleRemoveTopic = (topicId: string) => {
    setModuleData({
      ...moduleData,
      topics: moduleData.topics.filter(topic => topic.id !== topicId)
    });
  };

  const handleReorderTopics = (reorderedTopics: Topic[]) => {
    setModuleData({
      ...moduleData,
      topics: reorderedTopics
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(moduleData);
  };

  return (
    <div className="w-full">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          <TabsContent value="basic-info">
            <ModuleBasicInfo
              moduleCode={moduleData.moduleCode}
              title={moduleData.title}
              name={moduleData.name}
              description={moduleData.description}
              onInputChange={handleInputChange}
            />
          </TabsContent>
          
          <TabsContent value="topics">
            <ModuleTopics
              selectedTopics={moduleData.topics}
              onAddTopic={handleAddTopic}
              onRemoveTopic={handleRemoveTopic}
              onReorderTopics={handleReorderTopics}
            />
          </TabsContent>
          
          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? "Update Module" : "Create Module"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
} 