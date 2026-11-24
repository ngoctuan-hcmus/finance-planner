import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { formatVND } from '@/lib/finance';

async function DashboardData() {
  const [thu, chi, theo] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'INCOME' },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'EXPENSE' },
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: { type: 'EXPENSE' },
      orderBy: { _sum: { amount: 'desc' } },
    }),
  ]);

  const soDu = (thu._sum.amount ?? 0) - (chi._sum.amount ?? 0);

  return (
    <>
      <p>Tổng thu: {formatVND(thu._sum.amount ?? 0)}</p>
      <p>Tổng chi: {formatVND(chi._sum.amount ?? 0)}</p>
      <p className="font-bold">Số dư: {formatVND(soDu)}</p>
      <ul className="mt-4">
        {theo.map((d) => (
          <li key={d.category}>
            {d.category}: {formatVND(d._sum.amount ?? 0)}
          </li>
        ))}
      </ul>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Suspense fallback={<p>Đang tải số liệu...</p>}>
        <DashboardData />
      </Suspense>
    </main>
  );
}