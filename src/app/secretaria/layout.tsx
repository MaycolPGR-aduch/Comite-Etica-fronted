import { DashboardLayout } from "@/components/layout";

export default function SecretariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
