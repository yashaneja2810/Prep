import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { UserInfoForm } from "@/components/design/auth/user-info-form";

export default function UserInfoPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col items-center">
      <header className="border-b border-border/40 p-4 w-full">
        <div className="container flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" showText={true} />
          </Link>
        </div>
      </header>
      
      <main className="container py-6 md:py-8 px-4 overflow-x-hidden flex justify-center">
        <UserInfoForm />
      </main>
    </div>
  );
} 