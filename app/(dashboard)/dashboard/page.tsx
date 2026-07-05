import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, getInitials } from "@/lib/utils";

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoices, error: invErr } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, total, created_at, clients(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { count: clientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (invErr) {
    return (
      <div className="mx-6 mt-6 rounded-lg border border-danger-bg bg-danger-bg px-4 py-3 text-sm text-danger-text">
        Terjadi kesalahan. Silakan coba lagi.
      </div>
    );
  }

  const totalAll = invoices?.reduce((sum, inv) => sum + Number(inv.total ?? 0), 0) ?? 0;
  const outstanding = invoices
    ?.filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + Number(inv.total ?? 0), 0) ?? 0;
  const overdue = invoices
    ?.filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + Number(inv.total ?? 0), 0) ?? 0;
  const paid = invoices
    ?.filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + Number(inv.total ?? 0), 0) ?? 0;

  const progressPct = totalAll > 0 ? Math.round((paid / totalAll) * 100) : 0;
  const recentInvoices = invoices?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-6 pt-5">
        <h1 className="text-[20px] font-semibold text-text-primary">Dashboard</h1>
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

      <div className="mx-6 overflow-hidden rounded-lg border border-border bg-bg-card">
        <div className="flex flex-col md:grid md:grid-cols-2">
          <div className="border-b border-border p-5 md:border-b-0 md:border-r">
            <div className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5V8.5L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm font-medium text-text-secondary">Belum Dibayar</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Terkirim</span>
                <span className="font-medium text-text-primary">{formatRupiah(outstanding)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Tertunggak</span>
                <span className="font-medium text-[#EF4444] text-sm md:text-base">{formatRupiah(overdue)}</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L6 12L14 4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium text-text-secondary">Lunas</span>
            </div>
            <div className="mt-4">
              <span className="text-base font-semibold text-text-primary md:text-lg">{formatRupiah(paid)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Total Tagihan</span>
            <span className="font-medium text-text-primary">{formatRupiah(totalAll)}</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-neutral-bg">
            <div
              className="h-2 rounded-full bg-[#10B981] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-6 overflow-x-auto rounded-lg border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-[10px]">
          <span className="text-xs font-medium uppercase tracking-[0.05em] text-text-secondary">
            Invoice Terbaru
          </span>
          <Link href="/invoices" className="text-xs font-medium text-primary hover:text-primary-text">
            Lihat semua
          </Link>
        </div>
        {recentInvoices.length > 0 ? (
          <>
            {/* Mobile card list */}
            <div className="block space-y-2 p-4 md:hidden">
              {recentInvoices.map((inv) => {
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
                        <span className="text-xs text-text-muted">{formatDate(inv.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {/* Desktop table */}
            <table className="hidden w-full md:table">
              <thead>
                <tr className="border-b border-border bg-neutral-bg">
                  {["No. Invoice", "Klien", "Status", "Total", "Tanggal"].map((h) => (
                    <th key={h} className="px-4 py-[10px] text-left text-xs font-medium uppercase tracking-[0.05em] text-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => {
                  const clientData = inv.clients as { name: string } | { name: string }[] | null;
                  const clientName = Array.isArray(clientData) ? clientData[0]?.name ?? "—" : clientData?.name ?? "—";
                  const st = inv.status as string;
                  return (
                    <tr key={inv.id} className="border-b border-border-light text-sm text-text-primary transition-colors last:border-b-0 hover:bg-neutral-bg">
                      <td className="px-4 py-3">{inv.invoice_number}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-bg text-[11px] font-medium text-primary-text">{getInitials(clientName)}</div><span>{clientName}</span></div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1.5"><span className="h-[6px] w-[6px] rounded-full shrink-0" style={{ backgroundColor: statusColors[st] ?? "#9CA3AF" }} /><span style={{ color: statusColors[st] ?? "#9CA3AF" }} className="text-sm">{statusLabels[st] ?? "Draft"}</span></div></td>
                      <td className="px-4 py-3 font-medium text-text-primary">{formatRupiah(inv.total)}</td>
                      <td className="px-4 py-3 text-text-secondary">{formatDate(inv.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-text-muted">
            Belum ada invoice.{" "}
            <Link href="/invoices/new" className="font-medium text-primary hover:text-primary-text">Buat invoice sekarang</Link>
          </div>
        )}
      </div>
    </div>
  );
}
