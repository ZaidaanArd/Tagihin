"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { deleteClient } from "@/lib/client-actions";

export function DeleteClientButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Yakin ingin menghapus klien ini? Invoice yang terkait tidak akan terhapus.")) {
      return;
    }
    startTransition(async () => {
      await deleteClient(id, new FormData());
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-md px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-danger-bg hover:text-danger-text"
    >
      Hapus
    </button>
  );
}
