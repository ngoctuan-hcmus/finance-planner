"use client";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Priority } from "@/generated/prisma/enums";
import { PRIORITY_LABELS } from "@/lib/finance";
import type { WishlistFormState } from "@/lib/validation";
import { createWishlistItem, updateWishlistItem } from "./actions";

export type WishlistInitial = {
  id: string;
  name: string;
  cost: number;
  priority: Priority;
};

function formatThousands(val: string | number | undefined): string {
  if (val === undefined || val === "") return "";
  const digits = String(val).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function WishlistForm({
  initial,
  onDone,
}: {
  initial?: WishlistInitial;
  onDone?: () => void;
}) {
  const [costDisplay, setCostDisplay] = useState<string>(
    formatThousands(initial?.cost),
  );

  const [state, formAction, pending] = useActionState(
    async (prev: WishlistFormState, formData: FormData) => {
      const res = initial
        ? await updateWishlistItem(initial.id, prev, formData)
        : await createWishlistItem(prev, formData);
      if (res.ok) {
        toast.success(res.message);
        if (!initial) setCostDisplay("");
        onDone?.();
      } else if (res.message) {
        toast.error(res.message);
      }
      return res;
    },
    {},
  );

  const { values: v = {}, errors: err = {} } = state;

  function stepCost(delta: number) {
    const raw = parseInt(costDisplay.replace(/\D/g, "") || "0", 10);
    const next = Math.max(0, raw + delta); // Không bao giờ xuống số âm
    setCostDisplay(next === 0 ? "" : formatThousands(next));
  }

  function handleCostKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      stepCost(50_000);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      stepCost(-50_000);
    } else if (e.key === "-" || e.key === "+") {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} className="grid gap-2.5 rounded-xl border p-4">
      <div>
        <input
          name="name"
          placeholder="Tên món đồ mong muốn (1–120 ký tự)"
          defaultValue={v.name ?? initial?.name}
          className="w-full"
        />
        <Err msg={err.name} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-stretch overflow-hidden rounded-lg border focus-within:border-emerald-600">
            <input
              name="cost"
              type="text"
              inputMode="numeric"
              placeholder="Giá dự kiến (vd: 1.500.000)"
              value={costDisplay}
              onChange={(e) => setCostDisplay(formatThousands(e.target.value))}
              onKeyDown={handleCostKeyDown}
              className="w-full rounded-none border-0 font-semibold tabular-nums focus:shadow-none"
            />
            <span className="inline-flex items-center px-2 text-xs font-bold opacity-60 select-none">
              ₫
            </span>
            <div className="flex flex-col border-l">
              <button
                type="button"
                onClick={() => stepCost(50_000)}
                aria-label="Tăng giá"
                className="rounded-none border-0 px-2 py-0.5 text-[10px] leading-none shadow-none"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => stepCost(-50_000)}
                aria-label="Giảm giá"
                className="rounded-none border-0 border-t px-2 py-0.5 text-[10px] leading-none shadow-none"
              >
                ▼
              </button>
            </div>
          </div>
          <Err msg={err.cost} />
        </div>

        <div>
          <select
            name="priority"
            aria-label="Mức ưu tiên"
            defaultValue={v.priority ?? initial?.priority ?? "MEDIUM"}
            className="w-full"
          >
            {Object.values(Priority).map((p) => (
              <option key={p} value={p}>
                Ưu tiên: {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <Err msg={err.priority} />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {pending ? "Đang lưu..." : initial ? "Lưu thay đổi" : "Thêm vào Wishlist"}
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