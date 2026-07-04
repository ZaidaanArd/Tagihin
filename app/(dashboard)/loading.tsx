export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-7 w-48 animate-pulse rounded bg-neutral-bg" />
      <div className="h-[120px] animate-pulse rounded-lg border border-border bg-bg-card" />
      <div className="h-[300px] animate-pulse rounded-lg border border-border bg-bg-card" />
    </div>
  );
}
