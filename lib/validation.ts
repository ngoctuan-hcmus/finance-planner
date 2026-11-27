import * as z from "zod";
import {
  Category, Priority, TransactionType,
} from "@/generated/prisma/enums";

export const transactionSchema = z.object({
  type: z.enum(TransactionType,
    { error: "Chọn loại giao dịch" }),
  amount: z.coerce.number()
    .int({ error: "Phải là số nguyên" })
    .positive({ error: "Phải lớn hơn 0" }),
  description: z.string().trim()
    .min(1, { error: "Nhập mô tả" })
    .max(120, { error: "Tối đa 120 ký tự" }),
  category: z.enum(Category,
    { error: "Chọn danh mục" }),
  date: z.iso.date({ error: "Ngày không hợp lệ" }),
});
type Field = keyof z.infer<typeof transactionSchema>;
type Values = Partial<Record<Field, string>>;

// Kết quả action trả về cho form sau mỗi lần gửi
export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Partial<Record<Field, string[]>>;
  values?: Values;
};

// FormData → object chuỗi (để trả lại form khi lỗi)
export function readValues(data: FormData): Values {
  const fields = Object.keys(transactionSchema.shape);
  return Object.fromEntries(
    fields.map((f) => [f, String(data.get(f) ?? "")]),
  );
}

// Schema validate cho Wishlist (Danh sách mong muốn)
export const wishlistSchema = z.object({
  name: z.string().trim()
    .min(1, { error: "Nhập tên món đồ" })
    .max(120, { error: "Tối đa 120 ký tự" }),
  cost: z.coerce.number()
    .int({ error: "Giá phải là số nguyên" })
    .positive({ error: "Giá phải lớn hơn 0" }),
  priority: z.enum(Priority,
    { error: "Chọn mức ưu tiên" }),
});
type WishlistField = keyof z.infer<typeof wishlistSchema>;
type WishlistValues = Partial<Record<WishlistField, string>>;

export type WishlistFormState = {
  ok?: boolean;
  message?: string;
  errors?: Partial<Record<WishlistField, string[]>>;
  values?: WishlistValues;
};

export function readWishlistValues(data: FormData): WishlistValues {
  const fields = Object.keys(wishlistSchema.shape);
  return Object.fromEntries(
    fields.map((f) => [f, String(data.get(f) ?? "")]),
  );
}

// Bộ lọc đọc từ URL: /transactions?range=…&type=…
export const RANGES =
  ["this-month", "last-month", "all"] as const;

export const transactionFilterSchema = z.object({
  range: z.enum(RANGES).default("this-month"),
  type: z.enum(TransactionType).optional(),
  category: z.enum(Category).optional(),
});

export type Filters =
  z.infer<typeof transactionFilterSchema>;

// Đọc và kiểm tra định dạng CSV giao dịch (date,type,category,amount,description)
export function parseTransactionsCsv(csvText: string) {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      ok: false as const,
      error: "File CSV trống hoặc thiếu dòng dữ liệu",
    };
  }

  const header = lines[0].toLowerCase();
  if (header !== "date,type,category,amount,description") {
    return {
      ok: false as const,
      error:
        "Dòng tiêu đề CSV phải là: date,type,category,amount,description",
    };
  }

  const rows: z.infer<typeof transactionSchema>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 5) {
      return {
        ok: false as const,
        error: `Dòng ${i + 1} thiếu cột dữ liệu`,
      };
    }
    const [date, type, category, amount, ...descParts] = parts;
    const description = descParts.join(",").replace(/^"|"$/g, "").trim();
    const parsed = transactionSchema.safeParse({
      date: date.trim(),
      type: type.trim(),
      category: category.trim(),
      amount: amount.trim(),
      description,
    });
    if (!parsed.success) {
      return {
        ok: false as const,
        error: `Dòng ${i + 1} sai định dạng dữ liệu`,
      };
    }
    rows.push(parsed.data);
  }

  return { ok: true as const, rows };
}