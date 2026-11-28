import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import {
  CATEGORY_LABELS,
  crossedMilestones,
  formatVND,
  getDateRange,
  PRIORITY_LABELS,
  wishlistProgress,
} from "@/lib/finance";
import { ExpensePieChart } from "@/components/expense-pie-chart";
import { MonthlyBarChart } from "@/components/monthly-bar-chart";
import { MilestoneNotifier } from "@/components/milestone-notifier";

async function DashboardData() {
  const user = await requireUser(); // chưa đăng nhập -> /login

  const thisMonthRange = getDateRange("this-month");
  const lastMonthRange = getDateRange("last-month");

  // Gộp 8 câu truy vấn thành 4 câu groupBy chạy song song để tăng tốc tải trang
  const [allByType, lastMonthByType, thisMonthByCatType, wishlist] =
    await Promise.all([
      prisma.transaction.groupBy({
        by: ["type"],
        _sum: { amount: true },
        where: { userId: user.id },
      }),
      prisma.transaction.groupBy({
        by: ["type"],
        _sum: { amount: true },
        where: { userId: user.id, date: lastMonthRange },
      }),
      prisma.transaction.groupBy({
        by: ["type", "category"],
        _sum: { amount: true },
        where: { userId: user.id, date: thisMonthRange },
      }),
      prisma.wishlistItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const tongThu =
    allByType.find((r) => r.type === "INCOME")?._sum.amount ?? 0;
  const tongChi =
    allByType.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0;
  const soDu = tongThu - tongChi;

  const thuThangTruoc =
    lastMonthByType.find((r) => r.type === "INCOME")?._sum.amount ?? 0;
  const chiThangTruoc =
    lastMonthByType.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0;

  let thuThangNay = 0;
  let chiThangNay = 0;
  const pieData: {
    category: (typeof thisMonthByCatType)[number]["category"];
    amount: number;
  }[] = [];

  for (const r of thisMonthByCatType) {
    const amt = r._sum.amount ?? 0;
    if (r.type === "INCOME") {
      thuThangNay += amt;
    } else {
      chiThangNay += amt;
      pieData.push({ category: r.category, amount: amt });
    }
  }
  pieData.sort((a, b) => b.amount - a.amount);

  // Chỉ gọi Server Action thông báo mốc khi thực sự có món đồ vừa vượt mốc mới
  const hasNewMilestone = wishlist.some(
    (w) =>
      !w.purchased &&
      crossedMilestones(w.notifiedMilestone, wishlistProgress(soDu, w.cost))
        .length > 0,
  );
  const trigger = `${soDu}-${wishlist.map((w) => `${w.id}:${w.cost}`).join(",")}`;

  return (
    <div className="grid gap-8">
      {hasNewMilestone && <MilestoneNotifier trigger={trigger} />}

      {/* 3 thẻ tổng quan, Số dư hiển thị nổi bật */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm opacity-70">Tổng thu</p>
          <p className="text-xl font-semibold text-green-600">
            {formatVND(tongThu)}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm opacity-70">Tổng chi</p>
          <p className="text-xl font-semibold text-red-600">
            {formatVND(tongChi)}
          </p>
        </div>
        <div className="rounded-xl border-2 border-black p-4 dark:border-white">
          <p className="text-sm opacity-70">Số dư hiện tại</p>
          <p className="text-2xl font-bold">{formatVND(soDu)}</p>
        </div>
      </section>

      {/* Biểu đồ tròn chi tiêu tháng này + danh sách tóm tắt */}
      <section className="grid gap-4 rounded-xl border p-4">
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

      {/* Báo cáo so sánh các tháng (Biểu đồ cột + Xu hướng chi tiêu) */}
      <section className="grid gap-4 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">
          Báo cáo so sánh thu chi các tháng
        </h2>
        <MonthlyBarChart
          lastMonth={{
            label: "Tháng trước",
            income: thuThangTruoc,
            expense: chiThangTruoc,
          }}
          thisMonth={{
            label: "Tháng này",
            income: thuThangNay,
            expense: chiThangNay,
          }}
        />
      </section>

      {/* Tiến độ các món Wishlist */}
      <section className="grid gap-4 rounded-xl border p-4">
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