import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { formatVND } from "@/lib/finance";
import { MilestoneNotifier } from "@/components/milestone-notifier";
import { WishlistForm } from "./wishlist-form";
import { WishlistItemCard } from "./wishlist-item";

export default function WishlistPage() {
  return (
    <main className="mx-auto grid w-full max-w-2xl gap-6 p-8">
      <h1 className="text-2xl font-bold">Danh sách mong muốn (Wishlist)</h1>
      <section className="grid gap-2">
        <h2 className="font-semibold">Thêm mục tiêu mới</h2>
        <WishlistForm />
      </section>
      <Suspense fallback={<p>Đang tải danh sách mong muốn...</p>}>
        <WishlistList />
      </Suspense>
    </main>
  );
}

async function WishlistList() {
  const user = await requireUser();
  const [thu, chi, items] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "INCOME" },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "EXPENSE" },
    }),
    prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const balance = (thu._sum.amount ?? 0) - (chi._sum.amount ?? 0);
  const trigger = `${balance}-${items.map((i) => `${i.id}:${i.cost}`).join(",")}`;

  return (
    <section className="grid gap-4">
      <MilestoneNotifier trigger={trigger} />
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Mục tiêu của bạn ({items.length})</h2>
        <span className="text-sm">
          Số dư hiện tại: <strong>{formatVND(balance)}</strong>
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm opacity-70">Chưa có món đồ nào trong Wishlist.</p>
      ) : (
        <ul className="grid gap-3">
          {items.map((w) => (
            <WishlistItemCard
              key={w.id}
              item={{
                id: w.id,
                name: w.name,
                cost: w.cost,
                priority: w.priority,
              }}
              balance={balance}
            />
          ))}
        </ul>
      )}
    </section>
  );
}