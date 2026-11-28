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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const emailVal = String(form.get("email"));
    const passwordVal = String(form.get("password"));

    const { error } = isRegister
      ? await authClient.signUp.email({
          email: emailVal,
          password: passwordVal,
          name: String(form.get("name")),
        })
      : await authClient.signIn.email({ email: emailVal, password: passwordVal });

    setPending(false);
    if (error) {
      setError(error.message ?? "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGithub() {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  }

  function fillDemo() {
    setEmail("demo@phy10615.vn");
    setPassword("Demo@12345");
  }

  return (
    <main className="mx-auto my-auto flex w-full max-w-md flex-col justify-center p-6">
      <div className="grid gap-5 rounded-2xl border p-6 shadow-sm">
        <div className="grid gap-1 text-center">
          <div className="mx-auto mb-1 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
              <path d="M15 9h4v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isRegister ? "Tạo tài khoản mới" : "Đăng nhập Finance Planner"}
          </h1>
          <p className="text-xs opacity-75">
            {isRegister
              ? "Quản lý thu chi và theo dõi mục tiêu tiết kiệm cá nhân"
              : "Đăng nhập để xem bảng điều khiển tài chính của bạn"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3.5">
          {isRegister && (
            <label className="grid gap-1 text-sm font-medium">
              Họ và tên
              <input
                name="name"
                required
                placeholder="Nguyễn Ngọc Tuấn"
                className="w-full"
              />
            </label>
          )}
          <label className="grid gap-1 text-sm font-medium">
            Địa chỉ Email
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@phy10615.vn"
              autoComplete="email"
              className="w-full"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Mật khẩu
            <input
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="w-full"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-primary mt-1 w-full py-2.5 disabled:opacity-50"
          >
            {pending
              ? "Đang xử lý..."
              : isRegister
                ? "Tạo tài khoản"
                : "Đăng nhập"}
          </button>
        </form>

        {!isRegister && (
          <div className="flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-xs">
            <span>
              Tài khoản mẫu: <strong>demo@phy10615.vn</strong>
            </span>
            <button
              type="button"
              onClick={fillDemo}
              className="px-2.5 py-1 text-xs font-semibold"
            >
              Điền nhanh Demo
            </button>
          </div>
        )}

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t opacity-40" />
          <span className="px-3 text-xs opacity-60">HOẶC</span>
          <div className="w-full border-t opacity-40" />
        </div>

        <button
          type="button"
          onClick={handleGithub}
          className="inline-flex w-full items-center justify-center gap-2 py-2.5 font-semibold"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Tiếp tục với GitHub</span>
        </button>

        <p className="text-center text-sm">
          {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-semibold text-emerald-600 underline dark:text-emerald-400"
          >
            {isRegister ? "Đăng nhập ngay" : "Đăng ký tài khoản"}
          </Link>
        </p>
      </div>
    </main>
  );
}