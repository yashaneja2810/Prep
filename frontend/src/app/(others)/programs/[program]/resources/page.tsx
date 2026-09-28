"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgramContext } from "../layout";

export default function ResourcesPage() {
  const { program, programId } = useProgramContext();
  const [hasSelectedTopic, setHasSelectedTopic] = useState(false);
  const router = useRouter();

  // Check if a topic is already selected
  useEffect(() => {
    // Check if any topic is selected in localStorage
    const checkForSelectedTopic = () => {
      // Only check for the specific program's selected topic
      const selectedTopic = localStorage.getItem(`${programId}-selected-topic`);
      if (selectedTopic) {
        setHasSelectedTopic(true);
        // We no longer automatically redirect here
      } else {
        setHasSelectedTopic(false);
      }
    };
    
    // Initial check
    checkForSelectedTopic();
    
    // Listen for changes in the sidebar selection
    const handleTopicChange = (e: Event | CustomEvent<{topic?: string}>) => {
      // Only redirect when a topic is explicitly selected via the custom event
      if (e.type === 'topicSelected' && 'detail' in e && e.detail?.topic) {
        router.push(`/programs/${programId}/resources/${e.detail.topic}/docs`);
      } else {
        checkForSelectedTopic();
      }
    };
    
    // Custom event for topic selection
    window.addEventListener('topicSelected', handleTopicChange);
    window.addEventListener('storage', handleTopicChange);
    
    return () => {
      window.removeEventListener('topicSelected', handleTopicChange);
      window.removeEventListener('storage', handleTopicChange);
    };
  }, [router, programId]);

  return (
    <div className="h-full overflow-hidden bg-background">
      <div className="flex items-center justify-center h-full w-full p-4">
        <div className="text-center max-w-md p-4 mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">{program?.title || "Program Resources"}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Select a topic from the sidebar to begin your learning journey.
          </p>
        </div>
      </div>
    </div>
  );
} 