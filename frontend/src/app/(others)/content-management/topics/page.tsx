"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TopicsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main Content Management with topics tab selected
    router.push("/content-management?tab=topics");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirecting to Content Management...</p>
    </div>
  );
} 