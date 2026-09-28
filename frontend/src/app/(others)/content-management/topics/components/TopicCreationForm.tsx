import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "./StepIndicator";
import { TopicBasicInfo } from "./TopicBasicInfo";
import { TopicLearningObjectives } from "./TopicLearningObjectives";
import { TopicLearningOutcomes } from "./TopicLearningOutcomes";
import { TopicModules } from "./TopicModules";
import { StepDebugger } from "./StepDebugger";
import { v4 as uuidv4 } from "uuid";

interface TopicFormData {
  id: string;
  topicCode: string;
  title: string;
  description: string;
  objectives: string[];
  outcomes: string[];
  moduleIds: string[];
}

const initialFormData: TopicFormData = {
  id: uuidv4(),
  topicCode: "",
  title: "",
  description: "",
  objectives: [],
  outcomes: [],
  moduleIds: [],
};

interface TopicCreationFormProps {
  initialData?: Partial<TopicFormData>;
  isEditing?: boolean;
}

export function TopicCreationForm({
  initialData,
  isEditing = false,
}: TopicCreationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TopicFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [showDebugger, setShowDebugger] = useState(false);

  const steps = ["Basic Info", "Learning Objectives", "Learning Outcomes", "Modules"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddObjective = (objective: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, objective],
    }));
  };

  const handleRemoveObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleAddOutcome = (outcome: string) => {
    setFormData((prev) => ({
      ...prev,
      outcomes: [...prev.outcomes, outcome],
    }));
  };

  const handleRemoveOutcome = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      outcomes: prev.outcomes.filter((_, i) => i !== index),
    }));
  };

  const handleModuleSelectionChange = (moduleIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      moduleIds,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would send this data to your API
    console.log("Submitting topic data:", formData);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Navigate back to topics list
    router.push("/content-management/topics");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <TopicBasicInfo
            topicCode={formData.topicCode}
            title={formData.title}
            description={formData.description}
            onInputChange={handleInputChange}
          />
        );
      case 1:
        return (
          <TopicLearningObjectives
            objectives={formData.objectives}
            onAddObjective={handleAddObjective}
            onRemoveObjective={handleRemoveObjective}
          />
        );
      case 2:
        return (
          <TopicLearningOutcomes
            outcomes={formData.outcomes}
            onAddOutcome={handleAddOutcome}
            onRemoveOutcome={handleRemoveOutcome}
          />
        );
      case 3:
        return (
          <TopicModules
            selectedModuleIds={formData.moduleIds}
            onModuleSelectionChange={handleModuleSelectionChange}
          />
        );
      default:
        return null;
    }
  };

  const isFormValid = () => {
    switch (currentStep) {
      case 0:
        return formData.topicCode.trim() !== "" && formData.title.trim() !== "";
      case 1:
        return formData.objectives.length > 0;
      case 2:
        return formData.outcomes.length > 0;
      case 3:
        return formData.moduleIds.length > 0;
      default:
        return false;
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="container max-w-3xl py-6">
      <form onSubmit={handleSubmit}>
        <StepIndicator
          currentStep={currentStep + 1}
          totalSteps={steps.length}
          labels={steps}
        />

        <Card>
          <CardContent className="pt-6">
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDebugger(!showDebugger)}
                >
                  {showDebugger ? "Hide" : "Show"} Debug
                </Button>

                {isLastStep ? (
                  <Button type="submit" disabled={!isFormValid()}>
                    {isEditing ? "Update" : "Create"} Topic
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isFormValid()}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {showDebugger && <StepDebugger currentStep={currentStep} formData={formData} />}
    </div>
  );
} 