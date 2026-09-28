"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProgramContext } from "../../layout";
import { useAuthStore } from "@/lib/store/auth";
import { useTopicCompletions } from "@/hooks/useCompletions";

export default function TopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const { programId } = useProgramContext();
  const topicId = params.topic as string;
  const { user } = useAuthStore();
  
  // Get user ID in a stable way
  const userId = useMemo(() => user?.id || null, [user?.id]);
  
  // Initialize completions data if user is logged in - using just the topic completions hook
  useTopicCompletions(userId);
  
  // If topic ID changes, ensure a default tab is selected
  useEffect(() => {
    if (!topicId || !programId) return;
    
    // Get the current URL path
    const pathSegments = window.location.pathname.split('/');
    
    // If we're just at /programs/[program]/resources/[topic], redirect to the docs tab
    if (pathSegments.length === 5) {
      router.push(`/programs/${programId}/resources/${topicId}/docs`);
    }
  }, [topicId, programId, router]);

  return <>{children}</>;
} 