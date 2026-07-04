import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user: auth },
  } = await supabase.auth.getUser();
  if (!auth) redirect("/login");

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", auth.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 pt-6 pb-10">
      <div>
        <h1 className="text-[20px] font-semibold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Kelola profil bisnis dan informasi akun anda
        </p>
      </div>
      <SettingsForm user={user} email={auth.email ?? ""} />
    </div>
  );
}
