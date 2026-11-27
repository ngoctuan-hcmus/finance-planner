"use server";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { crossedMilestones, wishlistProgress } from "@/lib/finance";
import {
  readWishlistValues,
  wishlistSchema,
  type WishlistFormState,
} from "@/lib/validation";

export async function createWishlistItem(
  _prev: WishlistFormState,
  formData: FormData,
): Promise<WishlistFormState> {
  const user = await requireUser();
  const values = readWishlistValues(formData);
  const parsed = wishlistSchema.safeParse(values);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin",
      errors: flat.fieldErrors,
      values,
    };
  }
  await prisma.wishlistItem.create({
    data: {
      ...parsed.data,
      userId: user.id,
    },
  });
  revalidatePath("/wishlist");
  revalidatePath("/dashboard");
  return { ok: true, message: "Đã thêm vào Wishlist" };
}

export async function updateWishlistItem(
  id: string,
  _prev: WishlistFormState,
  formData: FormData,
): Promise<WishlistFormState> {
  const user = await requireUser();
  const values = readWishlistValues(formData);
  const parsed = wishlistSchema.safeParse(values);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin",
      errors: flat.fieldErrors,
      values,
    };
  }
  const { count } = await prisma.wishlistItem.updateMany({
    where: { id, userId: user.id },
    data: parsed.data,
  });
  if (count === 0) {
    return { ok: false, message: "Không tìm thấy mục Wishlist" };
  }
  revalidatePath("/wishlist");
  revalidatePath("/dashboard");
  return { ok: true, message: "Đã cập nhật Wishlist" };
}

export async function deleteWishlistItem(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  const { count } = await prisma.wishlistItem.deleteMany({
    where: { id, userId: user.id },
  });
  if (count === 0) {
    return { ok: false, message: "Không tìm thấy mục Wishlist" };
  }
  revalidatePath("/wishlist");
  revalidatePath("/dashboard");
  return { ok: true, message: "Đã xoá khỏi Wishlist" };
}

// Kiểm tra các mốc tiết kiệm 50%, 75%, 100% mới vượt qua và lưu lại để không báo lặp
export async function checkAndNotifyMilestones(): Promise<string[]> {
  const user = await requireUser();
  const [thu, chi, items] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "INCOME" },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "EXPENSE" },
    }),
    prisma.wishlistItem.findMany({
      where: { userId: user.id, purchased: false },
    }),
  ]);

  const balance = (thu._sum.amount ?? 0) - (chi._sum.amount ?? 0);
  const messages: string[] = [];

  for (const item of items) {
    const progress = wishlistProgress(balance, item.cost);
    const crossed = crossedMilestones(item.notifiedMilestone, progress);
    if (crossed.length > 0) {
      const highest = crossed[crossed.length - 1];
      await prisma.wishlistItem.updateMany({
        where: { id: item.id, userId: user.id },
        data: { notifiedMilestone: highest },
      });
      messages.push(
        `Chúc mừng! Bạn đã tiết kiệm đạt ${highest}% cho "${item.name}"!`,
      );
    }
  }
  return messages;
}