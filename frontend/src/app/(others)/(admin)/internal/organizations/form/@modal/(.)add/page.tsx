import { OrganizationFormModal } from "@/components/design/internal/organizations";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Organization - GamutX LMS",
  description: "Add a new organization to the platform",
};

export default function AddOrganizationModal() {
  return (
    <OrganizationFormModal
      organizationId={undefined}
      isEditMode={false}
    />
  );
} 