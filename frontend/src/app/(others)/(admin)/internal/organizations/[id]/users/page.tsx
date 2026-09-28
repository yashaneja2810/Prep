import { OrganizationUsersPageClient } from '@/components/design/internal/organizations';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrganizationUsersPage({ params }: PageProps) {
  const { id } = await params;
  return <OrganizationUsersPageClient organizationId={id} />;
} 