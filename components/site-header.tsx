import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { SignOutButton } from "@/components/sign-out-button";

// Server Component: đọc session để biết đã đăng nhập hay chưa
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex items-center gap-4 border-b p-4">
      <Link href="/" className="font-bold">
        Finance Planner
      </Link>
      {user ? (
        <>
          <nav className="flex gap-4">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/transactions">Giao dịch</Link>
          </nav>
          <span className="ml-auto text-sm">{user.name}</span>
          <SignOutButton />
        </>
      ) : (
        <nav className="ml-auto flex gap-4">
          <Link href="/login">Đăng nhập</Link>
          <Link href="/register">Đăng ký</Link>
        </nav>
      )}
    </header>
  );
}