"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CsvTools() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/transactions/csv", {
        method: "POST",
        headers: { "Content-Type": "text/csv; charset=utf-8" },
        body: text,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Không thể nhập file CSV");
      } else {
        toast.success(data.message);
        router.refresh();
      }
    } catch {
      toast.error("Lỗi khi đọc file CSV");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <a
        href="/api/transactions/csv"
        download="transactions.csv"
        className="rounded border px-3 py-1.5"
      >
        Xuất CSV
      </a>
      <label className="cursor-pointer rounded border px-3 py-1.5">
        {loading ? "Đang nhập..." : "Nhập CSV"}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
        />
      </label>
    </div>
  );
}