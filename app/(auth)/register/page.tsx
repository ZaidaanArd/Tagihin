import Image from "next/image";
import { RegisterForm } from "./form";

export default function RegisterPage() {
  return (
    <div className="flex flex-col md:flex-row md:h-screen">
      <div className="flex min-h-screen w-full flex-col justify-center bg-white px-6 md:min-h-0 md:h-screen md:w-1/2 md:px-12">
        <div className="pt-8">
          <Image
            src="/logo.png"
            alt="Tagihin"
            width={100}
            height={0}
            style={{ height: "auto", mixBlendMode: "multiply" }}
            priority
          />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="text-[28px] font-semibold text-text-primary">Buat Akun</h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Daftar untuk mulai menggunakan Tagihin.
            </p>
            <div className="mt-8">
              <RegisterForm />
            </div>
          </div>
        </div>

        <p className="pb-6 text-center text-xs text-text-muted">© 2026 Tagihin</p>
      </div>

      <div className="hidden w-full flex-col items-center justify-center bg-[#7C3AED] px-6 py-12 md:flex md:w-1/2 md:px-12">
        <div className="max-w-md text-center">
          <h2 className="text-[32px] font-bold text-white">
            Invoice profesional,<br />2 menit jadi.
          </h2>
          <p className="mt-3 text-base text-white/80">
            Buat, kirim, dan lacak invoice — semua dalam satu dashboard.
          </p>
          <div className="mx-auto mt-10 flex w-full max-w-[480px] flex-col gap-2 rounded-xl border border-white/20 bg-white/10 p-4">
            <div className="rounded-lg bg-white/10 px-4 py-3 text-left text-white">
              <p className="text-xs text-white/60">Total Tagihan</p>
              <p className="mt-0.5 text-sm font-semibold">Rp 12.500.000</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 text-left text-white">
              <p className="text-xs text-white/60">Lunas</p>
              <p className="mt-0.5 text-sm font-semibold">Rp 8.300.000</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 text-left text-white">
              <p className="text-xs text-white/60">Pending</p>
              <p className="mt-0.5 text-sm font-semibold">Rp 4.200.000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
