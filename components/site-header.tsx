import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-provider";

// Server Component: đọc session để biết đã đăng nhập hay chưa
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex flex-wrap items-center gap-4 border-b p-4">
      <Link href="/" className="font-bold">
        Finance Planner
      </Link>
      {user ? (
        <>
          <nav className="flex gap-4">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/transactions">Giao dịch</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm">{user.name}</span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </>
      ) : (
        <nav className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">Đăng nhập</Link>
          <Link href="/register">Đăng ký</Link>
        </nav>
      )}
    </header>
  );
}