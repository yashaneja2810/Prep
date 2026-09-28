import { OrganizationFormPageClient } from "@/components/design/internal/organizations";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface OrganizationEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: OrganizationEditPageProps): Promise<Metadata> {
  return {
    title: "Edit Organization - GamutX LMS", 
    description: "Edit organization profile and information",
  };
}

export default async function OrganizationEditPage({ params }: OrganizationEditPageProps) {
  // Extract parameters
  const { id } = await params;
  
  // Validation for edit mode
  if (!id || id.trim().length === 0) {
    notFound();
  }
  
  // Basic UUID format validation for organization ID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  return (
    <OrganizationFormPageClient
      organizationId={id}
      isEditMode={true}
    />
  );
} 