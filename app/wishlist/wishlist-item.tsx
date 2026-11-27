"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatVND, PRIORITY_LABELS, wishlistProgress } from "@/lib/finance";
import { deleteWishlistItem } from "./actions";
import { WishlistForm, type WishlistInitial } from "./wishlist-form";

export function WishlistItemCard({
  item,
  balance,
}: {
  item: WishlistInitial;
  balance: number;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className="list-none">
        <WishlistForm initial={item} onDone={() => setEditing(false)} />
      </li>
    );
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteWishlistItem(item.id);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  const progress = wishlistProgress(balance, item.cost);

  return (
    <li className="grid gap-2 rounded border p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{item.name}</p>
          <p className="text-xs opacity-70">
            Giá: {formatVND(item.cost)} · Ưu tiên: {PRIORITY_LABELS[item.priority]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{progress}%</span>
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
      </div>

      {/* Thanh tiến độ 0 - 100% */}
      <div
        role="progressbar"
        aria-label={`Tiến độ ${item.name}`}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          className="h-full bg-green-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </li>
  );
}