import Image from "next/image";
import { LoginForm } from "./form";

export default function LoginPage() {
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
            <h1 className="text-[28px] font-semibold text-text-primary">Selamat Datang</h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Masukkan email dan password untuk masuk ke akun anda.
            </p>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </div>

        <p className="pb-6 text-center text-xs text-text-muted">© 2026 Tagihin</p>
      </div>

      <div className="hidden w-full flex-col items-center justify-center gap-6 bg-[#7C3AED] px-12 md:flex md:w-1/2">
        <div className="max-w-md text-center">
          <h2 className="text-[28px] font-bold text-white">
            Invoice profesional,<br />2 menit jadi.
          </h2>
          <p className="mt-2 text-[15px] text-white/80">
            Buat, kirim, dan lacak invoice — semua dalam satu dashboard.
          </p>
        </div>
        <img
          src="/preview.png"
          alt="Tagihin Dashboard"
          style={{ borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', height: 'auto', maxWidth: '600px' }}
        />
      </div>
    </div>
  );
}
