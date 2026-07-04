import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-actions";
import { DashboardShell } from "@/components/shared/dashboard-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
