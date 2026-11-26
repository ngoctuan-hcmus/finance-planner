import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatVND, getDateRange } from "@/lib/finance";
import { transactionFilterSchema } from "@/lib/validation";
import { requireUser } from "@/lib/dal";

// Kiểu của searchParams do Next tự sinh (là Promise chứa tham số trên URL)
type SearchParams = PageProps<"/transactions">["searchParams"];

// 1. Component cha: chỉ vẽ khung tĩnh + Suspense
export default function TransactionsPage({
  searchParams,
}: PageProps<"/transactions">) {
  return (
    <main className="grid max-w-md gap-4 p-8">
      <h1 className="text-2xl font-bold">Giao dịch</h1>
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
    <>
      <p>{rows.length} giao dịch</p>
      <ul>
        {rows.map((t) => (
          <li key={t.id}>
            {t.description}: {formatVND(t.amount)}
          </li>
        ))}
      </ul>
    </>
  );
}