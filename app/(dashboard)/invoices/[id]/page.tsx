import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceView } from "./invoice-view";

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .select("*, clients(*), invoice_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (invErr) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-6 pt-6">
        <div className="rounded-lg border border-danger-bg bg-danger-bg px-4 py-3 text-sm text-danger-text">
          Terjadi kesalahan. Silakan coba lagi.
        </div>
      </div>
    );
  }

  if (!invoice) notFound();

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 pt-6">
      <InvoiceView invoice={invoice} userData={userData} />
    </div>
  );
}
