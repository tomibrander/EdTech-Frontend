import { Skeleton } from "@/components/ui/skeleton";

export default function AdmisionesLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, col) => (
          <div
            key={col}
            className="space-y-2 rounded-lg border bg-paper-2/40 p-3"
          >
            <div className="flex items-center justify-between px-1 pb-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            {Array.from({ length: 2 + (col % 2) }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
