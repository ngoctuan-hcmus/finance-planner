import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  // Lưu user/session/account vào Postgres qua Prisma
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // Đăng nhập bằng email + mật khẩu
  emailAndPassword: { enabled: true },
  // Đăng nhập bằng GitHub (OAuth)
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  // Cho phép Server Action đặt cookie đăng nhập (phải để CUỐI mảng)
  plugins: [nextCookies()],
});