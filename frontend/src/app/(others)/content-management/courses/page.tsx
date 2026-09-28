"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CoursesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main content management with courses tab selected
    router.push("/content-management?tab=courses");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirecting to content management...</p>
    </div>
  );
} 