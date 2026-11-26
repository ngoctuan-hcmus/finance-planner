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
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin",
      errors: flat.fieldErrors,
      values,
    };
  }
  await prisma.transaction.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date), // chuỗi → Date
      userId: user.id, // lấy từ session, KHÔNG lấy từ form
    },
  });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { ok: true, message: "Đã thêm giao dịch" };
}

export async function updateTransaction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const values = readValues(formData);
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin",
      errors: flat.fieldErrors,
      values,
    };
  }
  // Dùng updateMany với { id, userId } và kiểm tra count để chống sửa trộm của người khác
  const { count } = await prisma.transaction.updateMany({
    where: { id, userId: user.id },
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
    },
  });
  if (count === 0) {
    return { ok: false, message: "Không tìm thấy giao dịch" };
  }
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { ok: true, message: "Đã cập nhật giao dịch" };
}

export async function deleteTransaction(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  // Dùng deleteMany với { id, userId } và kiểm tra count
  const { count } = await prisma.transaction.deleteMany({
    where: { id, userId: user.id },
  });
  if (count === 0) {
    return { ok: false, message: "Không tìm thấy giao dịch" };
  }
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { ok: true, message: "Đã xoá giao dịch" };
}