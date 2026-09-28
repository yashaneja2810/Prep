"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { AuthVisual } from "./auth-visual";

interface AuthLayoutProps {
  children: React.ReactNode;
  visualProps: {
    title: string;
    subtitle: string;
    features: Array<{
      icon: string;
      label: string;
      color?: string;
    }>;
  };
  alternateAction: {
    text: string;
    buttonText: string;
    href: string;
  };
}

export function AuthLayout({ children, visualProps, alternateAction }: AuthLayoutProps) {
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-background flex">
      {/* Left side - Visual */}
      <AuthVisual {...visualProps} />
      
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col h-full">
        <div className="p-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Logo size="sm" showText={true} />
          </Link>
          <div className="ml-auto">
            <Link href={alternateAction.href}>
              <Button variant="outline" className="px-6 py-2 text-base bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 hover:text-gray-800">
                {alternateAction.buttonText}
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6 md:p-8 overflow-hidden -mt-10">
          {children}
        </div>
      </div>
    </div>
  );
} 