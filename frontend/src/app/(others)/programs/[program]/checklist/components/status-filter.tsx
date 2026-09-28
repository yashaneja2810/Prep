"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// Define more specific type for accepted values
type StatusFilterValue = 'all' | 'completed' | 'pending';

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
  counts?: {
    all: number;
    completed: number;
    pending: number;
  };
}

export function StatusFilter({ value, onChange, counts = { all: 0, completed: 0, pending: 0 } }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">Status:</span>
      <div className="flex items-center rounded-full p-1 bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("all")}
          className={cn(
            "rounded-full h-7 text-xs font-medium px-3 transition-all",
            value === "all" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <Filter className="h-3.5 w-3.5 mr-1.5 opacity-70" />
          All
          <span className={cn(
            "ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium",
            value === "all" ? "bg-black/10 dark:bg-white/10" : "bg-black/5 dark:bg-white/5"
          )}>
            {counts.all}
          </span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("completed")}
          className={cn(
            "rounded-full h-7 text-xs font-medium px-3 transition-all",
            value === "completed" 
              ? "bg-background text-green-600 shadow-sm" 
              : "text-muted-foreground hover:text-green-600 hover:bg-background/50"
          )}
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
          Completed
          <span className={cn(
            "ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium",
            value === "completed" 
              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
              : "bg-black/5 dark:bg-white/5"
          )}>
            {counts.completed}
          </span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("pending")}
          className={cn(
            "rounded-full h-7 text-xs font-medium px-3 transition-all",
            value === "pending" 
              ? "bg-background text-amber-600 shadow-sm" 
              : "text-muted-foreground hover:text-amber-600 hover:bg-background/50"
          )}
        >
          <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
          Pending
          <span className={cn(
            "ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium",
            value === "pending" 
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" 
              : "bg-black/5 dark:bg-white/5"
          )}>
            {counts.pending}
          </span>
        </Button>
      </div>
    </div>
  );
} 