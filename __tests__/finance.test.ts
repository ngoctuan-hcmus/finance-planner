import { describe, expect, test } from "vitest";
import {
  compareMonths,
  crossedMilestones,
  formatVND,
  getDateRange,
  wishlistProgress,
} from "@/lib/finance";
import {
  parseTransactionsCsv,
  transactionFilterSchema,
  transactionSchema,
  wishlistSchema,
} from "@/lib/validation";

describe("wishlistProgress", () => {
  test("tính % và làm tròn xuống", () => {
    expect(wishlistProgress(2_999_999, 4_000_000)).toBe(74);
  });

  test("luôn nằm trong 0..100", () => {
    expect(wishlistProgress(-500_000, 1_000_000)).toBe(0);
    expect(wishlistProgress(9_000_000, 1_000_000)).toBe(100);
    expect(wishlistProgress(500_000, 0)).toBe(100);
  });
});

describe("crossedMilestones", () => {
  test("trả về các mốc 50, 75, 100 mới vượt qua", () => {
    expect(crossedMilestones(0, 60)).toEqual([50]);
    expect(crossedMilestones(50, 100)).toEqual([75, 100]);
    expect(crossedMilestones(0, 100)).toEqual([50, 75, 100]);
  });

  test("không báo lặp lại mốc đã đạt hoặc khi tiến độ giảm", () => {
    expect(crossedMilestones(75, 75)).toEqual([]);
    expect(crossedMilestones(75, 60)).toEqual([]);
    expect(crossedMilestones(0, 49)).toEqual([]);
  });
});

describe("getDateRange & formatVND", () => {
  test("getDateRange trả về undefined khi chọn all", () => {
    expect(getDateRange("all")).toBeUndefined();
  });

  test("getDateRange tính đúng biên tháng hiện tại và tháng trước (kể cả tháng 1)", () => {
    const jan = new Date(2026, 0, 15); // 15/01/2026
    const thisMonth = getDateRange("this-month", jan);
    expect(thisMonth?.gte).toEqual(new Date(2026, 0, 1));
    expect(thisMonth?.lt).toEqual(new Date(2026, 1, 1));

    const lastMonth = getDateRange("last-month", jan);
    expect(lastMonth?.gte).toEqual(new Date(2025, 11, 1));
    expect(lastMonth?.lt).toEqual(new Date(2026, 0, 1));
  });

  test("formatVND định dạng tiền tệ Việt Nam", () => {
    expect(formatVND(1500000)).toContain("1.500.000");
  });
});

describe("compareMonths", () => {
  test("nhận diện đúng xu hướng tăng, giảm và giữ nguyên", () => {
    expect(compareMonths(1_000_000, 1_250_000)).toMatchObject({
      diffPercent: 25,
      trend: "up",
    });
    expect(compareMonths(2_000_000, 1_500_000)).toMatchObject({
      diffPercent: -25,
      trend: "down",
    });
    expect(compareMonths(1_000_000, 1_000_000)).toMatchObject({
      diffPercent: 0,
      trend: "same",
    });
  });
});

describe("Zod validation schemas & CSV parser", () => {
  test("transactionSchema chấp nhận dữ liệu hợp lệ và ép kiểu amount", () => {
    const res = transactionSchema.safeParse({
      type: "EXPENSE",
      amount: "55000",
      description: "Bánh mì và cà phê",
      category: "FOOD",
      date: "2026-11-25",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.amount).toBe(55000);
    }
  });

  test("transactionSchema từ chối số tiền âm, mô tả rỗng hoặc ngày sai", () => {
    const res = transactionSchema.safeParse({
      type: "EXPENSE",
      amount: "-100",
      description: "   ",
      category: "FOOD",
      date: "25/11/2026",
    });
    expect(res.success).toBe(false);
  });

  test("wishlistSchema và transactionFilterSchema hoạt động đúng", () => {
    expect(
      wishlistSchema.safeParse({
        name: "Tai nghe",
        cost: "2000000",
        priority: "HIGH",
      }).success,
    ).toBe(true);
    expect(
      wishlistSchema.safeParse({
        name: "",
        cost: "0",
        priority: "HIGH",
      }).success,
    ).toBe(false);
    expect(transactionFilterSchema.parse({})).toEqual({ range: "this-month" });
  });

  test("parseTransactionsCsv đọc đúng CSV hợp lệ và chặn CSV sai định dạng", () => {
    const validCsv = [
      "date,type,category,amount,description",
      '2026-11-25,EXPENSE,FOOD,65000,"Phở bò"',
    ].join("\n");
    const okRes = parseTransactionsCsv(validCsv);
    expect(okRes.ok).toBe(true);
    if (okRes.ok) {
      expect(okRes.rows).toHaveLength(1);
      expect(okRes.rows[0].amount).toBe(65000);
    }

    const badCsv = "wrong,header\n1,2";
    expect(parseTransactionsCsv(badCsv).ok).toBe(false);
  });
});