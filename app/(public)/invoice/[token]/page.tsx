import { notFound } from "next/navigation";
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

export default async function PublicInvoicePage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(*), invoice_items(*), users(full_name, business_name, address)")
    .eq("public_token", token)
    .single();

  if (!invoice) notFound();

  const items = invoice.invoice_items as Array<Record<string, unknown>>;
  const client = invoice.clients as Record<string, unknown>;
  const user = invoice.users as Record<string, unknown>;
  const st = invoice.status as string;
  const subtotal = Number(invoice.subtotal ?? 0);
  const taxAmount = Number(invoice.tax_amount ?? 0);
  const computedTotal = subtotal + taxAmount;

  return (
    <div className="min-h-screen bg-bg-page py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-lg border border-border bg-bg-card">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-lg font-medium text-text-primary">
                  {String(user?.business_name ?? user?.full_name ?? "Tagihin")}
                </h1>
                {user?.address ? (
                  <p className="mt-1 text-sm text-text-secondary">{String(user.address)}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-[6px] w-[6px] rounded-full shrink-0" style={{ backgroundColor: statusColors[st] ?? "#9CA3AF" }} />
                <span style={{ color: statusColors[st] ?? "#9CA3AF" }} className="text-sm">{statusLabels[st] ?? "Draft"}</span>
              </div>
            </div>

            <div className="mt-8 flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted">Kepada</p>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  {String(client?.name ?? "")}
                </p>
                {client?.address ? (
                  <p className="text-sm text-text-secondary">{String(client.address)}</p>
                ) : null}
                {client?.npwp ? (
                  <p className="text-sm text-text-secondary">NPWP: {String(client.npwp)}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">
                  {String(invoice.invoice_number)}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Tanggal: {formatDate(String(invoice.issue_date))}
                </p>
                <p className="text-sm text-text-secondary">
                  Jatuh tempo: {formatDate(String(invoice.due_date))}
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto">
              <div className="grid grid-cols-[2fr_80px_80px_100px_100px] gap-3 border-b border-border bg-neutral-bg px-4 py-[10px] text-xs font-medium uppercase tracking-[0.05em] text-text-secondary">
                <span>Deskripsi</span>
                <span className="text-right">Qty</span>
                <span className="text-center">Satuan</span>
                <span className="text-right">Harga</span>
                <span className="text-right">Total</span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[2fr_80px_80px_100px_100px] gap-3 border-b border-border-light px-4 py-3 text-sm text-text-primary">
                  <span>{String(item.description ?? "")}</span>
                  <span className="text-right">{String(item.quantity ?? "0")}</span>
                  <span className="text-center">{String(item.unit ?? "")}</span>
                  <span className="text-right">{formatRupiah(Number(item.unit_price ?? 0))}</span>
                  <span className="text-right">{formatRupiah(Number(item.amount ?? 0))}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 ml-auto w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">{formatRupiah(subtotal)}</span>
              </div>
              {String(invoice.tax_type) !== "none" ? (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Pajak</span>
                  <span className="text-text-primary">{formatRupiah(taxAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-2 text-base font-medium text-text-primary">
                <span>Total</span>
                <span>{formatRupiah(computedTotal)}</span>
              </div>
            </div>

            {invoice.notes ? (
              <div className="mt-8">
                <p className="text-xs text-text-muted">Catatan:</p>
                <p className="mt-1 text-sm text-text-secondary">{String(invoice.notes)}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
