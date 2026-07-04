"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/validations/settings-schema";

export async function saveSettings(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };

  const raw = Object.fromEntries(formData);
  const parsed = settingsSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("users")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) return { error: "Gagal menyimpan pengaturan." };

  revalidatePath("/settings");
  return { success: true };
}

export async function uploadLogo(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };

  const file = formData.get("logo") as File | null;
  if (!file) return { error: "Pilih file terlebih dahulu." };

  const ext = file.name.split(".").pop();
  const filePath = `${user.id}/logo.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadErr) return { error: "Gagal mengunggah logo." };

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const { error: updateErr } = await supabase
    .from("users")
    .update({ logo_url: urlData.publicUrl })
    .eq("id", user.id);

  if (updateErr) return { error: "Gagal menyimpan logo." };

  revalidatePath("/settings");
  return { success: true, url: urlData.publicUrl };
}

export async function deleteLogo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };

  const { data: userData } = await supabase
    .from("users")
    .select("logo_url")
    .eq("id", user.id)
    .single();

  if (userData?.logo_url) {
    const path = userData.logo_url.split("/").pop();
    if (path) {
      await supabase.storage.from("avatars").remove([`${user.id}/${path}`]);
    }
  }

  await supabase.from("users").update({ logo_url: null }).eq("id", user.id);

  revalidatePath("/settings");
  return { success: true };
}
