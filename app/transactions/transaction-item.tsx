"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CATEGORY_LABELS, formatVND } from "@/lib/finance";
import { deleteTransaction } from "./actions";
import { TransactionForm, type TransactionInitial } from "./transaction-form";

export function TransactionItem({ item }: { item: TransactionInitial }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className="list-none">
        <TransactionForm initial={item} onDone={() => setEditing(false)} />
      </li>
    );
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteTransaction(item.id);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  const isIncome = item.type === "INCOME";

  return (
    <li className="flex items-center justify-between gap-3 rounded border p-3">
      <div>
        <p className="font-medium">{item.description}</p>
        <p className="text-xs opacity-70">
          {CATEGORY_LABELS[item.category]} · {item.date}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`font-semibold ${
            isIncome ? "text-green-600" : "text-red-600"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatVND(item.amount)}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="px-2 py-1 text-xs"
        >
          Sửa
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={handleDelete}
          className="px-2 py-1 text-xs text-red-600 disabled:opacity-50"
        >
          {pending ? "..." : "Xoá"}
        </button>
      </div>
    </li>
  );
}