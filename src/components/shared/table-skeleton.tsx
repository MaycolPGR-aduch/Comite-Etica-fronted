import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function TableSkeleton({ columns = 4, rows = 5 }: TableSkeletonProps) {
  const columnKeys = Array.from({ length: columns }, (_, index) => index);
  const rowKeys = Array.from({ length: rows }, (_, index) => index);

  return (
    <div
      className="overflow-hidden rounded-lg border border-border"
      role="status"
      aria-label="Cargando informacion"
    >
      <div className="flex gap-4 border-b border-border bg-muted/50 px-4 py-3">
        {columnKeys.map((key) => (
          <Skeleton key={key} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {rowKeys.map((rowKey) => (
          <div key={rowKey} className="flex items-center gap-4 px-4 py-3.5">
            {columnKeys.map((columnKey) => (
              <Skeleton
                key={columnKey}
                className="h-4 flex-1"
                style={{ opacity: 1 - rowKey * 0.12 }}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Cargando informacion...</span>
    </div>
  );
}
