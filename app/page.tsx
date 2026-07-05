import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, FileText, Mail, FileDown, BarChart3, Receipt, Share2 } from "lucide-react";

const features = [
  { icon: FileText, title: "Buat Invoice dalam 2 Menit", desc: "Form intuitif dengan auto-kalkulasi pajak dan Rupiah." },
  { icon: Mail, title: "Kirim via Email Otomatis", desc: "Kirim invoice langsung ke email klien dengan satu klik." },
  { icon: FileDown, title: "Download PDF Profesional", desc: "Invoice siap cetak dengan format profesional." },
  { icon: BarChart3, title: "Lacak Status Pembayaran", desc: "Pantau invoice mana yang sudah dibayar atau tertunggak." },
  { icon: Receipt, title: "Support Pajak Indonesia", desc: "PPh 21, PPh 23, dan PPN 11% sesuai regulasi." },
  { icon: Share2, title: "Share Link ke Klien", desc: "Link publik yang bisa dilihat klien tanpa login." },
];

export default async function LandingPage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {}

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-border bg-white/80 px-6 py-4 backdrop-blur md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Tagihin" width={100} height={0} style={{ height: "auto", mixBlendMode: "multiply" }} priority />
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-medium text-[#6B7280] transition-colors hover:text-[#7C3AED] md:inline">Masuk</Link>
              <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">Daftar</Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="flex min-h-[85vh] items-start bg-white px-6 pt-16 md:px-12 md:pt-24" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, #F0F0F0 39px, #F0F0F0 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #F0F0F0 39px, #F0F0F0 40px)" }}>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-[28px] font-bold leading-tight text-[#111827] md:text-[44px]">
              Invoice profesional untuk freelancer dan UMKM Indonesia
            </h1>
            <p className="mt-4 max-w-md text-base text-[#6B7280]">
              Buat, kirim, dan lacak invoice dalam hitungan menit. Dirancang khusus untuk kebutuhan bisnis Indonesia dengan support PPh dan PPN.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 md:flex-row">
              <Link href={user ? "/invoices/new" : "/register"} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 md:w-auto">
                Buat Invoice Gratis
                <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="w-full rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-[#6B7280] transition-colors hover:bg-neutral-bg md:w-auto">
                Masuk
              </Link>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="overflow-hidden rounded-xl border border-border shadow-2xl" style={{ transform: "rotate(-2deg)" }}>
              <img src="/preview.png" alt="Tagihin Dashboard" className="block w-full max-w-[520px]" />
            </div>
          </div>
        </div>
      </section>



      {/* Features */}
      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-[28px] font-bold text-[#111827]">Semua yang kamu butuhkan</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl border border-border bg-white p-6 text-left transition-shadow hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-bg">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#111827]">{f.title}</h3>
                <p className="mt-1 text-sm text-[#6B7280]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#F5F5F7] px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-[28px] font-bold text-[#111827]">Cara kerja Tagihin</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Daftar gratis", desc: "Daftar dalam 30 detik, tanpa kartu kredit." },
              { num: "02", title: "Tambah klien & buat invoice", desc: "Isi detail invoice, item pekerjaan, dan pajak." },
              { num: "03", title: "Kirim dan pantau", desc: "Kirim email atau share link, lacak status pembayaran." },
            ].map((step, i) => (
              <div key={step.num} className="relative">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {step.num}
                </div>
                {i < 2 && <div className="absolute left-[calc(50%+36px)] top-7 hidden h-px w-[calc(100%-72px)] border-t-2 border-dashed border-primary/30 md:block" />}
                <h3 className="mt-4 text-sm font-semibold text-[#111827]">{step.title}</h3>
                <p className="mt-1 text-sm text-[#6B7280]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#7C3AED] px-6 py-20 text-center md:px-12">
        <h2 className="text-[32px] font-bold text-white">Siap tagih lebih mudah?</h2>
        <p className="mt-2 text-base text-white/80">Gratis selamanya untuk freelancer solo.</p>
        <Link href={user ? "/invoices/new" : "/register"} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-medium text-[#7C3AED] transition-opacity hover:opacity-90 md:w-auto">
          Mulai Sekarang
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-[#9CA3AF]">© 2026 Tagihin. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
            <Link href="/login" className="transition-colors hover:text-white">Masuk</Link>
            <Link href="/register" className="transition-colors hover:text-white">Daftar</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
