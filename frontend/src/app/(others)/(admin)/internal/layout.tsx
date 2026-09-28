"use client";

import { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { usePathname } from "next/navigation";

export default function InternalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const shouldHideHeader = pathname?.includes('/internal');

  return (
    <div className="flex-1 flex flex-col">
      {!shouldHideHeader && <PageHeader title="Internal" />}
      <div className="flex-1 bg-gradient-to-br from-sky-50 to-transparent">
        <div className="border-l-4 border-sky-200">
          {children}
        </div>
      </div>
    </div>
  );
} 