import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: Array<{
    id: number;
    label: string;
  }>;
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={`step-group-${step.id}`}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step.id}
            </div>
            <span className="text-xs mt-1">{step.label}</span>
          </div>
          
          {/* Connector line between steps */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 bg-muted"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
} 