import { DashboardLayout } from "@/components/layout";

export default function CoordinadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
