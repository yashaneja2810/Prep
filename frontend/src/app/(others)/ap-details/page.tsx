"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Braces, Home, CheckCircle, Circle, Code, FileCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { submitAp, getUserApSubmissions } from "@/lib/api/submissions";
import { toast } from "sonner";

export default function APDetailsPage() {
  const [ap, setAP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("learning-objective");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [previousSubmissions, setPreviousSubmissions] = useState<any[]>([]);
  const [codeValue, setCodeValue] = useState('// Write your solution here');
  
  const router = useRouter();
  
  useEffect(() => {
    const fetchData = async () => {
    try {
      // Get the selected AP from localStorage
      const selectedAP = localStorage.getItem('selected-ap');
      if (selectedAP) {
        const parsedAP = JSON.parse(selectedAP);
        setAP(parsedAP);
        
        // Fetch user's AP submissions from the API
        try {
          const submissionsResponse = await getUserApSubmissions();
          
          // Find submissions for this specific AP
          const apSubmissions = submissionsResponse.filter(
            submission => submission.ap_id === parsedAP.id
          );
          
          // Set completed status based on whether there are any submissions
          setIsCompleted(apSubmissions.length > 0);
          
          // Store previous submissions
          setPreviousSubmissions(apSubmissions);
          
          // If there are previous submissions, set the code value to the most recent one
          if (apSubmissions.length > 0) {
            // Sort by submitted_at in descending order and take the first one
            const mostRecent = [...apSubmissions].sort(
              (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
            )[0];
            
            setCodeValue(mostRecent.submission_code);
          }
        } catch (err) {
          console.error("Failed to fetch user submissions:", err);
          // Continue with default values if submissions can't be fetched
          setIsCompleted(false);
        }
      } else {
        setError("No application practice selected. Please select an AP from the resources page.");
      }
    } catch (err) {
      setError("Failed to load application practice details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
    };
    
    fetchData();
  }, []);
  
  const handleGoBack = () => {
    try {
      window.close();
      // If window.close() doesn't work (which can happen in some browsers for windows not opened by script)
      setTimeout(() => {
        router.push('/vd-found/resources');
      }, 100);
    } catch (err) {
      router.push('/vd-found/resources');
    }
  };
  
  const toggleCompletion = async () => {
    if (!ap) return;
    
    const topicId = localStorage.getItem('current-topic-id') || 'default';
    const completedAPs = JSON.parse(localStorage.getItem(`completed-aps-${topicId}`) || '[]');
    
    try {
    if (completedAPs.includes(ap.id)) {
        // Remove from completed APs - only update local storage
        // APs don't have their own completion endpoint, so we just track them locally
        const updatedCompletedAPs = completedAPs.filter((id: string) => id !== ap.id);
        localStorage.setItem(`completed-aps-${topicId}`, JSON.stringify(updatedCompletedAPs));
      setIsCompleted(false);
        console.log("AP marked as not completed locally");
    } else {
        // Add to completed APs - only update local storage
        // AP submissions are already tracked on the server via the submitAp endpoint
        const updatedCompletedAPs = [...completedAPs, ap.id];
        localStorage.setItem(`completed-aps-${topicId}`, JSON.stringify(updatedCompletedAPs));
      setIsCompleted(true);
        console.log("AP marked as completed locally");
    }
    } catch (error) {
      console.error(`Failed to ${completedAPs.includes(ap.id) ? 'remove' : 'mark'} AP completion:`, error);
      toast.error(`Failed to ${completedAPs.includes(ap.id) ? 'remove' : 'mark'} AP completion. Please try again.`);
    }
  };
  
  const handleSubmit = async () => {
    if (!ap) return;
    
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitStatus(null);
    
    try {
      const response = await submitAp({
        ap_id: ap.id,
        submission_code: codeValue
      });
      
      // Mark as completed if not already
      if (!isCompleted) {
        toggleCompletion();
      }
      
      setSubmitMessage("Solution submitted successfully!");
      setSubmitStatus('success');
      console.log("AP solution submitted:", response);
    } catch (error) {
      console.error("Failed to submit AP solution:", error);
      setSubmitMessage("Failed to submit solution. Please try again.");
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading AP details...</p>
      </div>
    );
  }
  
  if (error || !ap) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-md">
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="text-center">Application Practice</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <p className="text-center text-muted-foreground">{error || "No application practice found"}</p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button 
                onClick={() => router.push('/vd-found/resources')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Resources Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 rounded-full"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{ap.title}</h1>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 px-3 py-1 text-xs">
                {ap.difficulty}
              </Badge>
            </div>
          </div>
          
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 px-4 py-2 ${isCompleted ? "bg-purple-600 hover:bg-purple-700" : ""}`}
            onClick={toggleCompletion}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                Mark as Complete
              </>
            )}
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-border overflow-y-auto">

          <Tabs 
            defaultValue="learning-objective" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-y border-border sticky top-0 bg-background z-10">
              <TabsList className="w-full justify-start rounded-none bg-background h-12 px-6">
                <TabsTrigger 
                  value="learning-objective" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:shadow-none rounded-none"
                >
                  Learning Objective
                </TabsTrigger>
                <TabsTrigger 
                  value="instructions" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:shadow-none rounded-none"
                >
                  Instructions
                </TabsTrigger>
                <TabsTrigger 
                  value="input" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:shadow-none rounded-none"
                >
                  Input
                </TabsTrigger>
                <TabsTrigger 
                  value="expected-output" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:shadow-none rounded-none"
                >
                  Expected Output
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="learning-objective" className="p-6 space-y-6 mt-0">
              <div className="bg-card rounded-lg p-5 shadow-sm">
                <h3 className="font-medium text-lg mb-3 text-purple-600">Learning Objective:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {ap.learningObjectives?.map((objective: string, index: number) => (
                    <li key={index} className="leading-relaxed">{objective}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="p-6 mt-0">
              <div className="bg-card rounded-lg p-5 shadow-sm">
                <h3 className="font-medium text-lg mb-3 text-purple-600">Instructions:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {ap.instructions?.map((instruction: string, index: number) => (
                    <li key={index} className="leading-relaxed">{instruction}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="input" className="p-6 mt-0">
              <div className="bg-card rounded-lg p-5 shadow-sm space-y-5">
                <div>
                  <h3 className="font-medium text-lg mb-3 text-purple-600">Input:</h3>
                  <div className="bg-muted p-4 rounded-md text-sm font-mono">
                    {ap.sampleInput}
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden mt-6">
                  <div className="p-4 bg-card">
                    <div>
                      <span className="font-mono text-sm font-medium">Input: </span>
                      <span className="font-mono text-sm">{ap.sampleInput}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="expected-output" className="p-6 mt-0">
              <div className="bg-card rounded-lg p-5 shadow-sm space-y-5">
                <div>
                  <h3 className="font-medium text-lg mb-3 text-purple-600">Expected Output:</h3>
                  <div className="bg-muted p-4 rounded-md text-sm font-mono">
                    {ap.expectedOutput}
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden mt-6">
                  <div className="p-4 bg-card">
                    <span className="text-sm leading-relaxed">{ap.explanation || "Follow the instructions to solve this problem."}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col border-border">
          <div className="border-b border-border bg-card/30">
            <div className="flex items-center h-14 px-6">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-lg">Solution</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-card/10 p-0 overflow-auto">
            <Textarea 
              className="font-mono text-sm w-full h-full resize-none bg-muted/30 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-6"
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              spellCheck={false}
            />
          </div>
          
          <div className="border-t border-border p-5 bg-card/30">
            <div className="flex flex-col gap-2">
              {submitMessage && (
                <div className={`px-3 py-2 rounded-md text-sm ${
                  submitStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {submitMessage}
                </div>
              )}
            <div className="flex justify-end">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2 h-10 text-base font-medium"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 