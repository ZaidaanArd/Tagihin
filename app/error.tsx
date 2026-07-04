"use client";

export default function RootError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-page px-6 text-center">
      <h1 className="text-[22px] font-semibold text-text-primary">Terjadi Kesalahan</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Silakan coba lagi atau hubungi dukungan jika masalah berlanjut.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Coba Lagi
      </button>
    </div>
  );
}
