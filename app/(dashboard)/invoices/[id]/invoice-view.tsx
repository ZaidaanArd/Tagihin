"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-bg-card px-4 py-2 text-sm text-text-muted opacity-50"
      >
        Loading PDF...
      </button>
    ),
  },
);
import { FileDown, ArrowLeft, Link, Check, Send } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { updateInvoiceStatus, deleteInvoice } from "@/lib/invoice-actions";
import { sendInvoiceEmail } from "@/lib/email-actions";
import { PDFDocument } from "@/components/invoice/pdf-document";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  paid: { label: "Lunas", bg: "bg-success-bg", text: "text-success-text" },
  sent: { label: "Terkirim", bg: "bg-primary-light", text: "text-primary-dark" },
  overdue: { label: "Overdue", bg: "bg-danger-bg", text: "text-danger-text" },
  draft: { label: "Draft", bg: "bg-neutral-bg", text: "text-neutral-text" },
};

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

type Props = {
  invoice: Record<string, unknown>;
  userData: Record<string, unknown> | null;
};

export function InvoiceView({ invoice, userData }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(invoice.status as string);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  const items = invoice.invoice_items as Array<Record<string, unknown>>;
  const client = invoice.clients as Record<string, unknown>;
  const currentStatus = statusConfig[status] ?? statusConfig.draft;

  const handleStatusChange = useCallback(async (newStatus: string) => {
    setStatusError(null);
    const result = await updateInvoiceStatus(invoice.id as string, newStatus);
    if ("error" in result) {
      setStatusError(result.error!);
    } else {
      setStatus(newStatus);
    }
  }, [invoice.id]);

  const u = userData as Record<string, string | null> | null;
  const c = client as Record<string, string | null>;
  const inv = invoice as Record<string, unknown>;
  const subtotal = Number(inv.subtotal ?? 0);
  const taxAmount = Number(inv.tax_amount ?? 0);
  const computedTotal = subtotal + taxAmount;

  return (
    <div className="space-y-6 px-4 py-4 md:px-6 md:pt-6">
      <button
        onClick={() => router.push("/invoices")}
        className="flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {statusError && (
        <p className="rounded-lg border border-danger-bg bg-danger-bg px-3 py-2 text-sm text-danger-text">
          {statusError}
        </p>
      )}
      {emailMsg && (
        <p className={`rounded-lg border px-3 py-2 text-sm ${
          emailMsg.startsWith("Invoice berhasil")
            ? "border-[#DDD6FE] bg-[#EDE9FE] text-[#5B21B6]"
            : "border-danger-bg bg-danger-bg text-danger-text"
        }`}>
          {emailMsg}
        </p>
      )}

      <div className="rounded-xl border border-border bg-bg-card p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-medium text-text-primary">
              {u?.business_name ?? "Tagihin"}
            </h1>
            {u?.address ? (
              <p className="mt-1 text-sm text-text-secondary">{u.address}</p>
            ) : null}
          </div>
          <span
            className={`inline-block rounded-[20px] px-[10px] py-[3px] text-[11px] font-medium ${currentStatus.bg} ${currentStatus.text}`}
          >
            {currentStatus.label}
          </span>
        </div>

        <div className="mt-8 flex items-start justify-between">
          <div>
            <p className="text-xs text-text-muted">Kepada</p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {c?.name ?? ""}
            </p>
            {c?.address ? (
              <p className="text-sm text-text-secondary">{c.address}</p>
            ) : null}
            {c?.npwp ? (
              <p className="text-sm text-text-secondary">NPWP: {c.npwp}</p>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary">
              {String(inv.invoice_number)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Tanggal: {formatDate(String(inv.issue_date))}
            </p>
            <p className="text-sm text-text-secondary">
              Jatuh tempo: {formatDate(String(inv.due_date))}
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <div className="grid grid-cols-[2fr_80px_80px_100px_100px] gap-3 border-b border-border bg-bg-sidebar px-4 py-[11px] text-xs text-text-muted">
            <span>Deskripsi</span>
            <span className="text-right">Qty</span>
            <span className="text-center">Satuan</span>
            <span className="text-right">Harga</span>
            <span className="text-right">Total</span>
          </div>
          {items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[2fr_80px_80px_100px_100px] gap-3 border-b border-border px-4 py-3 text-sm text-text-primary"
            >
              <span>{String(item.description ?? "")}</span>
              <span className="text-right">{String(item.quantity ?? "0")}</span>
              <span className="text-center">{String(item.unit ?? "")}</span>
              <span className="text-right">
                {formatRupiah(Number(item.unit_price ?? 0))}
              </span>
              <span className="text-right">
                {formatRupiah(Number(item.amount ?? 0))}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 ml-auto w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text-primary">
              {formatRupiah(subtotal)}
            </span>
          </div>
          {String(inv.tax_type) !== "none" ? (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Pajak</span>
              <span className="text-text-primary">
                {formatRupiah(taxAmount)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-border pt-2 text-base font-medium text-text-primary">
            <span>Total</span>
            <span>{formatRupiah(computedTotal)}</span>
          </div>
        </div>

        {inv.notes ? (
          <div className="mt-8">
            <p className="text-xs text-text-muted">Catatan:</p>
            <p className="mt-1 text-sm text-text-secondary">{String(inv.notes)}</p>
          </div>
        ) : null}
      </div>

      {/* Actions (mobile: below card, desktop: inline) */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-1.5">
        <div className="flex flex-wrap gap-2 md:items-center md:gap-1.5">
          <PDFDownloadLink
            document={<PDFDocument invoice={invoice} userData={userData} />}
            fileName={`${inv.invoice_number}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" size="sm" disabled={loading}>
                <FileDown className="h-3.5 w-3.5" />
                {loading ? "Memproses..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
          <Button variant="outline" size="sm"
            onClick={async () => {
              const url = `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/invoice/${inv.public_token}`;
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link className="h-3.5 w-3.5" />}
            {copied ? "Tersalin!" : "Copy Link"}
          </Button>
          <Button variant="outline" size="sm" disabled={emailSending}
            onClick={async () => {
              const clientEmail = c?.email;
              const clientName = c?.name;
              if (!clientEmail) {
                setEmailMsg("Klien belum memiliki email. Tambahkan email klien terlebih dahulu.");
                return;
              }
              if (status === "draft") {
                if (!window.confirm(`Invoice akan dikirim ke ${clientName} (${clientEmail}). Lanjutkan?`)) return;
              }
              setEmailSending(true);
              setEmailMsg(null);
              const result = await sendInvoiceEmail(inv.id as string);
              if ("error" in result) {
                setEmailMsg(result.error);
              } else {
                setStatus("sent");
                setEmailMsg(`Invoice berhasil dikirim ke ${clientEmail}`);
              }
              setEmailSending(false);
            }}
          >
            <Send className="h-4 w-4" />
            {emailSending ? "Mengirim..." : "Kirim ke Klien"}
          </Button>
          <Button variant="outline" size="sm"
            onClick={async () => {
              if (window.confirm("Yakin ingin menghapus invoice ini?")) {
                await deleteInvoice(inv.id as string);
              }
            }}
          >
            Hapus
          </Button>
        </div>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="flex h-9 rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="draft">Draft</option>
          <option value="sent">Terkirim</option>
          <option value="paid">Lunas</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
    </div>
  );
}
