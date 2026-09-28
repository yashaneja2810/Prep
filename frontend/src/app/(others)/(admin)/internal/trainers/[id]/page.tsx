import TrainerDetailsPageClient from "@/components/design/internal/trainers/trainer-details-page-client";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface TrainerDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: TrainerDetailsPageProps): Promise<Metadata> {
  const { id: profileId } = await params;

  return {
    title: `Trainer Profile Details | GamutX LMS`,
    description: "View comprehensive trainer information and manage profile settings in the learning management system.",
    keywords: ["trainer", "profile", "details", "management", "LMS", "education"],
    openGraph: {
      title: `Trainer Profile Details | GamutX LMS`,
      description: "View comprehensive trainer information and manage profile settings.",
      type: "website",
    },
    robots: {
      index: false, // Internal admin pages should not be indexed
      follow: false,
    },
  };
}

export default async function TrainerDetailsPage({ params }: TrainerDetailsPageProps) {
  const { id: profileId } = await params;

  // Basic validation
  if (!profileId || profileId.trim().length === 0) {
    notFound();
  }

  // Basic UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(profileId)) {
    notFound();
  }

  return <TrainerDetailsPageClient profileId={profileId} />;
} 