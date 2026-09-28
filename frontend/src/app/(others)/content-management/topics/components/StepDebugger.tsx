interface StepDebuggerProps {
  currentStep: number;
  formData: any;
}

export function StepDebugger({ currentStep, formData }: StepDebuggerProps) {
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-muted rounded-lg border shadow-lg max-w-md">
      <h3 className="font-medium mb-2">Debug Info</h3>
      <div className="text-xs">
        <div>Current Step: {currentStep}</div>
        <pre className="mt-2 p-2 bg-background rounded overflow-auto max-h-40">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
} 