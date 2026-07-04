"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/auth-actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary px-4 py-[10px] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Memproses..." : "Masuk"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {state && "error" in state && (
        <p className="rounded-lg border border-danger-bg bg-danger-bg px-3 py-2 text-sm text-danger-text">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text-primary">Email <span className="text-danger-text">*</span></label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Masukkan email"
          required
          className="h-10 w-full rounded-lg border border-border bg-bg-card px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-bg"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-text-primary">Password <span className="text-danger-text">*</span></label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan password"
            required
            className="h-10 w-full rounded-lg border border-border bg-bg-card pl-3 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-bg"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-border text-primary accent-primary"
          />
          Ingat Saya
        </label>
        <button type="button" className="text-sm font-medium text-primary hover:text-primary-text">
          Lupa Password?
        </button>
      </div>

      <SubmitButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bg-card px-2 text-text-muted">Atau masuk dengan</span>
        </div>
      </div>

      <button
        type="button"
        disabled
        title="Coming soon"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-bg-card px-4 py-[10px] text-sm font-medium text-text-secondary opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14.16 8.18C14.16 7.63 14.11 7.08 14 6.55H8.16V9.61H11.5C11.34 10.38 10.89 11.05 10.23 11.47V12.95H12.29C13.47 11.87 14.16 10.2 14.16 8.18Z" fill="#4285F4" />
          <path d="M8.16 14.5C9.93 14.5 11.41 13.9 12.29 12.95L10.23 11.47C9.75 11.77 9.07 12 8.16 12C6.45 12 5.01 10.86 4.52 9.33H2.41V10.84C3.28 12.56 5.13 14.5 8.16 14.5Z" fill="#34A853" />
          <path d="M4.52 9.33C4.37 8.87 4.29 8.38 4.29 7.88C4.29 7.38 4.37 6.89 4.52 6.43V4.92H2.41C1.88 5.96 1.59 7.13 1.59 8.38C1.59 9.63 1.88 10.8 2.41 11.84L4.52 9.33Z" fill="#FBBC05" />
          <path d="M8.16 3.75C9.12 3.75 9.99 4.07 10.67 4.72L12.32 3.07C11.41 2.23 9.93 1.5 8.16 1.5C5.13 1.5 3.28 3.44 2.41 5.16L4.52 6.67C5.01 5.14 6.45 3.75 8.16 3.75Z" fill="#EA4335" />
        </svg>
        Google
      </button>

      <p className="text-center text-sm text-text-secondary">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-primary hover:text-primary-text">
          Daftar Sekarang
        </Link>
      </p>
    </form>
  );
}
