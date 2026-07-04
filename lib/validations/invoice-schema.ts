import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Deskripsi wajib diisi"),
  quantity: z.number().min(1, "Minimal 1"),
  unit: z.string().optional(),
  unit_price: z.number().min(0, "Harga tidak boleh negatif"),
});

export const invoiceFormSchema = z
  .object({
    client_id: z.string().min(1, "Pilih klien"),
    invoice_number: z.string().min(1, "No. invoice wajib diisi"),
    issue_date: z.string().min(1, "Tanggal terbit wajib diisi"),
    due_date: z.string().min(1, "Jatuh tempo wajib diisi"),
    notes: z.string().optional(),
    tax_type: z.enum(["none", "pph21", "pph23", "ppn"]),
    items: z.array(invoiceItemSchema).min(1, "Minimal 1 item"),
  })
  .refine(
    (data) => {
      if (!data.issue_date || !data.due_date) return true;
      return new Date(data.due_date) >= new Date(data.issue_date);
    },
    {
      message: "Jatuh tempo harus setelah atau sama dengan tanggal terbit",
      path: ["due_date"],
    },
  );

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const TAX_RATES = {
  none: 0,
  pph21: 5,
  pph23: 2,
  ppn: 11,
} as const;

export const TAX_LABELS: Record<string, string> = {
  none: "Tidak ada",
  pph21: "PPh 21 (5%)",
  pph23: "PPh 23 (2%)",
  ppn: "PPN (11%)",
};
