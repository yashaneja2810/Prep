"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface OrganizationLayoutProps {
  children: ReactNode
}

export default function OrganizationLayout({ children }: OrganizationLayoutProps) {
  const pathname = usePathname();
  const isReportsPage = pathname?.includes('/organization/reports');
  const isHireCandidatesPage = pathname?.includes('/organization/hire-candidates');

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 