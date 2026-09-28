"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Initialize sample enrolled cohorts data for testing
    const sampleCohorts = [
      { id: "c1", title: "Foundations C1" },
    ];
    
    // Only set if not already set
    if (!localStorage.getItem("enrolled-cohorts")) {
      localStorage.setItem("enrolled-cohorts", JSON.stringify(sampleCohorts));
    }
    
    // Redirect to login page immediately
    router.push('/login');
  }, [router]);
  
  // Return minimal content while redirecting
  return null;
}
