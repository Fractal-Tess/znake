import { Skeleton } from "~/components/ui/skeleton"

export function ImageLoadingSkeleton() {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex w-full items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
