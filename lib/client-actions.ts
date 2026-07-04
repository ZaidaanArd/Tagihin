"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const clientSchema = z.object({
  name: z.string().min(1, "Nama klien wajib diisi"),
  email: z.string().email("Email tidak valid").or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  npwp: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export async function saveClient(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };

  const raw = Object.fromEntries(formData);
  const parsed = clientSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, phone, address, npwp } = parsed.data;
  const clientId = formData.get("id") as string | null;

  if (clientId) {
    const { error } = await supabase
      .from("clients")
      .update({ name, email: email || null, phone: phone || null, address: address || null, npwp: npwp || null })
      .eq("id", clientId)
      .eq("user_id", user.id);

    if (error) return { error: "Gagal memperbarui klien." };
  } else {
    const { error } = await supabase.from("clients").insert({
      user_id: user.id,
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      npwp: npwp || null,
    });

    if (error) return { error: "Gagal menyimpan klien." };
  }

  revalidatePath("/clients");
  return { success: true };
}

export async function deleteClient(id: string, _formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Gagal menghapus klien:", error.message);
    return;
  }

  revalidatePath("/clients");
}
