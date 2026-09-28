import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sample topics data (in a real app, this would come from an API)
const availableTopics = [
  { id: "t1", topicCode: "GIT-MERGE", title: "Git Merging", status: "complete" },
  { id: "t2", topicCode: "JS-VAR", title: "Variables", status: "complete" },
  { id: "t3", topicCode: "VS-EXT", title: "VS Code", status: "in-progress" },
  { id: "t4", topicCode: "GIT-IGN", title: "Introduction to Git Ignore", status: "in-progress" },
  { id: "t5", topicCode: "PY-STR", title: "Python String Manipulation", status: "in-progress" },
];

interface ModuleTopicsProps {
  selectedTopics: Array<{
    id: string;
    topicCode: string;
    title: string;
    status: string;
  }>;
  onAddTopic: (topic: { id: string; topicCode: string; title: string; status: string }) => void;
  onRemoveTopic: (topicId: string) => void;
  onReorderTopics: (reorderedTopics: Array<{ id: string; topicCode: string; title: string; status: string }>) => void;
}

export function ModuleTopics({
  selectedTopics,
  onAddTopic,
  onRemoveTopic,
  onReorderTopics
}: ModuleTopicsProps) {
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const handleAddTopic = () => {
    if (!selectedTopicId) return;
    
    // Check if topic is already added
    if (selectedTopics.some(topic => topic.id === selectedTopicId)) {
      return; // Topic already added
    }
    
    // Find the selected topic from available topics
    const topicToAdd = availableTopics.find(topic => topic.id === selectedTopicId);
    if (topicToAdd) {
      onAddTopic(topicToAdd);
      setSelectedTopicId(""); // Reset selection
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    
    if (dragIndex === dropIndex) return;
    
    const reorderedTopics = [...selectedTopics];
    const draggedTopic = reorderedTopics[dragIndex];
    
    // Remove the dragged item
    reorderedTopics.splice(dragIndex, 1);
    // Insert it at the drop position
    reorderedTopics.splice(dropIndex, 0, draggedTopic);
    
    onReorderTopics(reorderedTopics);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Module Topics</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add and arrange topics for this module. The order determines how topics are presented to learners.
        </p>
        
        <div className="flex gap-2 mb-6">
          <Select
            value={selectedTopicId}
            onValueChange={setSelectedTopicId}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a topic to add" />
            </SelectTrigger>
            <SelectContent>
              {availableTopics.map(topic => (
                <SelectItem 
                  key={topic.id} 
                  value={topic.id}
                  disabled={selectedTopics.some(t => t.id === topic.id)}
                >
                  {topic.topicCode} - {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={handleAddTopic} disabled={!selectedTopicId}>
            Add Topic
          </Button>
        </div>
        
        {selectedTopics.length > 0 ? (
          <div className="space-y-2">
            {selectedTopics.map((topic, index) => (
              <Card 
                key={topic.id} 
                className="bg-muted/40 cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{topic.topicCode}</span>
                        <Badge variant={topic.status === "complete" ? "default" : "outline"}>
                          {topic.status === "complete" ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{topic.title}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTopic(topic.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-md border border-dashed">
            <p className="text-muted-foreground">No topics added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
} 