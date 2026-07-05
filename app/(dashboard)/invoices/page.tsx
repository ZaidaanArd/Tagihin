import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, getInitials } from "@/lib/utils";
import { InvoiceFilter } from "./filter";
import { MoreHorizontal } from "lucide-react";

const statusColors: Record<string, string> = {
  paid: "#10B981",
  sent: "#3B82F6",
  overdue: "#EF4444",
  draft: "#9CA3AF",
};

const statusLabels: Record<string, string> = {
  paid: "Lunas",
  sent: "Terkirim",
  overdue: "Tertunggak",
  draft: "Draft",
};

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function InvoicesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("invoices")
    .select("id, invoice_number, status, total, created_at, due_date, clients(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (tab === "overdue") {
    query = query.eq("status", "overdue");
  } else if (tab === "upcoming") {
    query = query.in("status", ["draft", "sent"]);
  }

  const { data: invoices, error: invoicesErr } = await query;

  if (invoicesErr) {
    return (
      <div className="mx-6 mt-6 rounded-lg border border-danger-bg bg-danger-bg px-4 py-3 text-sm text-danger-text">
        Terjadi kesalahan. Silakan coba lagi.
      </div>
    );
  }

  let filtered = invoices ?? [];
  if (q) {
    const search = q.toLowerCase();
    filtered = filtered.filter((inv) => {
      const clientData = inv.clients as { name: string } | { name: string }[] | null;
      const clientName = Array.isArray(clientData)
        ? clientData[0]?.name ?? ""
        : clientData?.name ?? "";
      return (
        inv.invoice_number.toLowerCase().includes(search) ||
        clientName.toLowerCase().includes(search)
      );
    });
  }

  const tabs = [
    { key: "all", label: "Semua" },
    { key: "overdue", label: "Tertunggak" },
    { key: "upcoming", label: "Mendatang" },
  ];

  return (
    <div>
      <div className="border-b border-border px-6 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-text-primary">Invoice</h1>
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Invoice Baru
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((t) => {
              const isActive = t.key === "all"
                ? (!tab || tab === "all")
                : tab === t.key;
              return (
                <Link
                  key={t.key}
                  href={t.key === "all" ? "/invoices" : `/invoices?tab=${t.key}`}
                  replace
                  className={`px-4 pb-2 text-sm border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
          <InvoiceFilter />
        </div>
      </div>

      {/* Mobile card list */}
      <div className="mx-4 mt-4 block space-y-2 md:hidden">
        {filtered.length > 0 ? (
          filtered.map((inv) => {
            const clientData = inv.clients as { name: string } | { name: string }[] | null;
            const clientName = Array.isArray(clientData) ? clientData[0]?.name ?? "—" : clientData?.name ?? "—";
            const st = inv.status as string;
            return (
              <Link key={inv.id} href={`/invoices/${inv.id}`}>
                <div className="rounded-lg border border-border bg-bg-card p-4 transition-colors hover:bg-neutral-bg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{inv.invoice_number}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-[6px] w-[6px] rounded-full shrink-0" style={{ backgroundColor: statusColors[st] ?? "#9CA3AF" }} />
                      <span style={{ color: statusColors[st] ?? "#9CA3AF" }} className="text-sm">{statusLabels[st] ?? "Draft"}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{clientName}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{formatRupiah(inv.total)}</span>
                    <span className="text-xs text-text-muted">{formatDate(inv.due_date ?? inv.created_at)}</span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="rounded-lg border border-border bg-bg-card p-4 text-center text-sm text-text-muted">
            Belum ada invoice.{" "}
            <Link href="/invoices/new" className="font-medium text-primary hover:text-primary-text">Buat invoice sekarang</Link>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="mx-6 mt-4 hidden overflow-x-auto rounded-lg border border-border bg-bg-card md:block">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-bg border-b border-border">
              {["No. Invoice", "Klien", "Total", "Jatuh Tempo", "Status", ""].map((h, i) => (
                <th key={h} className={`px-4 py-[10px] text-left text-xs font-medium uppercase tracking-[0.05em] text-text-secondary ${i === 3 ? "hidden md:table-cell" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((inv) => {
                const clientData = inv.clients as { name: string } | { name: string }[] | null;
                const clientName = Array.isArray(clientData) ? clientData[0]?.name ?? "—" : clientData?.name ?? "—";
                const st = inv.status as string;
                return (
                  <tr key={inv.id} className="border-b border-border-light text-sm text-text-primary transition-colors last:border-b-0 hover:bg-neutral-bg group">
                    <td className="px-4 py-3"><Link href={`/invoices/${inv.id}`} className="text-inherit no-underline hover:text-primary">{inv.invoice_number}</Link></td>
                    <td className="px-4 py-3"><Link href={`/invoices/${inv.id}`} className="flex items-center gap-2.5 text-inherit no-underline"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-bg text-[11px] font-medium text-primary-text">{getInitials(clientName)}</div><span>{clientName}</span></Link></td>
                    <td className="px-4 py-3 font-medium text-text-primary"><Link href={`/invoices/${inv.id}`} className="text-inherit no-underline">{formatRupiah(inv.total)}</Link></td>
                    <td className="hidden px-4 py-3 text-text-secondary md:table-cell"><Link href={`/invoices/${inv.id}`} className="text-inherit no-underline">{formatDate(inv.due_date ?? inv.created_at)}</Link></td>
                    <td className="px-4 py-3"><Link href={`/invoices/${inv.id}`} className="flex items-center gap-1.5 text-inherit no-underline"><span className="h-[6px] w-[6px] rounded-full shrink-0" style={{ backgroundColor: statusColors[st] ?? "#9CA3AF" }} /><span style={{ color: statusColors[st] ?? "#9CA3AF" }} className="text-sm">{statusLabels[st] ?? "Draft"}</span></Link></td>
                    <td className="px-4 py-3"><Link href={`/invoices/${inv.id}`} className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-border-light hover:text-text-primary"><MoreHorizontal size={16} /></Link></td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">Belum ada invoice. <Link href="/invoices/new" className="font-medium text-primary hover:text-primary-text">Buat invoice sekarang</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
