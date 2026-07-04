"use client";

import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/shared/sidebar";

type DashboardShellProps = {
  user: { full_name: string; email: string } | null;
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarWidth = collapsed ? 60 : 240;

  return (
    <div className="flex min-h-screen bg-bg-page">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide-in) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[240px] transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar user={user} collapsed={false} onToggle={() => {}} mobileClose={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      </div>

      <main
        className="flex-1 transition-all duration-200 md:ml-[240px]"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Mobile topbar with hamburger */}
        <div className="flex items-center border-b border-border bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 text-sm font-semibold text-text-primary">tagihin</span>
        </div>

        {children}
      </main>
    </div>
  );
}
