"use client";

import { useMemo, useState, startTransition, useCallback } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Plus, Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import {
  invoiceFormSchema,
  TAX_RATES,
  TAX_LABELS,
  type InvoiceFormValues,
} from "@/lib/validations/invoice-schema";
import { saveInvoice } from "@/lib/invoice-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Client = { id: string; name: string };

type Props = {
  clients: Client[];
  invoiceNumber: string;
};

export function NewInvoiceForm({ clients, invoiceNumber }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      client_id: "",
      invoice_number: invoiceNumber,
      issue_date: "",
      due_date: "",
      notes: "",
      tax_type: "none",
      items: [{ description: "", quantity: 1, unit: "", unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = useWatch({ control: form.control, name: "items" });
  const taxType = useWatch({ control: form.control, name: "tax_type" });

  const subtotal = useMemo(
    () =>
      items?.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
        0,
      ) ?? 0,
    [items],
  );

  const taxRate = TAX_RATES[taxType ?? "none"];
  const taxAmount = taxType === "none" ? 0 : Math.round(subtotal * (taxRate / 100));
  const total = taxType === "ppn" ? subtotal + taxAmount : subtotal;

  const onSubmit = useCallback(async (data: InvoiceFormValues) => {
    setPending(true);
    setError(null);

    const fd = new FormData();
    fd.set("client_id", data.client_id);
    fd.set("invoice_number", data.invoice_number);
    fd.set("issue_date", data.issue_date);
    fd.set("due_date", data.due_date);
    fd.set("notes", data.notes ?? "");
    fd.set("tax_type", data.tax_type);
    data.items.forEach((item, i) => {
      fd.set(`items.${i}.description`, item.description);
      fd.set(`items.${i}.quantity`, String(item.quantity));
      fd.set(`items.${i}.unit`, item.unit ?? "");
      fd.set(`items.${i}.unit_price`, String(item.unit_price));
    });

    startTransition(async () => {
      const result = await saveInvoice(undefined, fd);
      if ("error" in result) {
        setError(result.error);
        setPending(false);
      } else {
        router.push("/invoices");
      }
    });
  }, [router]);

  return (
    <>
    <Form {...form}>
      <form
        id="invoice-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {error && (
          <p className="rounded-lg border border-danger-bg bg-danger-bg px-3 py-2 text-sm text-danger-text">
            {error}
          </p>
        )}

        {/* Informasi Invoice */}
        <div className="space-y-4 rounded-xl border border-border bg-bg-card p-4 px-[18px]">
          <h2 className="text-base font-medium text-text-primary">
            Informasi Invoice
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klien</FormLabel>
                  <FormControl>
                    {clients.length === 0 ? (
                      <div className="rounded-lg border border-border bg-neutral-bg px-3 py-2 text-sm text-text-secondary">
                        Belum ada klien.{" "}
                        <a href="/clients/new" className="font-medium text-primary hover:text-primary-text">
                          Tambah klien dulu
                        </a>
                      </div>
                    ) : (
                      <select
                        className="flex h-9 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        {...field}
                        value={field.value ?? ""}
                      >
                        <option value="">Pilih klien</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Invoice</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issue_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Terbit</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jatuh Tempo</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tax_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Pajak</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      {...field}
                      value={field.value ?? "none"}
                    >
                      {Object.entries(TAX_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Item Pekerjaan */}
        <div className="space-y-4 rounded-xl border border-border bg-bg-card p-4 px-[18px]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-text-primary">
              Item Pekerjaan
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({
                  description: "",
                  quantity: 1,
                  unit: "",
                  unit_price: 0,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Tambah Item
            </Button>
          </div>

          <div className="hidden grid-cols-[1fr_80px_80px_100px_36px] gap-3 md:grid">
            <span className="text-xs text-text-muted">Deskripsi</span>
            <span className="text-xs text-text-muted">Qty</span>
            <span className="text-xs text-text-muted">Satuan</span>
            <span className="text-xs text-text-muted text-right">Harga</span>
            <span />
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_80px_80px_100px_36px]"
            >
              <FormField
                control={form.control}
                name={`items.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-text-muted md:hidden">
                      Deskripsi
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Deskripsi pekerjaan" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-text-muted md:hidden">
                      Qty
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        value={field.value ?? 1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.unit`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-text-muted md:hidden">
                      Satuan
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="unit" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.unit_price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-text-muted md:hidden">
                      Harga
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end justify-between md:flex-col md:items-center md:justify-center">
                <div className="text-right text-sm text-text-secondary md:hidden">
                  {formatRupiah(
                    (items?.[index]?.quantity ?? 0) *
                      (items?.[index]?.unit_price ?? 0),
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-text-muted hover:text-danger-text"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="hidden items-center justify-end text-sm text-text-secondary md:flex">
                {formatRupiah(
                  (items?.[index]?.quantity ?? 0) *
                    (items?.[index]?.unit_price ?? 0),
                )}
              </div>
            </div>
          ))}

          {form.formState.errors.items?.root && (
            <p className="text-xs text-danger-text">
              {form.formState.errors.items.root.message}
            </p>
          )}
        </div>

        {/* Catatan */}
        <div className="space-y-3 rounded-xl border border-border bg-bg-card p-4 px-[18px]">
          <h2 className="text-base font-medium text-text-primary">Catatan</h2>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <textarea
                    rows={3}
                    className="flex w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Catatan untuk klien (opsional)"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ringkasan */}
        <div className="ml-auto w-full max-w-xs space-y-2 rounded-xl border border-border bg-bg-card p-4 px-[18px]">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text-primary">{formatRupiah(subtotal)}</span>
          </div>
          {taxType !== "none" && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{TAX_LABELS[taxType]}</span>
              <span className="text-text-primary">
                {formatRupiah(taxAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base font-medium text-text-primary">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/invoices")}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan Invoice"}
          </Button>
        </div>
      </form>
    </Form>

    {previewOpen && (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-10">
        <div className="w-full max-w-3xl rounded-lg border border-border bg-bg-card p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-text-primary">Preview Invoice</h2>
            <button
              onClick={() => setPreviewOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-neutral-bg"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary">Invoice</p>
              </div>
              <span className="inline-block rounded-[20px] bg-neutral-bg px-[10px] py-[3px] text-[11px] font-medium text-neutral-text">
                Draft
              </span>
            </div>

            <div className="mt-6 flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted">Kepada</p>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  {clients.find((c) => c.id === form.getValues("client_id"))?.name ?? "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">
                  {form.getValues("invoice_number")}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Tanggal: {form.getValues("issue_date")}
                </p>
                <p className="text-sm text-text-secondary">
                  Jatuh tempo: {form.getValues("due_date")}
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <div className="grid grid-cols-[2fr_80px_80px_100px_100px] gap-3 border-b border-border bg-neutral-bg px-4 py-[11px] text-xs font-medium uppercase tracking-[0.05em] text-text-muted">
                <span>Deskripsi</span>
                <span className="text-right">Qty</span>
                <span className="text-center">Satuan</span>
                <span className="text-right">Harga</span>
                <span className="text-right">Total</span>
              </div>
              {items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_80px_80px_100px_100px] gap-3 border-b border-border-light px-4 py-3 text-sm text-text-primary"
                >
                  <span>{item.description || ""}</span>
                  <span className="text-right">{item.quantity || "0"}</span>
                  <span className="text-center">{item.unit || ""}</span>
                  <span className="text-right">
                    {formatRupiah(item.unit_price || 0)}
                  </span>
                  <span className="text-right">
                    {formatRupiah((item.quantity || 0) * (item.unit_price || 0))}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 ml-auto w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">{formatRupiah(subtotal)}</span>
              </div>
              {taxType !== "none" && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">{TAX_LABELS[taxType]}</span>
                  <span className="text-text-primary">{formatRupiah(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-medium text-text-primary">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
            </div>

            {form.getValues("notes") && (
              <div className="mt-6">
                <p className="text-xs text-text-muted">Catatan:</p>
                <p className="mt-1 text-sm text-text-secondary">{form.getValues("notes")}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
              Tutup
            </Button>
            <Button type="submit" form="invoice-form" onClick={() => setPreviewOpen(false)}>
              Simpan Invoice
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
