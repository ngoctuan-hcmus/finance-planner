import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import {
  CATEGORY_LABELS,
  formatVND,
  getDateRange,
  PRIORITY_LABELS,
  wishlistProgress,
} from "@/lib/finance";
import { ExpensePieChart } from "@/components/expense-pie-chart";
import { MilestoneNotifier } from "@/components/milestone-notifier";

async function DashboardData() {
  const user = await requireUser(); // chưa đăng nhập -> /login

  const [thu, chi, theoThangNay, wishlist] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "INCOME" },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "EXPENSE" },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: getDateRange("this-month"),
      },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const tongThu = thu._sum.amount ?? 0;
  const tongChi = chi._sum.amount ?? 0;
  const soDu = tongThu - tongChi;

  const pieData = theoThangNay.map((d) => ({
    category: d.category,
    amount: d._sum.amount ?? 0,
  }));

  const trigger = `${soDu}-${wishlist.map((w) => `${w.id}:${w.cost}`).join(",")}`;

  return (
    <div className="grid gap-8">
      <MilestoneNotifier trigger={trigger} />

      {/* 3 thẻ tổng quan, Số dư hiển thị nổi bật */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-sm opacity-70">Tổng thu</p>
          <p className="text-xl font-semibold text-green-600">
            {formatVND(tongThu)}
          </p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm opacity-70">Tổng chi</p>
          <p className="text-xl font-semibold text-red-600">
            {formatVND(tongChi)}
          </p>
        </div>
        <div className="rounded border-2 border-black p-4 dark:border-white">
          <p className="text-sm opacity-70">Số dư hiện tại</p>
          <p className="text-2xl font-bold">{formatVND(soDu)}</p>
        </div>
      </section>

      {/* Biểu đồ tròn chi tiêu tháng này + danh sách tóm tắt */}
      <section className="grid gap-4 rounded border p-4">
        <h2 className="text-lg font-semibold">
          Cơ cấu chi tiêu tháng hiện tại
        </h2>
        <ExpensePieChart data={pieData} />
        <ul className="grid gap-1 text-sm">
          {pieData.map((d) => (
            <li key={d.category} className="flex justify-between">
              <span>{CATEGORY_LABELS[d.category]}</span>
              <span className="font-medium">{formatVND(d.amount)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Tiến độ các món Wishlist */}
      <section className="grid gap-4 rounded border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tiến độ mục tiêu (Wishlist)</h2>
          <Link href="/wishlist" className="text-sm underline">
            Quản lý Wishlist →
          </Link>
        </div>
        {wishlist.length === 0 ? (
          <p className="text-sm opacity-70">Chưa có mục tiêu nào.</p>
        ) : (
          <ul className="grid gap-3">
            {wishlist.map((w) => {
              const p = wishlistProgress(soDu, w.cost);
              return (
                <li key={w.id} className="grid gap-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      <strong>{w.name}</strong> ({PRIORITY_LABELS[w.priority]})
                    </span>
                    <span>
                      {formatVND(w.cost)} · <strong>{p}%</strong>
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-green-600"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 p-8">
      <h1 className="text-2xl font-bold">Bảng điều khiển (Dashboard)</h1>
      <Suspense fallback={<p>Đang tải số liệu...</p>}>
        <DashboardData />
      </Suspense>
    </main>
  );
}