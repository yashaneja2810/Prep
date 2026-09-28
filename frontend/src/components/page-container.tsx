"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface PageContainerProps {
  children: ReactNode
  className?: string
  withPadding?: boolean
  hideNavigation?: boolean
  centerContent?: boolean
}

export function PageContainer({ 
  children, 
  className, 
  withPadding = false,
  hideNavigation = false,
  centerContent = false
}: PageContainerProps) {
  const pathname = usePathname();
  // Check if we're in the VSD Foundations course-details path
  const isVsdFoundCourseDetails = pathname.includes('/vd-found/course-details');
  
  // Only show navigation if not in VSD Foundations course-details and not explicitly hidden
  const showNavigation = !hideNavigation && !isVsdFoundCourseDetails;

  return (
    <>
      <div className={cn(
        "w-full px-6", 
        withPadding && "py-6",
        !showNavigation && "pt-0",
        className
      )}>
        {children}
      </div>
    </>
  )
} 