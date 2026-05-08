import { Skeleton } from "@/components/ui/skeleton";

export default function AlumnosLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-64 rounded-full" />
      </div>

      <div className="rounded-lg border bg-card">
        <Skeleton className="h-12 w-full rounded-none border-b" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_110px] items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
