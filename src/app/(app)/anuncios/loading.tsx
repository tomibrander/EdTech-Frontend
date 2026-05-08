import { Skeleton } from "@/components/ui/skeleton";

export default function AnunciosLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-lg border bg-card p-5"
          >
            <Skeleton className="h-14 w-14 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-72" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-full max-w-2xl" />
              <Skeleton className="h-3 w-full max-w-xl" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
