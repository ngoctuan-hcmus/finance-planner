import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-provider";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Server Component: đọc session để biết đã đăng nhập hay chưa
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex flex-wrap items-center gap-4 border-b px-6 py-3.5">
      <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
          <svg
            className="h-4 w-4"
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
        </span>
        <span>Finance Planner</span>
      </Link>
      {user ? (
        <>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link href="/dashboard" className="rounded-lg border px-3 py-1.5">
              Dashboard
            </Link>
            <Link href="/transactions" className="rounded-lg border px-3 py-1.5">
              Giao dịch
            </Link>
            <Link href="/wishlist" className="rounded-lg border px-3 py-1.5">
              Wishlist
            </Link>
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {getInitials(user.name)}
              </span>
              <span>{user.name}</span>
            </div>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </>
      ) : (
        <nav className="ml-auto flex items-center gap-3 text-sm">
          <ThemeToggle />
          <Link href="/login" className="rounded-lg border px-3 py-1.5">
            Đăng nhập
          </Link>
          <Link href="/register" className="btn-primary rounded-lg border px-3 py-1.5">
            Đăng ký
          </Link>
        </nav>
      )}
    </header>
  );
}