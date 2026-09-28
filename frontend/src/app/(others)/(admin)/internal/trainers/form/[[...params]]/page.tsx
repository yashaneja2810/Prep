import TrainerFormPageClient from "@/components/design/internal/trainers/trainer-form-page-client";
import { Metadata } from "next";
import { notFound } from "next/navigation";


interface TrainerFormPageProps {
  params: Promise<{
    params?: string[];
  }>;
  searchParams: Promise<{
    userId?: string;
  }>;
}

export async function generateMetadata({
  params,
}: TrainerFormPageProps): Promise<Metadata> {
  const { params: urlParams = [] } = await params;
  const profileId = urlParams[0];
  const isEditMode = !!profileId;

  return {
    title: `${isEditMode ? 'Edit' : 'Create'} Trainer Profile | GamutX LMS`,
    description: `${isEditMode ? 'Update trainer information and profile settings' : 'Add a new trainer to the learning management system'} in the admin panel.`,
    keywords: ["trainer", "profile", isEditMode ? "edit" : "create", "management", "LMS", "education", "admin"],
    openGraph: {
      title: `${isEditMode ? 'Edit' : 'Create'} Trainer Profile | GamutX LMS`,
      description: `${isEditMode ? 'Update trainer information and profile settings' : 'Add a new trainer to the learning management system'}.`,
      type: "website",
    },
    robots: {
      index: false, // Internal admin pages should not be indexed
      follow: false,
    },
  };
}

export default async function TrainerFormPage({ params, searchParams }: TrainerFormPageProps) {
  // Extract parameters
  const { params: urlParams = [] } = await params;
  const profileId = urlParams[0]; // For edit mode
  const { userId } = await searchParams; // For create mode
  
  // Determine mode
  const isEditMode = !!profileId;
  
  // Validation for edit mode
  if (isEditMode) {
    if (!profileId || profileId.trim().length === 0) {
      notFound();
    }
    
    // Basic UUID format validation for profile ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileId)) {
      notFound();
    }
  }

  return (
    <TrainerFormPageClient 
      profileId={profileId}
      userId={userId}
      isEditMode={isEditMode}
    />
  );
} 