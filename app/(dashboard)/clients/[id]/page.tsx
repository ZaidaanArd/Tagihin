import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditClientForm } from "./form";

export default async function EditClientPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, email, phone, npwp, address")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!client) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl space-y-7 pt-6">
      <div>
        <h1 className="text-[22px] font-medium text-text-primary">Edit Klien</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Perbarui data klien
        </p>
      </div>

      <EditClientForm client={client} />
    </div>
  );
}
