import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash, Save, Loader2, Plus, Pencil } from "lucide-react";
import { CP, CreateCPDto } from "@/lib/api/cps";
import { useCPsByTopic, useCPMutations } from "@/hooks/useCPs";

interface TopicCPProps {
  topicId: string;
}

export function TopicCP({ topicId }: TopicCPProps) {
  // Use our custom hooks instead of direct API calls
  const { 
    cps, 
    isLoading, 
    error, 
    mutate: refreshCPs,
    filteredCPs,
    searchTerm,
    setSearchTerm,
    selectedDifficulty,
    setSelectedDifficulty,
    filterCPs,
    resetFilters
  } = useCPsByTopic(topicId);

  const {
    createCP: createCPMutation,
    updateCP: updateCPMutation,
    deleteCP: deleteCPMutation,
    isSubmitting,
    formErrors
  } = useCPMutations();

  const [currentCP, setCurrentCP] = useState<CreateCPDto>({
    topic_id: topicId,
    title: "",
    difficulty: "easy",
    code: "",
    output: "",
    explanation: ""
  });
  const [editingCP, setEditingCP] = useState<CP | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  // Update topic_id if topicId prop changes
  useEffect(() => {
    setCurrentCP(prev => ({
      ...prev,
      topic_id: topicId
    }));
  }, [topicId]);

  const handleAddCP = async () => {
    if (!topicId) return;
    if (!currentCP.title.trim() || !currentCP.code.trim() || !currentCP.output.trim() || !currentCP.explanation.trim()) {
      return;
    }

    try {
      await createCPMutation({
        ...currentCP,
        topic_id: topicId
      });
      
      // Reset form
      setCurrentCP({
        topic_id: topicId,
        title: "",
        difficulty: "easy",
        code: "",
        output: "",
        explanation: ""
      });
      
      // Refresh the CP list
      refreshCPs();
    } catch (error) {
      console.error("Failed to add concept practice:", error);
    }
  };

  const handleUpdateCP = async (cpId: string, updatedData: Partial<CP>) => {
    try {
      await updateCPMutation(cpId, updatedData);
      refreshCPs();
    } catch (error) {
      console.error("Failed to update concept practice:", error);
    }
  };

  const handleRemoveCP = async (cpId: string) => {
    if (!confirm("Are you sure you want to delete this concept practice?")) return;
    
    try {
      await deleteCPMutation(cpId);
      refreshCPs();
    } catch (error) {
      console.error("Failed to remove concept practice:", error);
    }
  };

  const handleEditCP = (cp: CP) => {
    setEditingCP(cp);
    setCurrentCP({
      topic_id: topicId,
      title: cp.title,
      difficulty: cp.difficulty || "easy",
      code: cp.code,
      output: cp.output,
      explanation: cp.explanation
    });
    setIsEditing(true);
    
    // Fix for tab switching - use the Tabs component state directly
    setActiveTab("create");
  };

  const handleSaveEdit = async () => {
    if (!editingCP) return;
    if (!currentCP.title.trim() || !currentCP.code.trim() || !currentCP.output.trim() || !currentCP.explanation.trim()) {
      return;
    }

    try {
      // Create a properly formatted update object
      await updateCPMutation(editingCP.id, {
        title: currentCP.title,
        difficulty: currentCP.difficulty,
        code: currentCP.code,
        output: currentCP.output,
        explanation: currentCP.explanation
      });
      
      // Reset form and editing state
      setCurrentCP({
        topic_id: topicId,
        title: "",
        difficulty: "easy",
        code: "",
        output: "",
        explanation: ""
      });
      setEditingCP(null);
      setIsEditing(false);
      
      // Switch back to list view using the state
      setActiveTab("list");
      
      // Refresh the CP list
      refreshCPs();
    } catch (error) {
      console.error("Failed to update concept practice:", error);
    }
  };

  const cancelEdit = () => {
    setCurrentCP({
      topic_id: topicId,
      title: "",
      difficulty: "easy",
      code: "",
      output: "",
      explanation: ""
    });
    setEditingCP(null);
    setIsEditing(false);
    
    // Switch back to list view using the state
    setActiveTab("list");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading concept practices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-destructive/10 rounded-md border border-dashed border-destructive">
        <p className="text-destructive">Error loading concept practices: {error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => refreshCPs()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Concept Practices</h2>
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="create">{isEditing ? "Edit" : "Create New"}</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="list">
        {filteredCPs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCPs.map((cp) => (
              <Card key={cp.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">{cp.title}</CardTitle>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {cp.difficulty || "easy"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCP(cp)}
                      disabled={isSubmitting}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCP(cp.id)}
                    disabled={isSubmitting}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Code</h4>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                        {cp.code}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Expected Output</h4>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {cp.output}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Explanation</h4>
                      <p className="text-sm max-h-24 overflow-y-auto">{cp.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-md border border-dashed">
            <p className="text-muted-foreground">No concept practices added yet.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setActiveTab("create")}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Your First Concept Practice
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isEditing ? "Edit Concept Practice" : "Add New Concept Practice"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cpTitle">Title</Label>
                  <Input
                    id="cpTitle"
                    value={currentCP.title}
                    onChange={(e) => setCurrentCP({...currentCP, title: e.target.value})}
                    placeholder="Concept practice title"
                  />
                  {formErrors.title && (
                    <p className="text-sm text-destructive mt-1">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cpDifficulty">Difficulty</Label>
                  <Select
                    value={currentCP.difficulty}
                    onValueChange={(value) => setCurrentCP({...currentCP, difficulty: value})}
                  >
                    <SelectTrigger id="cpDifficulty">
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
                  <Label htmlFor="cpOutput">Expected Output</Label>
                  <Input
                    id="cpOutput"
                    value={currentCP.output}
                    onChange={(e) => setCurrentCP({...currentCP, output: e.target.value})}
                    placeholder="3"
                  />
                  {formErrors.output && (
                    <p className="text-sm text-destructive mt-1">{formErrors.output}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cpCode">Code Example</Label>
                  <Textarea
                    id="cpCode"
                    value={currentCP.code}
                    onChange={(e) => setCurrentCP({...currentCP, code: e.target.value})}
                    placeholder="const arr = [1, 2, 3];\nconsole.log(arr.length);"
                    className="h-20 font-mono"
                  />
                  {formErrors.code && (
                    <p className="text-sm text-destructive mt-1">{formErrors.code}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cpExplanation">Explanation</Label>
                  <Textarea
                    id="cpExplanation"
                    value={currentCP.explanation}
                    onChange={(e) => setCurrentCP({...currentCP, explanation: e.target.value})}
                    placeholder="This code demonstrates how to get the length of an array in JavaScript."
                    className="h-20"
                  />
                  {formErrors.explanation && (
                    <p className="text-sm text-destructive mt-1">{formErrors.explanation}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="button" 
                onClick={isEditing ? handleSaveEdit : handleAddCP}
                disabled={isSubmitting || !currentCP.title.trim() || !currentCP.code.trim() || !currentCP.output.trim() || !currentCP.explanation.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Saving..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Save Changes" : "Add Concept Practice"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 