"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgramContext } from "./layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Video, Award, Code } from "lucide-react";

export default function ProgramPage() {
  const router = useRouter();
  const { program, programId, isLoading, error } = useProgramContext();

  // Redirect to resources page if program is loaded
  useEffect(() => {
    if (program && !isLoading) {
      router.push(`/programs/${programId}/resources`);
    }
  }, [program, isLoading, programId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Loading program...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>Failed to load program</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null; // This will not be rendered due to the redirect
} 