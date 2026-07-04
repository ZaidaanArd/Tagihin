"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { logout } from "@/lib/auth-actions";
import { getInitials } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

const navGroups = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "BILLING",
    items: [
      {
        label: "Invoice",
        href: "/invoices",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 1.5H9.5L13 5V13.5C13 14.0523 12.5523 14.5 12 14.5H3C2.44772 14.5 2 14.0523 2 13.5V2.5C2 1.94772 2.44772 1.5 3 1.5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 1.5V5H13" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 8.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5 11H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        label: "Klien",
        href: "/clients",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M1 14C1 11.2386 3.23858 9 6 9C8.76142 9 11 11.2386 11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11.5 8C13.433 8 15 9.567 15 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "TOOLS",
    items: [
      {
        label: "Pengaturan",
        href: "/settings",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 1.5V3.5M8 12.5V14.5M3.5 8H1.5M14.5 8H12.5M4.93 4.93L3.51 3.51M12.49 12.49L11.07 11.07M4.93 11.07L3.51 12.49M12.49 3.51L11.07 4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
];

type SidebarProps = {
  user: { full_name: string; email: string } | null;
  collapsed: boolean;
  onToggle: () => void;
  mobileClose?: () => void;
};

export function Sidebar({ user, collapsed, onToggle, mobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className={`fixed left-0 top-0 z-30 flex h-full flex-col border-r border-border bg-bg-sidebar py-4 transition-all duration-200 ${collapsed ? "w-[60px]" : "w-[240px]"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4">
        {!collapsed && (
          <Link href="/dashboard">
            <h1 className="text-[20px] font-semibold text-primary">tagihin</h1>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="flex h-6 w-6 items-center justify-center rounded text-text-muted transition-colors hover:bg-neutral-bg hover:text-text-primary"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-4">
        {navGroups.map((group) => (
          <div key={group.section ?? "top"}>
            {group.section && !collapsed && (
              <p className="px-4 pb-[6px] text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                {group.section}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={mobileClose}
                  className={`mx-2 flex items-center gap-2 rounded-md px-3 py-[7px] text-sm transition-colors ${
                    isActive
                      ? "bg-primary-bg font-medium text-primary-text"
                      : "text-[#374151] hover:bg-[#F9FAFB] dark:text-[#D1D5DB] dark:hover:bg-[#2A2A2A]"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto border-t border-border px-4 pt-4">
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-bg text-[11px] font-medium text-primary-text">
              {user ? getInitials(user.full_name) : "?"}
            </div>
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-neutral-bg hover:text-text-primary"
            >
              {theme === "light" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 1V3M8 13V15M3 8H1M15 8H13M4.93 4.93L3.51 3.51M12.49 12.49L11.07 11.07M4.93 11.07L3.51 12.49M12.49 3.51L11.07 4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 10.5A6.5 6.5 0 0 1 5.5 2.5 6.5 6.5 0 1 0 13.5 10.5Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-bg text-sm font-medium text-primary-text">
                  {user ? getInitials(user.full_name) : "?"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#111827] dark:text-[#EDEDED]">
                    {user?.full_name ?? "Pengguna"}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {user?.email ?? ""}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="mt-3 flex w-full items-center gap-2.5 rounded-md px-3 py-[7px] text-sm text-text-muted transition-colors hover:bg-neutral-bg hover:text-text-primary"
            >
              {theme === "light" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 1V3M8 13V15M3 8H1M15 8H13M4.93 4.93L3.51 3.51M12.49 12.49L11.07 11.07M4.93 11.07L3.51 12.49M12.49 3.51L11.07 4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 10.5A6.5 6.5 0 0 1 5.5 2.5 6.5 6.5 0 1 0 13.5 10.5Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
              <span>{theme === "light" ? "Mode gelap" : "Mode terang"}</span>
            </button>
            <form action={logout} className="mt-1">
              <button
                type="submit"
                className="w-full rounded-md px-3 py-1.5 text-left text-xs text-text-muted transition-colors hover:bg-neutral-bg hover:text-[#EF4444]"
              >
                Keluar
              </button>
            </form>
          </>
        )}
      </div>
    </aside>
  );
}
