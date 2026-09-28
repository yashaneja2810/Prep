"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  withAnimation?: boolean;
  gapSize?: string;
}

export function Logo({ 
  className, 
  size = "md", 
  showText = true,
  withAnimation = false,
  gapSize = "gap-2"
}: LogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }
  
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg"
  }

  const logoSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg"
  }
  
  return (
    <div className={cn(`flex items-center ${gapSize}`, className)}>
      {/* Logo square with GX text */}
      <div className={cn(
        "bg-primary rounded-lg flex items-center justify-center relative", 
        sizes[size]
      )}>
        <span className={cn("font-bold text-primary-foreground", logoSizes[size])}>GX</span>
      </div>
      
      {showText && (
        <div className={cn("font-bold", textSizes[size])}>
          <span className="text-gray-900 dark:text-white">Gamut</span>
          <span className="text-primary font-black">X</span>
          {size !== "sm" && <span className="text-primary/80 ml-0.5">LMS</span>}
        </div>
      )}
    </div>
  )
} 