import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-page px-6 text-center">
      <h1 className="text-[22px] font-semibold text-text-primary">Halaman Tidak Ditemukan</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Halaman yang anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
