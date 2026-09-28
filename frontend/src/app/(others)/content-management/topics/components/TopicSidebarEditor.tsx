import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopicSidebarEditorProps {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function TopicSidebarEditor({
  steps,
  currentStep,
  onStepClick,
}: TopicSidebarEditorProps) {
  return (
    <div className="w-64 border-r h-full p-4 space-y-2">
      <h3 className="font-medium mb-4">Topic Editor</h3>
      {steps.map((step, index) => (
        <Button
          key={index}
          variant="ghost"
          className={cn(
            "w-full justify-start",
            currentStep === index
              ? "bg-muted font-medium"
              : "font-normal"
          )}
          onClick={() => onStepClick(index)}
        >
          {step}
        </Button>
      ))}
    </div>
  );
} 