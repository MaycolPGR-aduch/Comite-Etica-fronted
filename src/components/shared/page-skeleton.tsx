import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  blocks?: number;
  withHeader?: boolean;
}

export function PageSkeleton({ blocks = 2, withHeader = true }: PageSkeletonProps) {
  const blockKeys = Array.from({ length: blocks }, (_, index) => index);

  return (
    <div className="space-y-6" role="status" aria-label="Cargando contenido">
      {withHeader ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      ) : null}
      {blockKeys.map((key) => (
        <div key={key} className="space-y-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
      <span className="sr-only">Cargando contenido...</span>
    </div>
  );
}
