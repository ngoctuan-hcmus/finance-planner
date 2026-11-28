"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserProfileBadge({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const initials = getInitials(name);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Xem thông tin tài khoản"
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
          {initials}
        </span>
        <span>{name}</span>
        <svg
          className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Thông tin cá nhân"
          className="absolute right-0 z-50 mt-2 w-72 rounded-xl border p-4 shadow-lg"
        >
          <div className="flex items-center gap-3 border-b pb-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{name}</p>
              <p className="truncate text-xs opacity-75">{email}</p>
            </div>
          </div>

          <dl className="mt-3 grid gap-2 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="opacity-70">Tên tài khoản:</dt>
              <dd className="font-semibold text-right">{name}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="opacity-70">Email:</dt>
              <dd className="font-semibold text-right break-all">{email}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="opacity-70">Đơn vị:</dt>
              <dd className="font-semibold text-right">University of Science - VNUHCM</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="opacity-70">Trạng thái:</dt>
              <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
                ● Đang đăng nhập
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

export function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn-logout inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>Đăng xuất</span>
    </button>
  );
}