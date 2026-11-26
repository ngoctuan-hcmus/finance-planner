"use client";
import { useActionState } from "react";
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

export function TransactionForm({
  initial,
  onDone,
}: {
  initial?: TransactionInitial;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const res = initial
        ? await updateTransaction(initial.id, prev, formData)
        : await createTransaction(prev, formData);
      if (res.ok) {
        toast.success(res.message);
        onDone?.();
      } else if (res.message) {
        toast.error(res.message);
      }
      return res;
    },
    {},
  );

  const { values: v = {}, errors: err = {} } = state;

  return (
    <form action={formAction} className="grid gap-2 rounded border p-4">
      <div className="grid grid-cols-2 gap-2">
        <select
          name="type"
          aria-label="Loại"
          defaultValue={v.type ?? initial?.type ?? "EXPENSE"}
        >
          <option value="EXPENSE">Chi tiêu</option>
          <option value="INCOME">Thu nhập</option>
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
        <input
          name="amount"
          type="number"
          placeholder="Số tiền (VND)"
          defaultValue={v.amount ?? initial?.amount}
          className="w-full"
        />
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
          className="flex-1 bg-black text-white disabled:opacity-50 dark:bg-white dark:text-black"
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