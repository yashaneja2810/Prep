"use client";

import { useParams } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";
import { getCohortById, Cohort } from "@/lib/api/cohorts";
import { Toaster } from "@/components/ui/toaster";

// Create a context to share cohort data with child components
export const CohortContext = createContext<{
  cohort: Cohort | null;
  cohortId: string;
  isLoading: boolean;
  error: string | null;
}>({
  cohort: null,
  cohortId: "",
  isLoading: true,
  error: null,
});

// Custom hook to use the cohort context
export const useCohortContext = () => useContext(CohortContext);

export default function CohortLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const cohortId = params.cohortId as string;
  
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cohort data when the component mounts or cohortId changes
  useEffect(() => {
    const fetchCohortData = async () => {
      if (!cohortId) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching cohort data for ID:", cohortId);
        const cohortData = await getCohortById(cohortId);
        setCohort(cohortData);
        console.log("Cohort data loaded successfully");
        setError(null);
      } catch (err) {
        console.error("Error fetching cohort data:", err);
        setError("Failed to load cohort data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCohortData();
  }, [cohortId]);

  return (
    <CohortContext.Provider value={{ cohort, cohortId, isLoading, error }}>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
        <Toaster />
      </div>
    </CohortContext.Provider>
  );
} 