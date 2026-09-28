"use client";

import { useParams } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";
import { getProgramById, Program } from "@/lib/api/programs";

// Create a context to share program data with child components
export const ProgramContext = createContext<{
  program: Program | null;
  programId: string;
  isLoading: boolean;
  error: string | null;
}>({
  program: null,
  programId: "",
  isLoading: true,
  error: null,
});

// Custom hook to use the program context
export const useProgramContext = () => useContext(ProgramContext);

export default function ProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const programId = params.program as string;
  
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch program data when the component mounts or programId changes
  useEffect(() => {
    const fetchProgramData = async () => {
      if (!programId) return;
      
      try {
        setIsLoading(true);
        const programData = await getProgramById(programId);
        setProgram(programData);
        setError(null);
      } catch (err) {
        console.error("Error fetching program data:", err);
        setError("Failed to load program data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgramData();
  }, [programId]);

  return (
    <ProgramContext.Provider value={{ program, programId, isLoading, error }}>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProgramContext.Provider>
  );
} 