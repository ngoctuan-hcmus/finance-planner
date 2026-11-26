import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getDateRange, toDateInput } from "@/lib/finance";
import { transactionFilterSchema } from "@/lib/validation";
import { requireUser } from "@/lib/dal";
import { TransactionForm } from "./transaction-form";
import { TransactionFilters } from "./transactions-filters";
import { TransactionItem } from "./transaction-item";

// Kiểu của searchParams do Next tự sinh (là Promise chứa tham số trên URL)
type SearchParams = PageProps<"/transactions">["searchParams"];

// 1. Component cha: vẽ khung tĩnh + Form thêm mới + Suspense
export default function TransactionsPage({
  searchParams,
}: PageProps<"/transactions">) {
  return (
    <main className="mx-auto grid w-full max-w-2xl gap-6 p-8">
      <h1 className="text-2xl font-bold">Quản lý giao dịch</h1>
      <section className="grid gap-2">
        <h2 className="font-semibold">Thêm giao dịch mới</h2>
        <TransactionForm />
      </section>
      <Suspense fallback={<p>Đang tải giao dịch...</p>}>
        <TransactionList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// 2. Component con: nằm TRONG Suspense nên được phép đọc URL và gọi DB
async function TransactionList({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser(); // chưa đăng nhập -> /login

  // URL sai (?type=abc) -> tự quay về bộ lọc mặc định
  const filter = transactionFilterSchema
    .catch({ range: "this-month" })
    .parse(await searchParams);

  const rows = await prisma.transaction.findMany({
    where: {
      userId: user.id, // CHỈ lấy giao dịch của chính user này
      date: getDateRange(filter.range),
      type: filter.type,
      category: filter.category,
    },
    orderBy: { date: "desc" },
  });

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Danh sách ({rows.length} giao dịch)</h2>
        <TransactionFilters {...filter} />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm opacity-70">Không có giao dịch nào khớp bộ lọc.</p>
      ) : (
        <ul className="grid gap-2">
          {rows.map((t) => (
            <TransactionItem
              key={t.id}
              item={{
                id: t.id,
                type: t.type,
                amount: t.amount,
                description: t.description,
                category: t.category,
                date: toDateInput(t.date),
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}