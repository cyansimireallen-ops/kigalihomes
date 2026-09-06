export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      <div className="skeleton h-48 w-full" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return <div className="skeleton mb-2 h-12 w-full rounded-lg" />;
}
