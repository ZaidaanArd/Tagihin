"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveClient } from "@/lib/client-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const clientSchema = z.object({
  name: z.string().min(1, "Nama klien wajib diisi"),
  email: z.string().email("Email tidak valid").or(z.literal("")),
  phone: z.string().optional(),
  npwp: z.string().optional(),
  address: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

export function EditClientForm({ client }: { client: { id: string; name: string; email: string; phone: string; npwp: string; address: string } }) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveClient, undefined);

  const { register, handleSubmit, formState: { errors } } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      npwp: client.npwp,
      address: client.address,
    },
  });

  useEffect(() => {
    if (state && "success" in state) {
      router.push("/clients");
    }
  }, [state, router]);

  async function onSubmit(data: ClientForm) {
    const fd = new FormData();
    fd.set("id", client.id);
    Object.entries(data).forEach(([k, v]) => fd.set(k, v ?? ""));
    formAction(fd);
  }

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {state && "error" in state && (
          <p className="rounded-lg border border-danger-bg bg-danger-bg px-3 py-2 text-sm text-danger-text">
            {state.error}
          </p>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">
            Nama Klien <span className="text-danger-text">*</span>
          </label>
          <Input {...register("name")} placeholder="Nama lengkap" />
          {errors.name && <p className="text-xs text-danger-text">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Email</label>
          <Input {...register("email")} type="email" placeholder="klien@email.com" />
          {errors.email && <p className="text-xs text-danger-text">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Telepon</label>
          <Input {...register("phone")} placeholder="08xxxxxxxxxx" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">NPWP</label>
          <Input {...register("npwp")} placeholder="00.000.000.0-000.000" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Alamat</label>
          <textarea
            {...register("address")}
            rows={3}
            className="flex w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Alamat lengkap"
          />
        </div>

        <div className="flex items-center justify-between">
          <Link href="/clients" className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary">
            Batal
          </Link>
          <Button type="submit">Simpan Perubahan</Button>
        </div>
      </form>
    </div>
  );
}
