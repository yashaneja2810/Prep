"use client"

import { Bell, Home, User } from "lucide-react"
import { SimpleThemeToggle } from "./simple-theme-toggle"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Badge } from "./ui/badge"
import { ReactNode, useEffect } from "react"
import { PageNavigation } from "./page-navigation"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Logo } from "./ui/logo"
import { useUserStore } from "@/lib/store/userStore";
import { useLogout } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title?: string | ReactNode
  subtitle?: string
  showProfileMenu?: boolean
  rightElement?: ReactNode
}

export function PageHeader({ 
  title, 
  subtitle = "", 
  showProfileMenu = true,
  rightElement
}: PageHeaderProps) {
  const pathname = usePathname();
  
  // Get current page name from pathname
  const getPageName = () => {
    if (pathname === "/dashboard") return "Dashboard";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Home";
    
    const lastSegment = segments[segments.length - 1];
    // Convert kebab-case to proper case
    const pageName = lastSegment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    
    // Special cases
    return pageName;
  };

  const currentPageName = getPageName();
  const displayTitle = title || `${currentPageName} |`;

  const { logout, isLoading: isLoggingOut } = useLogout();
  const router = useRouter();
  const user = useUserStore((state) => state.profile);
  
  // Enhanced debug logging
  console.log('🟢 [PageHeader] User profile state:', {
    user,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    activeRoles: user?.activeRoles,
    roleProfiles: user?.roleProfiles ? Object.keys(user.roleProfiles) : [],
    hasTrainerProfile: !!user?.roleProfiles?.trainer,
    hasLearnerProfile: !!user?.roleProfiles?.learner,
    hasAdminProfile: !!user?.roleProfiles?.admin
  });

  useEffect(() => {
    console.log('🟢 [PageHeader] User profile updated:', {
      user,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      activeRoles: user?.activeRoles,
      roleProfilesKeys: user?.roleProfiles ? Object.keys(user.roleProfiles) : [],
      trainerProfile: user?.roleProfiles?.trainer,
      learnerProfile: user?.roleProfiles?.learner,
      adminProfile: user?.roleProfiles?.admin
    });
  }, [user]);

  // Role badge content based on state
  const getRoleBadge = () => {
    if (!user || !user.activeRoles || user.activeRoles.length === 0) {
      return null; // Don't show badge if there's no user or no roles
    }
    
    return (
      <Badge variant="outline" className="text-xs uppercase">
        {user.activeRoles[0]}
      </Badge>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background w-full">
      <div className="flex h-12 items-center justify-between px-1 bg-background">
        <div className="flex items-center">
          {/* GamutX Logo */}
          <div className="pl-4">
            <Logo size="sm" showText={true} />
          </div>
        </div>
        
        {/* Breadcrumb Navigation with Home Icon - positioned at the beginning of content area */}
        <div className="absolute left-56 flex items-center">
          <div className="inline-flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center justify-center h-5 w-5 rounded-full border border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors" style={{ marginRight: '-4px' }}>
                <Home className="h-2.5 w-2.5 text-foreground/80 hover:text-foreground transition-colors" />
              </div>
            </Link>
            <PageNavigation />
          </div>
        </div>

        <div className="flex items-center gap-2 pr-2">
          {rightElement}
          
          {/* Role Badge */}
          {getRoleBadge()}
          
          <SimpleThemeToggle />
          
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-[18px] w-[18px]" />
            <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center">
              3
            </Badge>
          </Button>
          
          {showProfileMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback className="text-xs">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                        : user?.email ? user.email[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.first_name && user?.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user?.email || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600"
                  onClick={logout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
} 