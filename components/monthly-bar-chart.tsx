"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compareMonths, formatVND } from "@/lib/finance";

export type MonthSummary = {
  label: string;
  income: number;
  expense: number;
};

export function MonthlyBarChart({
  lastMonth,
  thisMonth,
}: {
  lastMonth: MonthSummary;
  thisMonth: MonthSummary;
}) {
  const data = [lastMonth, thisMonth];
  const comparison = compareMonths(lastMonth.expense, thisMonth.expense);

  return (
    <div className="grid gap-4">
      <p
        className={`text-sm font-medium ${
          comparison.trend === "down"
            ? "text-green-600"
            : comparison.trend === "up"
              ? "text-red-600"
              : ""
        }`}
      >
        Xu hướng: {comparison.summary}
      </p>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}tr`} />
            <Tooltip formatter={(val) => formatVND(Number(val))} />
            <Legend />
            <Bar dataKey="income" name="Thu nhập" fill="#16a34a" />
            <Bar dataKey="expense" name="Chi tiêu" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng thay thế cho trình đọc màn hình */}
      <table className="sr-only">
        <caption>Bảng so sánh thu chi tháng trước và tháng này</caption>
        <thead>
          <tr>
            <th scope="col">Tháng</th>
            <th scope="col">Thu nhập</th>
            <th scope="col">Chi tiêu</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={m.label}>
              <td>{m.label}</td>
              <td>{formatVND(m.income)}</td>
              <td>{formatVND(m.expense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}