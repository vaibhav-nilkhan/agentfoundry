import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export function SkillsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkillDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Skeleton className="h-20 w-32" />
        <Skeleton className="h-20 w-32" />
        <Skeleton className="h-20 w-32" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Code block */}
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
