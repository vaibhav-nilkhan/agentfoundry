import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SkillsGridSkeleton } from '@/components/loading/SkillsGridSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MarketplaceLoading() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 gradient-subtle" />

          <div className="container mx-auto relative z-10 max-w-6xl">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-96 mx-auto mb-6" />
              <Skeleton className="h-6 w-2/3 mx-auto" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="max-w-2xl mx-auto mb-8">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-wrap gap-2 justify-center mb-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </section>

        {/* Skills Grid Skeleton */}
        <section className="pb-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <SkillsGridSkeleton />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
