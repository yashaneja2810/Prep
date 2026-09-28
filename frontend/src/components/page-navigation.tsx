"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageNavigation() {
  const pathname = usePathname();
  
  // Skip rendering on dashboard
  if (pathname === "/dashboard") {
    return null;
  }
  
  // Create breadcrumb items from the pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Determine section based on path
  const getSection = () => {
    if (pathname.startsWith("/organization")) {
      return { name: "Organization", path: "/organization" };
    }
    if (pathname.startsWith("/internal")) {
      return { name: "Internal", path: "/internal" };
    }
    if (pathname.startsWith("/trainer")) {
      return { name: "Trainer", path: "/trainer" };
    }
    return null;
  };
  
  const section = getSection();
  
  // Generate breadcrumb segments with proper labels
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    
    // Convert kebab-case to proper case (first letter capitalized, rest lowercase)
    let label = segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    
    // Only a few essential special cases for better readability
    
    return { 
      path, 
      label, 
      isClickable: true // Make all segments clickable for better navigation
    };
  });

  return (
    <div className="mb-0">
      <nav className="flex items-center text-sm py-1.5 px-3 overflow-x-auto no-scrollbar">
        {section && (
          <>
            <Link 
              href={section.path}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              <span>{section.name}</span>
            </Link>
            
            <ChevronRight className="h-3 w-3 mx-1.5 text-muted-foreground/60" />
          </>
        )}
        
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center whitespace-nowrap">
            <div 
              className={cn(
                "px-1.5 py-0.5 rounded", 
                index === breadcrumbs.length - 1 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
              )}
            >
              {index === breadcrumbs.length - 1 ? (
                <span>{crumb.label}</span>
              ) : (
                <Link href={crumb.path}>
                  {crumb.label}
                </Link>
              )}
            </div>
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="h-3 w-3 mx-1.5 text-muted-foreground/60" />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
} 