import { DashboardLayout } from "@/components/layout";

export default function InvestigadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
