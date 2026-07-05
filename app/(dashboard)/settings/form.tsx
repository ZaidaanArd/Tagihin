"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Upload } from "lucide-react";
import {
  settingsSchema,
  BANKS,
  type SettingsValues,
} from "@/lib/validations/settings-schema";
import { saveSettings, uploadLogo, deleteLogo } from "@/lib/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  user: Record<string, unknown> | null;
  email: string;
};

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-text-primary">
      {children}
      {required && <span className="ml-0.5 text-danger-text">*</span>}
    </label>
  );
}

export function SettingsForm({ user, email }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveSettings, undefined);
  const [logoUrl, setLogoUrl] = useState<string | null>((user?.logo_url as string) ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: (user?.full_name as string) ?? "",
      business_name: (user?.business_name as string) ?? "",
      phone: (user?.phone as string) ?? "",
      address: (user?.address as string) ?? "",
      npwp: (user?.npwp as string) ?? "",
      bank_name: (user?.bank_name as string) ?? "",
      bank_account: (user?.bank_account as string) ?? "",
      bank_holder: (user?.bank_holder as string) ?? "",
    },
  });

  useEffect(() => {
    if (state && "success" in state) {
      router.refresh();
    }
  }, [state, router]);

  async function onSubmit(data: SettingsValues) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.set(k, v ?? ""));
    formAction(fd);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const input = e.target;
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Format gambar harus JPG, PNG, atau WebP.");
      input.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 2MB.");
      input.value = "";
      return;
    }

    setUploadError(null);
    setUploading(true);

    const compressed = await new Promise<Blob | null>((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX_SIZE = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX_SIZE || h > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / w, MAX_SIZE / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });

    if (!compressed) {
      setUploadError("Gagal memproses gambar.");
      setUploading(false);
      input.value = "";
      return;
    }

    if (compressed.size > 1 * 1024 * 1024) {
      setUploadError("Ukuran gambar terlalu besar setelah kompresi. Coba upload gambar yang lebih kecil.");
      setUploading(false);
      input.value = "";
      return;
    }

    const fd = new FormData();
    const ext = file.name.split(".").pop();
    fd.set("logo", compressed, `logo-${Date.now()}.${ext}`);
    const result = await uploadLogo(undefined, fd);
    if ("success" in result && result.url) {
      setLogoUrl(result.url + "?t=" + Date.now());
      setUploadError(null);
    } else {
      setUploadError("error" in result ? (result.error ?? "Gagal mengupload logo.") : "Gagal mengupload logo.");
    }
    input.value = "";
    setUploading(false);
  }

  async function handleDeleteLogo() {
    await deleteLogo();
    setLogoUrl(null);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {state && "error" in state && (
        <p className="rounded-lg border border-danger-bg bg-danger-bg px-3 py-2 text-sm text-danger-text">
          {state.error}
        </p>
      )}

      {/* Section 1 — Profil Bisnis */}
      <div className="rounded-lg border border-border bg-bg-card">
        <div className="border-b border-border px-4 py-[10px]">
          <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-text-secondary">
            Profil Bisnis
          </h2>
        </div>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label required>Nama Lengkap</Label>
              <Input {...register("full_name")} placeholder="Nama lengkap" />
              {errors.full_name && <p className="text-xs text-danger-text">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Nama Bisnis</Label>
              <Input {...register("business_name")} placeholder="Nama bisnis (opsional)" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={email} readOnly className="bg-neutral-bg text-text-muted" />
            </div>
            <div className="space-y-1.5">
              <Label>Telepon</Label>
              <Input {...register("phone")} placeholder="08xxxxxxxxxx" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Alamat</Label>
            <textarea
              {...register("address")}
              rows={3}
              className="flex w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Alamat lengkap"
            />
          </div>
          <div className="space-y-1.5">
            <Label>NPWP</Label>
            <Input {...register("npwp")} placeholder="00.000.000.0-000.000" />
          </div>
        </div>
      </div>

      {/* Section 2 — Informasi Bank */}
      <div className="rounded-lg border border-border bg-bg-card">
        <div className="border-b border-border px-4 py-[10px]">
          <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-text-secondary">
            Informasi Bank
          </h2>
        </div>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nama Bank</Label>
              <select
                {...register("bank_name")}
                className="flex h-9 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Pilih bank</option>
                {BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>No. Rekening</Label>
              <Input {...register("bank_account")} placeholder="Nomor rekening" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Atas Nama</Label>
            <Input {...register("bank_holder")} placeholder="Nama pemilik rekening" />
          </div>
        </div>
      </div>

      {/* Section 3 — Logo Bisnis */}
      <div className="rounded-lg border border-border bg-bg-card">
        <div className="border-b border-border px-4 py-[10px]">
          <h2 className="text-xs font-semibold uppercase tracking-[0.05em] text-text-secondary">
            Logo Bisnis
          </h2>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-neutral-bg">
              {uploading ? (
                <svg className="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : logoUrl ? (
                <Image src={logoUrl} alt="Logo" width={80} height={80} className="object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-muted">
                  <Upload size={24} />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer rounded-lg border border-border bg-bg-card px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-neutral-bg">
                {uploading ? "Mengupload..." : "Upload Logo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
              </label>
              {uploadError && <p className="text-xs text-danger-text">{uploadError}</p>}
              {logoUrl && (
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  className="flex items-center gap-1.5 text-sm text-danger-text transition-colors hover:text-red-700"
                >
                  <Trash2 size={14} />
                  Hapus Logo
                </button>
              )}
              <p className="text-xs text-text-muted">Format: PNG, JPG. Maks 2MB.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Single submit button */}
      <div className="pt-2">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Menyimpan..." : "Simpan Semua"}
        </Button>
      </div>
    </form>
  );
}
