import { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Application Practice Details",
};

export default function APDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 