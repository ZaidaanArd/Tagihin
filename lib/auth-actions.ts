"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth-schema";
import { checkRateLimit } from "@/lib/rate-limit";

export type AuthResult = { error: string } | { success: true };

export async function login(_prev: unknown, formData: FormData): Promise<AuthResult> {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const rateLimit = checkRateLimit(`login:${ip}`);

  if (!rateLimit.allowed) {
    return { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Email atau password salah." };
  }

  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/dashboard");
}

export async function register(_prev: unknown, formData: FormData): Promise<AuthResult> {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const rateLimit = checkRateLimit(`register:${ip}`);

  if (!rateLimit.allowed) {
    return { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password, full_name } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      return { error: "Email sudah terdaftar." };
    }
    return { error: "Gagal mendaftar. Coba lagi nanti." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return {
    email: data.user.email ?? "",
    full_name: data.user.user_metadata?.full_name ?? data.user.email?.split("@")[0] ?? "Pengguna",
  };
}
