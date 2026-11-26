import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Lấy user đang đăng nhập (hoặc null). cache() giúp nhiều chỗ gọi
// trong cùng 1 request chỉ đọc session 1 lần.
export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

// Bắt buộc đăng nhập: chưa đăng nhập -> chuyển sang /login
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}