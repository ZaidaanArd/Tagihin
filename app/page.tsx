import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { FileText, Send, CheckCircle, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Not authenticated — show public landing page
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-white px-8 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Tagihin"
            width={100}
            height={0}
            style={{ height: "auto", mixBlendMode: "multiply" }}
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-3xl text-[40px] font-bold leading-tight text-text-primary">
          Invoice profesional untuk freelancer dan UMKM Indonesia
        </h1>
        <p className="mt-4 max-w-xl text-base text-text-secondary">
          Buat, kirim, dan lacak invoice dalam hitungan menit. 
          Dirancang khusus untuk kebutuhan bisnis Indonesia.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href={user ? "/invoices/new" : "/register"}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Buat Invoice Gratis
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-neutral-bg"
          >
            Masuk
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-white px-8 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-bg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-text-primary">Buat Invoice</h3>
            <p className="mt-1 text-sm text-text-secondary">Invoice profesional dalam 2 menit</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-bg">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-text-primary">Kirim ke Klien</h3>
            <p className="mt-1 text-sm text-text-secondary">Email otomatis + link publik</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-bg">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-text-primary">Lacak Pembayaran</h3>
            <p className="mt-1 text-sm text-text-secondary">Pantau status invoice real-time</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-8 py-6 text-center text-xs text-text-muted">
        © 2026 Tagihin. All rights reserved.
      </footer>
    </div>
  );
}
