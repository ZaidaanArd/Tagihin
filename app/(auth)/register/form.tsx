"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { register } from "@/lib/auth-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Memproses..." : "Daftar"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(register, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && (
        <p className="rounded-lg border border-danger-bg bg-danger-bg px-3 py-2 text-sm text-danger-text">
          {state.error}
        </p>
      )}
      <div className="space-y-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-text-primary">
          Nama Lengkap <span className="text-danger-text">*</span>
        </label>
        <Input id="full_name" name="full_name" placeholder="Nama lengkap" required />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text-primary">
          Email <span className="text-danger-text">*</span>
        </label>
        <Input id="email" name="email" type="email" placeholder="contoh@email.com" required />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-text-primary">
          Password <span className="text-danger-text">*</span>
        </label>
        <Input id="password" name="password" type="password" placeholder="Minimal 6 karakter" required />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm_password" className="text-sm font-medium text-text-primary">
          Konfirmasi Password <span className="text-danger-text">*</span>
        </label>
        <Input id="confirm_password" name="confirm_password" type="password" placeholder="Ulangi password" required />
      </div>
      <SubmitButton />
      <p className="text-center text-sm text-text-secondary">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
          Masuk
        </Link>
      </p>
    </form>
  );
}
