"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PageContent } from "../../components/page-content";
import { useProgramContext } from "../../../layout";

export default function PptPage() {
  const params = useParams();
  const { programId } = useProgramContext();
  const topicId = params.topic as string;

  // Store selected topic in localStorage
  useEffect(() => {
    if (topicId && programId) {
      localStorage.setItem(`${programId}-selected-topic`, topicId);
      localStorage.setItem(`${programId}-current-topic-id`, topicId);
      
      // Trigger event for other components to know a topic was selected
      window.dispatchEvent(new CustomEvent('topicSelected', {
        detail: { topic: topicId }
      }));
      window.dispatchEvent(new Event('storage'));
    }
  }, [topicId, programId]);

  return (
    <div className="h-full w-full overflow-hidden">
      <PageContent topicId={topicId} />
    </div>
  );
} 