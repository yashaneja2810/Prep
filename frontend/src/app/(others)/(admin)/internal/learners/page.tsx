import { LearnersPageClient } from '@/components/design/internal/learners';
import LearnersErrorBoundary from '@/components/design/internal/learners/learners-error-boundary';

export default function LearnersPage() {
  return (
    <LearnersErrorBoundary>
      <LearnersPageClient />
    </LearnersErrorBoundary>
  );
}  