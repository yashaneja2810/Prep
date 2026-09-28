"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProgramContext } from "../../layout";

export default function TopicDefaultPage() {
  const params = useParams();
  const router = useRouter();
  const { programId } = useProgramContext();
  const topicId = params.topic as string;
  
  useEffect(() => {
    if (topicId && programId) {
      // Redirect to the docs page for this topic
      router.push(`/programs/${programId}/resources/${topicId}/docs`);
    }
  }, [topicId, programId, router]);

  // This is just a fallback while redirecting
  return null;
} 