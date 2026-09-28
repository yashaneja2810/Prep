"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Home,
  BookOpen,
  Code,
  LineChart,
  Users,
  Building,
  BookUser,
  ChevronDown,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ProgramSelector } from "@/components/program-selector"
import { getAllCohorts, Cohort } from "@/lib/api/cohorts"
import { ROUTES } from "@/helpers/string_const"

export function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCohortId = searchParams.get('id')
  const isApDetailsPage = pathname.startsWith("/ap-details")
  
  // State for all cohorts (for Cohort Sections)
  const [allCohorts, setAllCohorts] = useState<Cohort[]>([])
  const [isCohortsLoading, setIsCohortsLoading] = useState(true)
  const [isCohortsError, setIsCohortsError] = useState(false)
  const [isCohortsExpanded, setIsCohortsExpanded] = useState(
    pathname.startsWith("/") && !pathname.startsWith(ROUTES.COHORTS) && pathname !== "/"
  )
  
  // Sidebar width state
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  // Enhanced mouse events for smoother resizing
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isResizing.current = true
      startX.current = e.clientX
      startWidth.current = sidebarRef.current?.clientWidth || 250
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none' // Prevent text selection during resize
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const deltaX = e.clientX - startX.current
      let newWidth = startWidth.current + deltaX
      // Minimum 180px, maximum 400px
      newWidth = Math.max(180, Math.min(400, newWidth))
      setSidebarWidth(newWidth)
    }
    
    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    // Add resize handle to the sidebar
    const resizeHandle = document.createElement('div')
    resizeHandle.className = 'sidebar-resize-handle'
    resizeHandle.style.position = 'absolute'
    resizeHandle.style.top = '0'
    resizeHandle.style.right = '0'
    resizeHandle.style.width = '4px'
    resizeHandle.style.height = '100%'
    resizeHandle.style.cursor = 'ew-resize'
    resizeHandle.style.zIndex = '10'
    
    sidebarRef.current?.appendChild(resizeHandle)
    resizeHandle.addEventListener('mousedown', handleMouseDown)
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      resizeHandle.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      sidebarRef.current?.removeChild(resizeHandle)
    }
  }, [])
  
  // Load cohorts data
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        setIsCohortsLoading(true)
        setIsCohortsError(false)
        const cohorts = await getAllCohorts({ status: 'active' })
        setAllCohorts(cohorts)
      } catch (error) {
        console.error("Error fetching cohorts:", error)
        setIsCohortsError(true)
      } finally {
        setIsCohortsLoading(false)
      }
    }
    
    fetchCohorts()
  }, [])
  
  // Update CSS variable for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
  }, [sidebarWidth]);
  
  // Don't show sidebar on AP details pages
  if (isApDetailsPage) {
    return null
  }
  
  // Consistent styles for navigation links
  const navLinkClass = (isActive: boolean) => `
    flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors
    ${isActive 
      ? "bg-accent text-accent-foreground" 
      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
    }
  `;

  const sectionClass = "px-3 py-2";
  const headingClass = "text-[11px] uppercase tracking-wider font-medium text-muted-foreground/70 mb-2 px-1";
  
  return (
    <div className="fixed left-0 top-12 h-[calc(100vh-48px)] flex overflow-hidden">
      {/* Main Sidebar */}
      <div 
        ref={sidebarRef} 
        style={{ width: sidebarWidth }} 
        className="flex-shrink-0 bg-background border-r border-border flex flex-col overflow-hidden relative transition-all duration-200"
      >
        {/* Main navigation - scrollable content */}
        <div className="flex-1 overflow-y-auto py-2 px-1 no-scrollbar">
          {/* Dashboard link */}
          <div className={sectionClass}>
            <nav className="space-y-1">
              <Link 
                href={ROUTES.DASHBOARD}
                className={navLinkClass(pathname === ROUTES.DASHBOARD)}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </nav>
          </div>
          
          <Separator className="my-3" />
          
          {/* Enrolled Programs section */}
          <ProgramSelector />
          
          <Separator className="my-3" />
          
          {/* COHORT section */}
          <div className={sectionClass}>
            <h3 className={headingClass}>Cohort</h3>
            <nav className="space-y-1">
              <Collapsible
                open={isCohortsExpanded}
                onOpenChange={setIsCohortsExpanded}
                className="w-full"
              >
                <CollapsibleTrigger className={`
                  flex items-center justify-between w-full rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${pathname !== "/" && pathname !== ROUTES.COHORTS && !pathname.startsWith("/dashboard")
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  }
                `}>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-green-500 rounded-sm flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-white" />
                    </div>
                    <span>Cohort Sections</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" 
                    style={{ transform: isCohortsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="pl-6 pt-1 space-y-1 mt-1">
                    {isCohortsLoading ? (
                      <div className="text-xs text-muted-foreground py-1.5 px-3">Loading cohorts...</div>
                    ) : isCohortsError ? (
                      <div className="text-xs text-destructive py-1.5 px-3">Failed to load cohorts</div>
                    ) : allCohorts.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-1.5 px-3">No cohorts available</div>
                    ) : (
                      allCohorts.map(cohort => (
                        <Link
                          key={cohort.id}
                          href={ROUTES.COHORT_DETAILS.replace(':id', cohort.id)}
                          className={`
                            flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                            ${pathname === `/${cohort.id}`
                              ? "bg-accent/70 text-accent-foreground" 
                              : "text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground"
                            }
                          `}
                        >
                          <span>{cohort.title}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </nav>
          </div>
          
          <Separator className="my-3" />
          
          {/* Supervise section */}
          <div className={sectionClass}>
            <h3 className={headingClass}>Supervise</h3>
            <nav className="space-y-1">
              <Link 
                href={ROUTES.CONTENT_MANAGEMENT}
                className={navLinkClass(
                  pathname === ROUTES.CONTENT_MANAGEMENT || 
                  pathname.startsWith(`${ROUTES.CONTENT_MANAGEMENT}/`)
                )}
              >
                <Code className="h-4 w-4" />
                <span>Content Management</span>
              </Link>
            </nav>
          </div>
          
          <Separator className="my-3" />
          
          {/* My Progress Analytics */}
          <div className={sectionClass}>
            <h3 className={headingClass}>My Profile</h3>
            <nav className="space-y-1">
              <Link 
                href={ROUTES.PROFILE_PROGRESS}
                className={navLinkClass(pathname === ROUTES.PROFILE_PROGRESS)}
              >
                <LineChart className="h-4 w-4" />
                <span>My Progress Analytics</span>
              </Link>
            </nav>
          </div>
          
          <Separator className="my-3" />
          
          {/* Internal section */}
          <div className={sectionClass}>
            <h3 className={headingClass}>Admin</h3>
            <nav className="space-y-1">
              <Link 
                href={ROUTES.LEARNERS}
                className={navLinkClass(
                  pathname === ROUTES.LEARNERS || 
                  pathname.startsWith(`${ROUTES.LEARNERS}/`)
                )}
              >
                <Users className="h-4 w-4" />
                <span>Learners</span>
              </Link>
              <Link
                href={ROUTES.TRAINERS}
                className={navLinkClass(
                  pathname === ROUTES.TRAINERS || 
                  pathname.startsWith(`${ROUTES.TRAINERS}/`)
                )}
              >
                <BookUser className="h-4 w-4" />
                <span>Trainers</span>
              </Link>
              <Link 
                href="/internal/organizations"
                className={navLinkClass(
                  pathname === "/internal/organizations" || 
                  pathname.startsWith("/internal/organizations/")
                )}
              >
                <Building className="h-4 w-4" />
                <span>Organizations</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
} 