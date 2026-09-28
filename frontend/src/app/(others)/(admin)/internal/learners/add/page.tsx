"use client"

import { AddLearnersForm } from '@/components/design/internal/learners';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/helpers/string_const';

export default function AddLearnersPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect back to learners page after successful addition
    router.push(ROUTES.LEARNERS);
  };

  const handleCancel = () => {
    // Redirect back to learners page on cancel
    router.push(ROUTES.LEARNERS);
  };

  return (
    <PageContainer>
      <div className="container p-6 max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link href={ROUTES.LEARNERS}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learners
            </Button>
          </Link>
          
          <PageHeader
            title="Add New Learners"
            description="Add individual learners or bulk import multiple learners to the platform"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                How to Add Learners
              </CardTitle>
              <CardDescription>
                Choose the method that works best for your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Single Email</h4>
                  <p className="text-sm text-muted-foreground">
                    Perfect for adding individual learners. Just enter their email address 
                    and they'll receive an invitation to complete their profile.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Bulk Import</h4>
                  <p className="text-sm text-muted-foreground">
                    Add multiple learners at once by entering email addresses separated 
                    by commas, line breaks, or uploading a text file.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Learners Form */}
          <AddLearnersForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </PageContainer>
  );
} 