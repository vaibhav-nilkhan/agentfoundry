import { DashboardKPISkeleton, DashboardChartSkeleton } from '@/components/loading/DashboardSkeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* Page header skeleton */}
      <div>
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      </div>

      {/* Stats grid skeleton */}
      <DashboardKPISkeleton />

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardChartSkeleton />
        <DashboardChartSkeleton />
      </div>
    </div>
  );
}
