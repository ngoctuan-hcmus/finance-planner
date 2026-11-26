"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import * as z from "zod";
import {
  readValues, transactionSchema, type FormState,
} from "@/lib/validation";

export async function createTransaction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser(); // 1. Kiểm tra đăng nhập TRƯỚC
  const values = readValues(formData);
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return { errors: flat.fieldErrors, values };
  }
  await prisma.transaction.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date), // chuỗi → Date
      userId: user.id, // lấy từ session, KHÔNG lấy từ form
    },
  });
  revalidatePath("/transactions");
  return { ok: true, message: "Đã thêm giao dịch" };
}