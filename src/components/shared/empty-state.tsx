import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-border bg-muted/30">
      <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
        {icon ? <div className="mb-1 text-muted-foreground">{icon}</div> : null}
        <p className="font-heading text-base font-medium text-foreground">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction ? (
          <Button className="mt-2" variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : actionLabel && actionHref ? (
          <Button className="mt-2" variant="outline" size="sm" asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
