import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewInvoiceForm } from "./form";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name");

  const { data: invoiceData } = await supabase
    .rpc("generate_invoice_number", { p_user_id: user.id })
    .single();

  const invoiceNumber =
    typeof invoiceData === "string"
      ? invoiceData
      : `INV/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;

  return (
    <div className="mx-auto max-w-3xl space-y-7 px-4 pt-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary">
            Invoice Baru
          </h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Buat invoice profesional untuk klien anda
          </p>
        </div>
      </div>

      <NewInvoiceForm clients={clients ?? []} invoiceNumber={invoiceNumber} />
    </div>
  );
}
