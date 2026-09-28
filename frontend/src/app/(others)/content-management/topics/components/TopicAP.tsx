import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash, Save, Loader2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  AP,
  CreateAPDto,
  UpdateAPDto
} from "@/lib/api/aps";
import { useAPsByTopic, useAPMutations } from "@/hooks/useAPs";

interface TopicAPProps {
  topicId: string;
}

export function TopicAP({ topicId }: TopicAPProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [currentAP, setCurrentAP] = useState<CreateAPDto>({
    topic_id: topicId,
    title: "",
    difficulty: "easy",
    input: "",
    expected_output: "",
    instruction: "",
    objective: ""
  });
  const [editingAP, setEditingAP] = useState<AP | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Use our custom hooks
  const { 
    aps, 
    isLoading, 
    error, 
    mutate: refreshAPs,
    filteredAPs
  } = useAPsByTopic(topicId);
  
  const {
    createAP,
    updateAP,
    deleteAP,
    isSubmitting: isSaving
  } = useAPMutations();

  // Set topic ID when it changes
  useEffect(() => {
    if (topicId) {
      setCurrentAP(prev => ({ ...prev, topic_id: topicId }));
    }
  }, [topicId]);

  const handleAddAP = async () => {
    if (!topicId) return;
    if (!currentAP.title.trim() || !currentAP.instruction.trim() || !currentAP.objective.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Create a properly formatted create object
      const createData = {
        ...currentAP,
        topic_id: topicId,
        // Ensure empty strings are sent as undefined
        input: currentAP.input?.trim() || undefined,
        expected_output: currentAP.expected_output?.trim() || undefined
      };
      
      // Remove any undefined values
      Object.keys(createData).forEach(key => {
        if (createData[key as keyof typeof createData] === undefined) {
          delete createData[key as keyof typeof createData];
        }
      });
      
      await createAP(createData);
      
      // Reset form
      setCurrentAP({
        topic_id: topicId,
        title: "",
        difficulty: "easy",
        input: "",
        expected_output: "",
        instruction: "",
        objective: ""
      });
      
      // Refresh the APs list
      refreshAPs();
      
      setActiveTab("list");
    } catch (error) {
      // Error is already handled by the hook
      console.error("Failed to add application problem:", error);
    }
  };

  const handleEditAP = (ap: AP) => {
    setEditingAP(ap);
    setCurrentAP({
      topic_id: topicId,
      title: ap.title,
      difficulty: ap.difficulty || "easy",
      input: ap.input || "",
      expected_output: ap.expected_output || "",
      instruction: ap.instruction,
      objective: ap.objective
    });
    setIsEditing(true);
    
    // Switch to create tab for editing
    setActiveTab("create");
  };

  const handleSaveEdit = async () => {
    if (!editingAP) return;
    if (!currentAP.title.trim() || !currentAP.instruction.trim() || !currentAP.objective.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Create a properly formatted update object that matches the backend's UpdateApDto
      const updateData: UpdateAPDto = {
        title: currentAP.title,
        difficulty: currentAP.difficulty,
        input: currentAP.input || undefined,
        expected_output: currentAP.expected_output || undefined,
        instruction: currentAP.instruction,
        objective: currentAP.objective
      };
      
      // Remove any undefined values to avoid sending empty strings
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateAPDto] === undefined) {
          delete updateData[key as keyof UpdateAPDto];
        }
      });
      
      await updateAP(editingAP.id, updateData);
      
      // Reset form and editing state
      setCurrentAP({
        topic_id: topicId,
        title: "",
        difficulty: "easy",
        input: "",
        expected_output: "",
        instruction: "",
        objective: ""
      });
      setEditingAP(null);
      setIsEditing(false);
      
      // Refresh the APs list
      refreshAPs();
      
      // Switch back to list view
      setActiveTab("list");
    } catch (error) {
      // Error is already handled by the hook
      console.error("Failed to update application problem:", error);
    }
  };

  const handleRemoveAP = async (apId: string) => {
    if (!confirm("Are you sure you want to delete this application problem?")) return;
    
    try {
      await deleteAP(apId);
      
      // Refresh the APs list
      refreshAPs();
    } catch (error) {
      // Error is already handled by the hook
      console.error("Failed to remove application problem:", error);
    }
  };

  const cancelEdit = () => {
    setCurrentAP({
      topic_id: topicId,
      title: "",
      difficulty: "easy",
      input: "",
      expected_output: "",
      instruction: "",
      objective: ""
    });
    setEditingAP(null);
    setIsEditing(false);
    
    // Switch back to list view
    setActiveTab("list");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading application problems...</span>
      </div>
    );
  }

  // Use filtered APs from the store if available, otherwise use the directly fetched APs
  const displayAPs = filteredAPs?.length > 0 ? filteredAPs : aps;

  return (
    <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Application Problems</h2>
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="create">{isEditing ? "Edit" : "Create New"}</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="list">
        {displayAPs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayAPs.map((ap) => (
              <Card key={ap.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">{ap.title}</CardTitle>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {ap.difficulty || "easy"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAP(ap)}
                      disabled={isSaving}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAP(ap.id)}
                      disabled={isSaving}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {ap.input && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Input</h4>
                        <p className="text-sm">{ap.input}</p>
                      </div>
                    )}
                    
                    {ap.expected_output && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Expected Output</h4>
                        <p className="text-sm">{ap.expected_output}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Instructions</h4>
                      <p className="text-sm max-h-24 overflow-y-auto">{ap.instruction}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Learning Objective</h4>
                      <p className="text-sm">{ap.objective}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-md border border-dashed">
            <p className="text-muted-foreground">No application problems added yet.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setActiveTab("create")}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Your First Application Problem
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isEditing ? "Edit Application Problem" : "Add New Application Problem"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apTitle">Title</Label>
                  <Input
                    id="apTitle"
                    value={currentAP.title}
                    onChange={(e) => setCurrentAP({...currentAP, title: e.target.value})}
                    placeholder="Application problem title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="apDifficulty">Difficulty</Label>
                  <Select
                    value={currentAP.difficulty}
                    onValueChange={(value) => setCurrentAP({...currentAP, difficulty: value})}
                  >
                    <SelectTrigger id="apDifficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="apInput">Input Requirements (Optional)</Label>
                  <Input
                    id="apInput"
                    value={currentAP.input}
                    onChange={(e) => setCurrentAP({...currentAP, input: e.target.value})}
                    placeholder="e.g., User should be able to add, edit, and delete tasks"
                  />
                </div>
                
                <div>
                  <Label htmlFor="apOutput">Expected Output (Optional)</Label>
                  <Input
                    id="apOutput"
                    value={currentAP.expected_output}
                    onChange={(e) => setCurrentAP({...currentAP, expected_output: e.target.value})}
                    placeholder="e.g., A functional todo list with CRUD operations"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apInstruction">Instructions</Label>
                  <Textarea
                    id="apInstruction"
                    value={currentAP.instruction}
                    onChange={(e) => setCurrentAP({...currentAP, instruction: e.target.value})}
                    placeholder="Enter detailed instructions for solving the problem"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="apObjective">Learning Objective</Label>
                  <Textarea
                    id="apObjective"
                    value={currentAP.objective}
                    onChange={(e) => setCurrentAP({...currentAP, objective: e.target.value})}
                    placeholder="What will students learn from this problem?"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleAddAP}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Application Problem
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 