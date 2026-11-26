"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/generated/prisma/enums";
import { CATEGORY_LABELS } from "@/lib/finance";
import type { Filters } from "@/lib/validation";

export function TransactionFilters(f: Filters) {
  const router = useRouter();
  const params = useSearchParams();

  // Đổi một tham số trên URL, giữ nguyên các tham số khác
  function pick(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value === "ALL") next.delete(key);
    else next.set(key, value);
    router.replace(`/transactions?${next}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        aria-label="Lọc theo thời gian"
        value={f.range}
        onChange={(e) => pick("range", e.target.value)}
      >
        <option value="this-month">Tháng này</option>
        <option value="last-month">Tháng trước</option>
        <option value="all">Tất cả thời gian</option>
      </select>

      <select
        aria-label="Lọc theo loại"
        value={f.type ?? "ALL"}
        onChange={(e) => pick("type", e.target.value)}
      >
        <option value="ALL">Thu và chi</option>
        <option value="INCOME">Chỉ khoản thu</option>
        <option value="EXPENSE">Chỉ khoản chi</option>
      </select>

      <select
        aria-label="Lọc theo danh mục"
        value={f.category ?? "ALL"}
        onChange={(e) => pick("category", e.target.value)}
      >
        <option value="ALL">Tất cả danh mục</option>
        {Object.values(Category).map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
    </div>
  );
}