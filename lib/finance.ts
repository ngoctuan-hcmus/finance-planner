import type { Category, Priority, TransactionType } from "@/generated/prisma/enums";
import type { Filters } from "@/lib/validation";

const vnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function formatVND(amount: number) {
  return vnd.format(amount);
}

// Nhãn tiếng Việt cho 8 danh mục, 2 loại giao dịch và 3 mức ưu tiên
export const CATEGORY_LABELS: Record<Category, string> = {
  FOOD: "Ăn uống",
  TRANSPORT: "Di chuyển",
  ENTERTAINMENT: "Giải trí",
  SHOPPING: "Mua sắm",
  BILLS: "Hoá đơn",
  SALARY: "Lương",
  INVESTMENT: "Đầu tư",
  OTHER: "Khác",
};

export const TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "Thu nhập",
  EXPENSE: "Chi tiêu",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
};

// Chuyển Date sang chuỗi YYYY-MM-DD cho ô <input type="date" />
export function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getDateRange(
  range: Filters["range"],
  now = new Date(),
) {
  if (range === "all") return undefined;
  const back = range === "last-month" ? 1 : 0;
  const y = now.getFullYear();
  const m = now.getMonth() - back; // 0 - 1 → tháng 12
  return {
    gte: new Date(y, m, 1), // ngày 1 của tháng
    lt: new Date(y, m + 1, 1), // ngày 1 tháng sau
  };
}

// Hàm thuần: không đọc DB, không gọi mạng
export function wishlistProgress(
  balance: number,
  cost: number,
): number {
  if (cost <= 0) return 100;
  const percent = Math.floor((balance / cost) * 100);
  return Math.min(100, Math.max(0, percent));
}

export const MILESTONES = [50, 75, 100] as const;

export function crossedMilestones(
  prev: number,
  next: number,
): number[] {
  return MILESTONES.filter((m) => prev < m && next >= m);
}

// Tính xu hướng chi tiêu tháng này so với tháng trước (hàm thuần)
export function compareMonths(prevExpense: number, currExpense: number) {
  if (prevExpense <= 0) {
    return {
      diffPercent: currExpense > 0 ? 100 : 0,
      trend: currExpense > 0 ? ("up" as const) : ("same" as const),
      summary:
        currExpense > 0
          ? "Tháng trước chưa có chi tiêu để so sánh."
          : "Hai tháng đều chưa có chi tiêu.",
    };
  }
  const diffPercent = Math.round(
    ((currExpense - prevExpense) / prevExpense) * 100,
  );
  if (diffPercent > 0) {
    return {
      diffPercent,
      trend: "up" as const,
      summary: `Chi tiêu tháng này tăng ${diffPercent}% so với tháng trước.`,
    };
  }
  if (diffPercent < 0) {
    return {
      diffPercent,
      trend: "down" as const,
      summary: `Chi tiêu tháng này giảm ${Math.abs(diffPercent)}% so với tháng trước.`,
    };
  }
  return {
    diffPercent: 0,
    trend: "same" as const,
    summary: "Chi tiêu tháng này bằng với tháng trước.",
  };
}