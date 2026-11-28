"use client";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Category, type TransactionType } from "@/generated/prisma/enums";
import { CATEGORY_LABELS } from "@/lib/finance";
import type { FormState } from "@/lib/validation";
import { createTransaction, updateTransaction } from "./actions";

export type TransactionInitial = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: Category;
  date: string; // YYYY-MM-DD
};

// Định dạng chuỗi số thành dạng có dấu chấm hàng nghìn (vd: 1500000 -> 1.500.000)
function formatThousands(val: string | number | undefined): string {
  if (val === undefined || val === "") return "";
  const digits = String(val).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function TransactionForm({
  initial,
  onDone,
}: {
  initial?: TransactionInitial;
  onDone?: () => void;
}) {
  const [txType, setTxType] = useState<TransactionType>(
    initial?.type ?? "EXPENSE",
  );
  const [amountDisplay, setAmountDisplay] = useState<string>(
    formatThousands(initial?.amount),
  );

  const [state, formAction, pending] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const res = initial
        ? await updateTransaction(initial.id, prev, formData)
        : await createTransaction(prev, formData);
      if (res.ok) {
        toast.success(res.message);
        if (!initial) setAmountDisplay("");
        onDone?.();
      } else if (res.message) {
        toast.error(res.message);
      }
      return res;
    },
    {},
  );

  const { values: v = {}, errors: err = {} } = state;
  const isIncome = txType === "INCOME";

  function stepAmount(delta: number) {
    const raw = parseInt(amountDisplay.replace(/\D/g, "") || "0", 10);
    const next = Math.max(0, raw + delta); // Không bao giờ xuống số âm
    setAmountDisplay(next === 0 ? "" : formatThousands(next));
  }

  function handleAmountKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      stepAmount(10_000);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      stepAmount(-10_000);
    } else if (e.key === "-" || e.key === "+") {
      e.preventDefault(); // Chặn gõ dấu âm
    }
  }

  return (
    <form action={formAction} className="grid gap-2.5 rounded-xl border p-4">
      <div className="grid grid-cols-2 gap-2">
        <select
          name="type"
          aria-label="Loại"
          value={txType}
          onChange={(e) => setTxType(e.target.value as TransactionType)}
        >
          <option value="EXPENSE">Chi tiêu (−)</option>
          <option value="INCOME">Thu nhập (+)</option>
        </select>

        <select
          name="category"
          aria-label="Danh mục"
          defaultValue={v.category ?? initial?.category ?? "FOOD"}
        >
          {Object.values(Category).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-stretch overflow-hidden rounded-lg border focus-within:border-emerald-600">
          {/* Tự động hiển thị dấu + (Thu nhập) hoặc - (Chi tiêu) */}
          <span
            aria-hidden="true"
            className={`inline-flex items-center border-r px-3 text-base font-extrabold select-none ${
              isIncome
                ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
            }`}
          >
            {isIncome ? "+" : "−"}
          </span>

          <input
            name="amount"
            type="text"
            inputMode="numeric"
            placeholder="Số tiền (vd: 1.500.000)"
            value={amountDisplay}
            onChange={(e) => setAmountDisplay(formatThousands(e.target.value))}
            onKeyDown={handleAmountKeyDown}
            className={`w-full rounded-none border-0 font-semibold tabular-nums focus:shadow-none ${
              isIncome
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            }`}
          />

          <span className="inline-flex items-center px-2.5 text-xs font-bold opacity-60 select-none">
            ₫
          </span>

          {/* Nút mũi tên Lên / Xuống tăng giảm 10.000 ₫ (chặn số âm) */}
          <div className="flex flex-col border-l">
            <button
              type="button"
              onClick={() => stepAmount(10_000)}
              aria-label="Tăng số tiền"
              className="rounded-none border-0 px-2 py-0.5 text-[10px] leading-none shadow-none"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => stepAmount(-10_000)}
              aria-label="Giảm số tiền"
              className="rounded-none border-0 border-t px-2 py-0.5 text-[10px] leading-none shadow-none"
            >
              ▼
            </button>
          </div>
        </div>
        <Err msg={err.amount} />
      </div>

      <div>
        <input
          name="description"
          placeholder="Mô tả (1–120 ký tự)"
          defaultValue={v.description ?? initial?.description}
          className="w-full"
        />
        <Err msg={err.description} />
      </div>

      <div>
        <input
          name="date"
          type="date"
          aria-label="Ngày"
          defaultValue={v.date ?? initial?.date}
          className="w-full"
        />
        <Err msg={err.date} />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {pending ? "Đang lưu..." : initial ? "Lưu thay đổi" : "Thêm giao dịch"}
        </button>
        {onDone && (
          <button type="button" onClick={onDone}>
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}

const Err = ({ msg }: { msg?: string[] }) =>
  msg && (
    <p role="alert" className="mt-1 text-sm text-red-600">
      {msg[0]}
    </p>
  );