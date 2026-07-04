import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/utils";
import { DeleteClientButton } from "./delete-button";

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, phone, npwp")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-6 pt-5">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary">Klien</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Kelola data klien anda
          </p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          + Tambah Klien
        </Link>
      </div>

      <div className="mx-6 overflow-x-auto rounded-lg border border-border bg-bg-card">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-sidebar text-xs text-text-muted">
              <th className="px-4 py-[11px] text-left font-normal">Klien</th>
              <th className="px-4 py-[11px] text-left font-normal">Email</th>
              <th className="px-4 py-[11px] text-left font-normal">Telepon</th>
              <th className="px-4 py-[11px] text-left font-normal">NPWP</th>
              <th className="px-4 py-[11px] text-right font-normal">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {clients && clients.length > 0 ? (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border text-sm text-text-primary last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-[11px] font-medium text-primary-dark">
                        {getInitials(client.name)}
                      </div>
                      <span>{client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{client.email ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{client.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{client.npwp ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/clients/${client.id}`}
                        className="rounded-md px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-neutral-bg hover:text-primary-dark"
                      >
                        Edit
                      </Link>
                      <DeleteClientButton id={client.id} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-muted">
                  Belum ada klien.{" "}
                  <Link href="/clients/new" className="text-primary hover:text-primary-dark">
                    Tambah klien sekarang
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
