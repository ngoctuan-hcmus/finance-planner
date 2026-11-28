"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative inline-flex h-8 w-14 items-center rounded-full px-1 py-0"
      aria-label="Đổi giao diện sáng tối"
      title="Chuyển giao diện Sáng / Tối"
    >
      <span className="theme-knob relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        {/* Biểu tượng Mặt trời (Nền Sáng) */}
        <svg
          className="sun-icon absolute h-4 w-4 text-amber-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        {/* Biểu tượng Mặt trăng (Nền Tối) */}
        <svg
          className="moon-icon absolute h-4 w-4 text-sky-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
      <span className="sr-only">Sáng/Tối</span>
    </button>
  );
}