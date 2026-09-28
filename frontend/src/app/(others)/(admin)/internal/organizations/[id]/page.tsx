import { Metadata } from 'next'
import { OrganizationDetailsPageClient } from '@/components/design/internal/organizations/organization-details-page-client'

interface OrganizationDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: OrganizationDetailsPageProps): Promise<Metadata> {
  return {
    title: 'Organization Details | Admin',
    description: 'Organization details page'
  }
}

export default async function OrganizationDetailsPage({ params }: OrganizationDetailsPageProps) {
  const resolvedParams = await params
  return <OrganizationDetailsPageClient organizationId={resolvedParams.id} />
} 