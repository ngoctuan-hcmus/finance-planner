"use client";
import { useActionState } from "react";
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

export function WishlistForm({
  initial,
  onDone,
}: {
  initial?: WishlistInitial;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: WishlistFormState, formData: FormData) => {
      const res = initial
        ? await updateWishlistItem(initial.id, prev, formData)
        : await createWishlistItem(prev, formData);
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
          <input
            name="cost"
            type="number"
            placeholder="Giá dự kiến (VND)"
            defaultValue={v.cost ?? initial?.cost}
            className="w-full"
          />
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
          className="flex-1 bg-black text-white disabled:opacity-50 dark:bg-white dark:text-black"
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