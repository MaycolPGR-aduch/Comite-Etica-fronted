import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-blue-200 bg-blue-50/40">
      <CardHeader>
        <CardTitle className="text-base text-[#08204A]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-600">
        <p>{description}</p>
        {actionLabel && actionHref ? (
          <Link className="font-medium text-[#0B57B7] hover:underline" href={actionHref}>
            {actionLabel}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
