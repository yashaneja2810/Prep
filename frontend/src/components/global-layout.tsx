"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/page-header";
import { UserProfileInitializer } from "@/components/user-profile-initializer";

interface GlobalLayoutProps {
  children: ReactNode;
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  const pathname = usePathname();
  // Hide sidebar on landing page, login page, register page, user-info page (and nested paths), and AP details page
  const noSidebarPages = ["/"];
  const shouldHideSidebar = noSidebarPages.includes(pathname) || 
                           pathname.startsWith("/user-info") || 
                           pathname.startsWith("/ap-details");

  if (shouldHideSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Ensure user is fetched and set in Zustand store on layout load */}
      <UserProfileInitializer />
      <div className="flex flex-col min-h-screen">
        <PageHeader />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto pt-0" style={{ paddingLeft: 'var(--sidebar-width, 229px)' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
} 