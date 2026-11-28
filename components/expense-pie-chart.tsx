"use client";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Category } from "@/generated/prisma/enums";
import { CATEGORY_LABELS, formatVND } from "@/lib/finance";

export type CategoryExpense = {
  category: Category;
  amount: number;
};

const COLORS = [
  "#059669",
  "#2563eb",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#4f46e5",
  "#65a30d",
  "#64748b",
];

export function ExpensePieChart({ data }: { data: CategoryExpense[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm opacity-70">
        Tháng này chưa có khoản chi tiêu nào.
      </p>
    );
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const chartData = data.map((d) => ({
    name: CATEGORY_LABELS[d.category],
    value: d.amount,
    percent: total > 0 ? Math.round((d.amount / total) * 100) : 0,
  }));

  return (
    <div className="grid gap-4">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              isAnimationActive={false}
              label={({ name, percent }) => `${name} (${percent}%)`}
            >
              {chartData.map((entry, idx) => (
                <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => formatVND(Number(val))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng số liệu thay thế dành cho trình đọc màn hình (Screen Reader) */}
      <table className="sr-only">
        <caption>Bảng chi tiêu theo danh mục trong tháng hiện tại</caption>
        <thead>
          <tr>
            <th scope="col">Danh mục</th>
            <th scope="col">Số tiền</th>
            <th scope="col">Tỉ lệ</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{formatVND(row.value)}</td>
              <td>{row.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}