import { Skeleton } from "@/components/ui/skeleton";

export default function MensajesLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid h-[560px] grid-cols-[320px_1fr] overflow-hidden rounded-lg border bg-card">
        <div className="border-r">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2 border-b p-4 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-3.5 w-44" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-4 p-7">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-7 w-2/3" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-3 ${i % 3 === 2 ? "w-3/4" : "w-full"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
