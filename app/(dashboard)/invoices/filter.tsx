"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useCallback } from "react";

export function InvoiceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      const val = e.target.value;
      if (val) {
        params.set("q", val);
      } else {
        params.delete("q");
      }
      router.push(`/invoices${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          placeholder="Cari..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={handleSearch}
          className="h-9 w-[240px] rounded-md border border-border bg-bg-card pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-bg"
        />
      </div>
      <button className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-card text-text-secondary transition-colors hover:bg-neutral-bg">
        <SlidersHorizontal size={14} />
      </button>
    </div>
  );
}
