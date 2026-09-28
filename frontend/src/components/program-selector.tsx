"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen } from "lucide-react";
import { getPublishedPrograms, Program } from "@/lib/api/programs";
import { ROUTES } from "@/helpers/string_const";

interface ProgramSelectorProps {
  className?: string;
}

export function ProgramSelector({ className }: ProgramSelectorProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  // Function to generate a consistent color based on program ID
  const getProgramColor = (id: string) => {
    // Array of vibrant colors for backgrounds
    const colors = [
      "bg-amber-500", // amber
      "bg-blue-500",  // blue
      "bg-emerald-500", // emerald
      "bg-fuchsia-500", // fuchsia
      "bg-green-500",  // green
      "bg-indigo-500", // indigo
      "bg-orange-500", // orange
      "bg-pink-500",   // pink
      "bg-purple-500", // purple
      "bg-red-500",    // red
      "bg-sky-500",    // sky
      "bg-teal-500",   // teal
      "bg-violet-500", // violet
      "bg-yellow-500", // yellow
    ];
    
    // Use the program ID to generate a consistent index
    const charSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };
  
  // Function to get a program icon based on program ID
  const getProgramIcon = (id: string, color: string) => {
    // Array of different SVG icons
    const icons = [
      // Circle with rays
      <svg key="1" className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="7.5" />
        <line x1="12" y1="4.5" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="19.5" />
        <line x1="4.5" y1="12" x2="2" y2="12" />
        <line x1="22" y1="12" x2="19.5" y2="12" />
        <line x1="17" y1="7" x2="19" y2="5" />
        <line x1="5" y1="19" x2="7" y2="17" />
        <line x1="7" y1="7" x2="5" y2="5" />
        <line x1="19" y1="19" x2="17" y2="17" />
      </svg>,
      
      // Layers
      <svg key="2" className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>,
      
      // Box
      <svg key="3" className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>,
      
      // Lightning
      <svg key="4" className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>,
      
      // Target
      <svg key="5" className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>,
      
      // Globe
      <svg key="6" className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>,
    ];
    
    // Use the program ID to generate a consistent index
    const charSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return icons[charSum % icons.length];
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const publishedPrograms = await getPublishedPrograms();
        setPrograms(publishedPrograms);
        setError(null);
      } catch (err) {
        console.error("Error fetching published programs:", err);
        setError("Failed to load programs");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  if (loading) {
    return (
      <div className="px-2 py-1">
        <h3 className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/70 mb-1 px-2">Enrolled Programs</h3>
        <div className="text-sm text-muted-foreground px-2 py-1.5">Loading programs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 py-1">
        <h3 className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/70 mb-1 px-2">Enrolled Programs</h3>
        <div className="text-sm text-muted-foreground px-2 py-1.5">Unable to load programs</div>
      </div>
    );
  }

  // Display placeholder if no programs
  if (programs.length === 0) {
    return (
      <div className="px-2 py-1">
        <h3 className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/70 mb-1 px-2">Enrolled Programs</h3>
        <div className="text-sm text-muted-foreground px-2 py-1.5">No programs available</div>
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      <h3 className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/70 mb-1 px-2">Enrolled Programs</h3>
      <nav className="space-y-0.5">
        {/* Dynamic programs from API */}
        {programs.map((program) => {
          // Check if current path starts with this program ID
          const isProgramActive = pathname.includes(`/${program.id}`);
          // Get a consistent color for this program
          const programColor = getProgramColor(program.id);
          // Get a consistent icon for this program
          const programIcon = getProgramIcon(program.id, programColor);

          return (
            <Collapsible key={program.id} className="w-full" defaultOpen={isProgramActive}>
              <CollapsibleTrigger className={`flex items-center justify-between w-full rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                isProgramActive 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`h-3.5 w-3.5 ${programColor} rounded-sm flex items-center justify-center`}>
                    {programIcon}
                  </div>
                  <span>{program.title}</span>
                </div>
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="pl-5 pt-1 space-y-0.5">
                  <Link 
                    href={ROUTES.PROGRAM_RESOURCES.replace(':id', program.id)}
                    className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                      pathname === `/programs/${program.id}/resources` || pathname.startsWith(`/programs/${program.id}/resources/`)
                        ? "bg-accent/70 text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground"
                    }`}
                  >
                    <span>Learning Resources</span>
                  </Link>
                  <Link 
                    href={ROUTES.PROGRAM_CHECKLIST.replace(':id', program.id)}
                    className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                      pathname === `/programs/${program.id}/checklist` || pathname.startsWith(`/programs/${program.id}/checklist/`)
                        ? "bg-accent/70 text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground"
                    }`}
                  >
                    <span>Task Checklist</span>
                  </Link>
                  {/* More links can be added here in the future */}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
    </div>
  );
} 