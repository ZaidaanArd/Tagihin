"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailResult = { error: string } | { success: true };

export async function sendInvoiceEmail(invoiceId: string): Promise<EmailResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(email, name), users(business_name)")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (!invoice) return { error: "Invoice tidak ditemukan." };

  const clientEmail = (invoice.clients as Record<string, unknown>)?.email as string;
  if (!clientEmail) return { error: "Klien tidak memiliki alamat email." };

  const clientName = (invoice.clients as Record<string, unknown>)?.name as string;
  const businessName = (invoice.users as Record<string, unknown>)?.business_name as string ?? "Tagihin";
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.public_token}`;
  const totalFormatted = Number(invoice.total ?? 0).toLocaleString("id-ID");
  const dueDate = new Date(invoice.due_date).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  const { error } = await resend.emails.send({
    // TODO: Ganti dengan domain sendiri saat production
    // from: 'Tagihin <invoice@tagihin.com>'
    from: `${businessName} <onboarding@resend.dev>`,
    to: clientEmail,
    subject: `Invoice ${invoice.invoice_number} dari ${businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7C3AED;">${businessName}</h2>
        <p>Halo ${clientName},</p>
        <p>Anda menerima invoice <strong>${invoice.invoice_number}</strong> senilai <strong>Rp ${totalFormatted}</strong>.</p>
        <p>Jatuh tempo: ${dueDate}</p>
        <div style="margin: 24px 0;">
          <a href="${publicUrl}" style="background: #7C3AED; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">
            Lihat Invoice
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #E5E7EB;" />
        <p style="font-size: 12px; color: #9CA3AF;">${publicUrl}</p>
      </div>
    `,
  });

  if (error) return { error: "Gagal mengirim email." };

  await supabase
    .from("invoices")
    .update({ status: "sent" })
    .eq("id", invoiceId);

  return { success: true };
}
