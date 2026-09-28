import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Circle, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { markOutcomeCompleted, deleteOutcomeCompletion, getUserOutcomeCompletions, OutcomeCompletion } from "@/lib/api/completions";
import { toast } from "sonner";

export default function LearningOutcomesTab({ topicId, outcomes = [] }: { topicId: string, outcomes?: string[] }) {
  const [loading, setLoading] = useState(true);
  const [completedOutcomes, setCompletedOutcomes] = useState<string[]>([]);
  
  // Auth is handled by backend
  const userId = null;

  useEffect(() => {
    try {
      // Fetch completion data from server
      const fetchCompletionData = async () => {
        try {
          const completions = await getUserOutcomeCompletions();
          
          // Filter completions that match the current topic's outcomes
          const serverCompletedOutcomes = completions
            .filter(completion => outcomes.includes(completion.outcome_item_id))
            .map(completion => completion.outcome_item_id);
              
          setCompletedOutcomes(serverCompletedOutcomes);
        } catch (error) {
          console.error("Failed to fetch outcome completion data:", error);
          
          // Fallback to localStorage if API fails
          const savedCompletedOutcomes = localStorage.getItem(`completed-outcomes-${topicId}`);
          if (savedCompletedOutcomes) {
            setCompletedOutcomes(JSON.parse(savedCompletedOutcomes));
          } else {
            setCompletedOutcomes([]);
          }
        }
      };
      
      fetchCompletionData();
    } catch (err) {
      console.error("Failed to load completed outcomes:", err);
    } finally {
      setLoading(false);
    }
  }, [topicId, outcomes]);

  const toggleOutcome = async (outcomeId: string) => {
    // Auth is handled by backend
    let newCompletedOutcomes: string[];
    const isCurrentlyCompleted = completedOutcomes.includes(outcomeId);
    
    try {
      if (isCurrentlyCompleted) {
        // Remove from completed outcomes - call the delete API
        await deleteOutcomeCompletion({
          outcome_item_id: outcomeId
        });
        console.log("Outcome completion removed from server");
        newCompletedOutcomes = completedOutcomes.filter(id => id !== outcomeId);
      } else {
        // Add to completed outcomes - call the mark completed API
        await markOutcomeCompleted({
          outcome_item_id: outcomeId
        });
        console.log("Outcome marked as completed on server");
        newCompletedOutcomes = [...completedOutcomes, outcomeId];
      }
      
      // Update local state
      setCompletedOutcomes(newCompletedOutcomes);
      localStorage.setItem(`completed-outcomes-${topicId}`, JSON.stringify(newCompletedOutcomes));
    } catch (error) {
      console.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} outcome completion:`, error);
      toast.error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'mark'} outcome completion. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading outcomes...</span>
      </div>
    );
  }

  if (!outcomes || outcomes.length === 0) {
    return (
      <Alert variant="default" className="m-6">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>No Learning Outcomes Available</AlertTitle>
        <AlertDescription>
          There are no learning outcomes defined for this topic.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">Learning Outcomes</h3>
      <p className="text-muted-foreground">
        Check off each outcome once you feel confident in your understanding.
      </p>
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        {outcomes.map((outcome, idx) => (
          <div
            key={outcome}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={() => toggleOutcome(outcome)}
            >
              {completedOutcomes.includes(outcome) ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className={cn(
                "text-base",
                completedOutcomes.includes(outcome) && "text-muted-foreground line-through"
              )}>
                {outcome}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 