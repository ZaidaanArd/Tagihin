"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invoiceFormSchema } from "@/lib/validations/invoice-schema";
import { TAX_RATES } from "@/lib/validations/invoice-schema";

export type SaveInvoiceResult = { error: string } | { success: true };

export async function saveInvoice(
  _prev: unknown,
  formData: FormData,
): Promise<SaveInvoiceResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };

  const raw: Record<string, unknown> = {};
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("items.")) {
      raw[key] = val;
    } else {
      raw[key] = val;
    }
  }

  const itemsRaw: Record<string, Record<string, string>> = {};
  for (const [key, val] of formData.entries()) {
    if (!key.startsWith("items.")) continue;
    const match = key.match(/^items\.(\d+)\.(.+)$/);
    if (!match) continue;
    const [, idx, field] = match;
    if (!itemsRaw[idx]) itemsRaw[idx] = {};
    itemsRaw[idx][field] = val as string;
  }

  const items = Object.values(itemsRaw).map((item) => ({
    description: item.description ?? "",
    quantity: item.quantity ? Number(item.quantity) : 0,
    unit: item.unit ?? "",
    unit_price: item.unit_price ? Number(item.unit_price) : 0,
  }));

  const payload = {
    client_id: (formData.get("client_id") as string) ?? "",
    invoice_number: (formData.get("invoice_number") as string) ?? "",
    issue_date: (formData.get("issue_date") as string) ?? "",
    due_date: (formData.get("due_date") as string) ?? "",
    notes: (formData.get("notes") as string) ?? "",
    tax_type: (formData.get("tax_type") as string) ?? "none",
    items,
  };

  const parsed = invoiceFormSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { client_id, invoice_number, issue_date, due_date, notes, tax_type } =
    parsed.data;

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const taxRate = TAX_RATES[tax_type];
  const taxAmount = tax_type === "none" ? 0 : Math.round(subtotal * (taxRate / 100));
  const total = tax_type === "ppn" ? subtotal + taxAmount : subtotal;

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      client_id,
      invoice_number,
      status: "draft",
      issue_date,
      due_date,
      notes: notes || null,
      tax_type,
      tax_rate: taxRate,
      subtotal,
      tax_amount: taxAmount,
      total,
    })
    .select("id")
    .single();

  if (invErr) {
    if (invErr.message.includes("invoices_number_per_user")) {
      return { error: "Nomor invoice sudah digunakan." };
    }
    return { error: "Gagal menyimpan invoice." };
  }

  const invoiceItems = items.map((item) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit || null,
    unit_price: item.unit_price,
    amount: item.quantity * item.unit_price,
  }));

  const { error: itemsErr } = await supabase
    .from("invoice_items")
    .insert(invoiceItems);

  if (itemsErr) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    return { error: "Gagal menyimpan item invoice." };
  }

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function updateInvoiceStatus(invoiceId: string, status: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };

  const { error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) return { error: "Gagal memperbarui status." };

  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) return { error: "Gagal menghapus invoice." };

  revalidatePath("/invoices");
  redirect("/invoices");
}
