"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Dùng chung cho 2 trang: mode="login" (đăng nhập) và mode="register" (đăng ký)
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // chặn trình duyệt tự tải lại trang
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const { error } = isRegister
      ? await authClient.signUp.email({
          email,
          password,
          name: String(form.get("name")),
        })
      : await authClient.signIn.email({ email, password });

    setPending(false);
    if (error) {
      setError(error.message ?? "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }
    router.push("/dashboard");
    router.refresh(); // tải lại dữ liệu server (header hiện tên user)
  }

  async function handleGithub() {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  }

  return (
    <main className="mx-auto grid w-full max-w-sm gap-4 p-8">
      <h1 className="text-2xl font-bold">
        {isRegister ? "Đăng ký" : "Đăng nhập"}
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-3">
        {isRegister && (
          <label className="grid gap-1">
            Họ tên
            <input name="name" required className="rounded border p-2" />
          </label>
        )}
        <label className="grid gap-1">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border p-2"
          />
        </label>
        <label className="grid gap-1">
          Mật khẩu
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="rounded border p-2"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black p-2 text-white disabled:opacity-50"
        >
          {pending ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGithub}
        className="rounded border p-2"
      >
        Tiếp tục với GitHub
      </button>

      <p className="text-sm">
        {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="underline"
        >
          {isRegister ? "Đăng nhập" : "Đăng ký"}
        </Link>
      </p>
    </main>
  );
}