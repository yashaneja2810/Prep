import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash, Plus, Save, Info, Loader2, GripVertical, Edit } from "lucide-react";
import { 
  OutcomeHeading,
  OutcomeItem,
  CreateOutcomeDto,
  OutcomeResponse,
  OUTCOMES_SWR_KEY,
  OUTCOME_BY_ID_SWR_KEY,
  OUTCOMES_BY_TOPIC_SWR_KEY
} from "@/lib/api/outcomes";
import { apiRequest } from "@/helpers/request";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TopicLearningOutcomesProps {
  topicId?: string;
  isEditMode?: boolean;
}

export function TopicLearningOutcomes({
  topicId,
  isEditMode = false
}: TopicLearningOutcomesProps) {
  const [headings, setHeadings] = useState<OutcomeHeading[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeHeadingTab, setActiveHeadingTab] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  
  // State for the current inputs
  const [currentHeading, setCurrentHeading] = useState("");
  const [currentItem, setCurrentItem] = useState("");
  
  // Dialog state for editing headings
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHeadingId, setEditingHeadingId] = useState<string | null>(null);
  const [editingHeadingText, setEditingHeadingText] = useState("");

  // Load existing outcome if we have a topic ID
  useEffect(() => {
    if (topicId) {
      loadExistingOutcome();
    }
  }, [topicId]);

  // Set active heading tab when headings change
  useEffect(() => {
    if (headings.length > 0 && !activeHeadingTab) {
      setActiveHeadingTab(headings[0].id);
    }
  }, [headings, activeHeadingTab]);

  const loadExistingOutcome = async () => {
    if (!topicId) return;
    
    setLoading(true);
    try {
      // Try to find an existing outcome for this topic
      const existingOutcomes = await apiRequest.get<OutcomeResponse[]>(OUTCOMES_BY_TOPIC_SWR_KEY(topicId));
      
      if (existingOutcomes && existingOutcomes.length > 0) {
        // Use the first outcome if multiple exist
        const existingOutcome = existingOutcomes[0];
        
        // If we found an existing outcome, load its details
        setOutcomeId(existingOutcome.id);
        
        // Now fetch the complete outcome with all its headings
        const fullOutcome = await apiRequest.get<OutcomeResponse>(OUTCOME_BY_ID_SWR_KEY(existingOutcome.id));
        if (fullOutcome && fullOutcome.headings) {
          setHeadings(fullOutcome.headings || []);
          if (fullOutcome.headings.length > 0) {
            setActiveHeadingTab(fullOutcome.headings[0].id);
          }
        }
      }
      // If no existing outcome is found, we'll create one when the user adds a heading
    } catch (error) {
      console.error("Error loading outcome:", error);
      // Don't show error toast on initial load
    } finally {
      setLoading(false);
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    const { source, destination, type } = result;
    
    if (!destination) return; // dropped outside the list
    
    if (type === "HEADINGS") {
      // Reorder headings
      const reorderedHeadings = Array.from(headings);
      const [removed] = reorderedHeadings.splice(source.index, 1);
      reorderedHeadings.splice(destination.index, 0, removed);
      
      // Update order_index to reflect new positions
      const updatedHeadings = reorderedHeadings.map((heading, index) => ({
        ...heading,
        order_index: index + 1
      }));
      
      setHeadings(updatedHeadings);
      setUnsavedChanges(true);
      toast.success("Headings reordered");
    } 
    else if (type === "ITEMS") {
      // Find the active heading
      const activeHeading = headings.find(h => h.id === activeHeadingTab);
      if (!activeHeading) return;
      
      // Reorder items
      const reorderedItems = Array.from(activeHeading.items);
      const [removed] = reorderedItems.splice(source.index, 1);
      reorderedItems.splice(destination.index, 0, removed);
      
      // Update order_index to reflect new positions
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order_index: index + 1
      }));
      
      // Update heading with new item order
      setHeadings(prev => 
        prev.map(heading => 
          heading.id === activeHeadingTab 
            ? { ...heading, items: updatedItems }
            : heading
        )
      );
      
      setUnsavedChanges(true);
      toast.success("Items reordered");
    }
  };

  // Add a new heading
  const handleAddHeading = async () => {
    if (!currentHeading.trim()) {
      toast.error("Heading cannot be empty");
      return;
    }

    if (!topicId) {
      toast.error("Please save the topic first to add outcomes");
      return;
    }

    setSaving(true);
    setPendingAction("adding_heading");
    
    try {
      // Create a temporary heading with a unique ID
      const tempHeading: OutcomeHeading = {
        id: `temp-${Date.now()}`,
        heading: currentHeading,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to local state
      setHeadings(prev => [...prev, tempHeading]);
      setActiveHeadingTab(tempHeading.id);
      setUnsavedChanges(true);
      
      toast.success("Heading added");
      toast.info("Don't forget to save all changes when you're done", {
        duration: 3000
      });
      
      setCurrentHeading("");
    } catch (error) {
      toast.error("Failed to add heading");
      console.error("Error adding heading:", error);
    } finally {
      setSaving(false);
      setPendingAction(null);
    }
  };

  // Add a new item to a heading
  const handleAddItem = async () => {
    if (!currentItem.trim() || !activeHeadingTab) {
      toast.error("Outcome item text cannot be empty");
      return;
    }

    setSaving(true);
    setPendingAction("adding_item");
    
    try {
      const tempItem: OutcomeItem = {
        id: `temp-item-${Date.now()}`,
        text: currentItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add item to the active heading
      setHeadings(prev => 
        prev.map(heading => {
          if (heading.id === activeHeadingTab) {
            return {
              ...heading,
              items: [...heading.items, tempItem]
            };
          }
          return heading;
        })
      );
      
      setUnsavedChanges(true);
      toast.success("Item added");
      toast.info("Don't forget to save all changes when you're done", {
        duration: 3000
      });
      
      setCurrentItem("");
    } catch (error) {
      toast.error("Failed to add item");
      console.error("Error adding item:", error);
    } finally {
      setSaving(false);
      setPendingAction(null);
    }
  };

  // Get items for active heading
  const getActiveHeadingItems = () => {
    const activeHeading = headings.find(h => h.id === activeHeadingTab);
    return activeHeading ? activeHeading.items : [];
  };

  // Remove a heading
  const handleRemoveHeading = async (headingId: string) => {
    if (!headingId) return;
    
    if (!confirm("Are you sure you want to remove this heading and all its items?")) {
      return;
    }
    
    setSaving(true);
    setPendingAction("removing_heading");
    
    try {
      // Remove from local state first
      const updatedHeadings = headings.filter(h => h.id !== headingId);
      setHeadings(updatedHeadings);
      
      // Update active tab if needed
      if (activeHeadingTab === headingId) {
        setActiveHeadingTab(updatedHeadings.length > 0 ? updatedHeadings[0].id : null);
      }
      
      // If this is a real heading (not temp), try to delete it from the API
      if (!headingId.startsWith('temp-')) {
        try {
          await apiRequest.delete(`${OUTCOMES_SWR_KEY}/heading/${headingId}`);
        } catch (error) {
          console.error("Failed to delete heading from API:", error);
        }
      }
      
      setUnsavedChanges(true);
      toast.success("Heading removed");
    } catch (error) {
      toast.error("Failed to remove heading");
      console.error("Error removing heading:", error);
    } finally {
      setSaving(false);
      setPendingAction(null);
    }
  };

  // Remove an item
  const handleRemoveItem = async (itemId: string, headingId: string) => {
    if (!itemId || !headingId) return;
    
    if (!confirm("Are you sure you want to remove this item?")) {
      return;
    }
    
    setSaving(true);
    setPendingAction("removing_item");
    
    try {
      // Remove from local state first
      setHeadings(prev => 
        prev.map(heading => {
          if (heading.id === headingId) {
            return {
              ...heading,
              items: heading.items.filter(item => item.id !== itemId)
            };
          }
          return heading;
        })
      );
      
      // If this is a real item (not temp), try to delete it from the API
      if (!itemId.startsWith('temp-')) {
        try {
          await apiRequest.delete(`${OUTCOMES_SWR_KEY}/item/${itemId}`);
        } catch (error) {
          console.error("Failed to delete item from API:", error);
        }
      }
      
      setUnsavedChanges(true);
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error("Error removing item:", error);
    } finally {
      setSaving(false);
      setPendingAction(null);
    }
  };

  // Save all headings and items at once
  const handleSaveAllChanges = async () => {
    if (!topicId) {
      toast.error("Cannot save changes: Topic ID is missing");
      console.error("Cannot save outcomes: Topic ID is missing");
      return;
    }

    console.log("Saving outcomes for topic ID:", topicId);
    console.log("Current headings to save:", headings);

    setSaving(true);
    setPendingAction("saving_all");
    
    try {
      // Create a new deployment with all headings and items (both temp and persisted ones)
      const deploymentData = {
        topic_id: topicId,
        outcomes: headings.map(heading => ({
          heading: heading.heading,
          items: heading.items.map(item => ({
            text: item.text
          }))
        }))
      };
      
      console.log("Sending outcome data to API:", deploymentData);
      
      // Ask for confirmation
      if (!confirm("Save all your learning outcomes? This will save all headings and items at once.")) {
        toast.info("Save cancelled");
        setSaving(false);
        setPendingAction(null);
        return;
      }
      
      // Create or update outcome with all data
      let newOutcome;
      
      if (outcomeId) {
        // If we have an outcome ID, update it
        newOutcome = await apiRequest.put<OutcomeResponse>(`${OUTCOMES_SWR_KEY}/${outcomeId}`, deploymentData);
      } else {
        // Otherwise create a new one
        newOutcome = await apiRequest.post<OutcomeResponse>(OUTCOMES_SWR_KEY, deploymentData);
      }
      
      console.log("Received response from API:", newOutcome);
      
      // Update our state with the server data (now with real IDs)
      setOutcomeId(newOutcome.id);
      setHeadings(newOutcome.headings || []);
      if (newOutcome.headings && newOutcome.headings.length > 0) {
        setActiveHeadingTab(newOutcome.headings[0].id);
      }
      
      setUnsavedChanges(false);
      toast.success("All learning outcomes saved successfully");
    } catch (error) {
      console.error("Error saving learning outcomes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
      setPendingAction(null);
    }
  };

  // Update heading text
  const handleUpdateHeading = async (headingId: string, newHeading: string) => {
    if (!headingId || !newHeading.trim()) return;
    
    try {
      // Always update the UI first
      setHeadings(prev => 
        prev.map(heading => {
          if (heading.id === headingId) {
            return { ...heading, heading: newHeading };
          }
          return heading;
        })
      );
      
      // Only call the API if it's not a temp heading
      if (!headingId.startsWith('temp-')) {
        try {
          await apiRequest.put(`${OUTCOMES_SWR_KEY}/heading/${headingId}`, { heading: newHeading });
          toast.success("Heading updated");
        } catch (error) {
          console.error("Failed to update heading:", error);
          toast.error("Failed to update heading on server");
        }
      } else {
        toast.success("Heading updated locally");
      }
      setUnsavedChanges(true);
    } catch (error) {
      toast.error("Failed to update heading");
      console.error(error);
    }
  };

  // Update item text
  const handleUpdateItem = async (itemId: string, newText: string, headingId: string) => {
    if (!itemId || !newText.trim() || !headingId) return;
    
    try {
      // Always update the UI first
      setHeadings(prev => 
        prev.map(heading => {
          if (heading.id === headingId) {
            return {
              ...heading,
              items: heading.items.map(item => {
                if (item.id === itemId) {
                  return { ...item, text: newText };
                }
                return item;
              })
            };
          }
          return heading;
        })
      );
      
      // Only call the API if it's not a temp item
      if (!itemId.startsWith('temp-')) {
        try {
          await apiRequest.put(`${OUTCOMES_SWR_KEY}/item/${itemId}`, { text: newText });
          toast.success("Item updated");
        } catch (error) {
          console.error("Failed to update item:", error);
          toast.error("Failed to update item on server");
        }
      } else {
        toast.success("Item updated locally");
      }
      setUnsavedChanges(true);
    } catch (error) {
      toast.error("Failed to update item");
      console.error(error);
    }
  };

  if (!topicId && !isEditMode) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Learning Outcomes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please save the basic topic information first to add learning outcomes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Learning Outcomes</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4">
                <p className="text-sm mb-2">Adding learning outcomes:</p>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  <li>Add headings to group related outcomes</li>
                  <li>Add items under each heading</li>
                  <li>Drag and drop to reorder</li>
                  <li>Click "Save All Changes" when done</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {unsavedChanges && (
          <Button 
            onClick={handleSaveAllChanges} 
            disabled={saving || loading}
            className="gap-2"
            variant="default"
          >
            {saving && pendingAction === "saving_all" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Changes
          </Button>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground -mt-2">
        Define measurable outcomes students should achieve from this topic
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left panel: Add new heading */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-3">Add New Heading</h3>
            <div className="flex gap-2">
              <Input
                value={currentHeading}
                onChange={(e) => setCurrentHeading(e.target.value)}
                placeholder="Enter heading name..."
                className="flex-1"
                disabled={saving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddHeading();
                  }
                }}
              />
              <Button 
                onClick={handleAddHeading} 
                disabled={saving || !currentHeading.trim()}
                size="sm"
              >
                {saving && pendingAction === "adding_heading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>

            {headings.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Manage Headings</h3>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="headings-list" type="HEADINGS" direction="vertical">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="border rounded-md p-1"
                      >
                        {headings.map((heading, index) => (
                          <Draggable 
                            key={heading.id} 
                            draggableId={heading.id} 
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`
                                  flex items-center justify-between p-2 mb-1 rounded-md
                                  ${activeHeadingTab === heading.id ? 'bg-primary/10' : 'bg-muted/40'} 
                                  ${heading.id.startsWith('temp-') ? "italic" : ""}
                                  ${activeHeadingTab === heading.id ? "border-l-4 border-primary" : ""}
                                `}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => setActiveHeadingTab(heading.id)}
                                  >
                                    {heading.heading}
                                    {heading.id.startsWith('temp-') && (
                                      <span className="text-xs ml-1 text-yellow-500">*</span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-50 hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingHeadingId(heading.id);
                                      setEditingHeadingText(heading.heading);
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveHeading(heading.id);
                                    }}
                                    className="h-7 w-7"
                                    disabled={saving}
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Right panel: Manage items in the active heading */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-3">
              {activeHeadingTab 
                ? `Learning Outcomes: ${headings.find(h => h.id === activeHeadingTab)?.heading}`
                : "Select a heading to add outcomes"}
              {activeHeadingTab?.startsWith('temp-') && (
                <span className="text-xs ml-2 text-yellow-500">(Not yet saved)</span>
              )}
            </h3>
            
            {activeHeadingTab ? (
              <>
        <div className="flex gap-2 mb-4">
          <Input
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    placeholder="Enter an outcome item..."
            className="flex-1"
                    disabled={saving || !activeHeadingTab}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                        handleAddItem();
              }
            }}
          />
                  <Button 
                    onClick={handleAddItem} 
                    disabled={saving || !currentItem.trim() || !activeHeadingTab}
                    className="whitespace-nowrap"
                  >
                    {saving && pendingAction === "adding_item" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add
                  </Button>
        </div>
        
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-2">Current Outcomes</h4>
                  <ScrollArea className="h-[300px] rounded-md border">
                    <div className="p-2">
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : getActiveHeadingItems().length === 0 ? (
                        <p className="text-center py-8 text-sm text-muted-foreground">
                          No outcomes added to this heading yet
                        </p>
                      ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="items-list" type="ITEMS">
                            {(provided) => (
                              <div 
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2"
                              >
                                {getActiveHeadingItems().map((item, index) => (
                                  <Draggable 
                                    key={item.id} 
                                    draggableId={item.id} 
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="flex items-center justify-between p-2.5 bg-muted/40 rounded-md"
                                      >
                  <div className="flex items-center gap-2">
                                          <div {...provided.dragHandleProps}>
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                          </div>
                                          <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </div>
                                          <span className="text-sm">
                                            {item.text}
                                            {item.id.startsWith('temp-') && (
                                              <span className="text-xs ml-1 text-yellow-500">(local)</span>
                                            )}
                                          </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveItem(item.id, activeHeadingTab as string)}
                                          disabled={saving}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </>
            ) : headings.length === 0 ? (
              <div className="text-center py-6 bg-muted/30 rounded-md border border-dashed">
                <p className="text-muted-foreground mb-2">No headings added yet</p>
                <p className="text-xs text-muted-foreground">
                  First, add a heading on the left panel to organize your outcomes
                </p>
          </div>
        ) : (
              <div className="text-center py-6 bg-muted/30 rounded-md border border-dashed">
                <p className="text-muted-foreground">
                  Select a heading from the list on the left to add outcomes
                </p>
          </div>
        )}
          </CardContent>
        </Card>
      </div>
    
    {/* Edit Heading Dialog */}
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Heading</DialogTitle>
          <DialogDescription>
            Make changes to the heading name. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="heading"
              className="col-span-4"
              value={editingHeadingText}
              onChange={(e) => setEditingHeadingText(e.target.value)}
              placeholder="Enter heading name..."
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setEditDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (editingHeadingId && editingHeadingText.trim()) {
                handleUpdateHeading(editingHeadingId, editingHeadingText.trim());
                setEditDialogOpen(false);
              }
            }}
            disabled={!editingHeadingText.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
} 