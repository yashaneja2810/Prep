"use client";

import { ReactNode } from "react";
import GlobalLayout from "@/components/global-layout";

interface OthersLayoutProps {
  children: ReactNode;
}

export default function OthersLayout({ children }: OthersLayoutProps) {
  return (
    <GlobalLayout>
      {children}
    </GlobalLayout>
  );
} 