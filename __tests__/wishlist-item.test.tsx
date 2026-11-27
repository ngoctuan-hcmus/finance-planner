import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WishlistItemCard } from "@/app/wishlist/wishlist-item";

afterEach(cleanup);

// Giả lập Server Actions để test Component độc lập
vi.mock("@/app/wishlist/actions", () => ({
  createWishlistItem: vi.fn(),
  updateWishlistItem: vi.fn(),
  deleteWishlistItem: vi.fn(),
}));

describe("WishlistItemCard component", () => {
  const sampleItem = {
    id: "w1",
    name: "Tai nghe chống ồn",
    cost: 4_000_000,
    priority: "HIGH" as const,
  };

  test("hiển thị tên, mức ưu tiên tiếng Việt và thanh tiến độ đúng %", () => {
    render(<WishlistItemCard item={sampleItem} balance={3_000_000} />);

    expect(screen.getByText("Tai nghe chống ồn")).toBeDefined();
    expect(screen.getByText(/Ưu tiên: Cao/)).toBeDefined();
    expect(screen.getByText("75%")).toBeDefined();

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.getAttribute("aria-valuenow")).toBe("75");
  });

  test("bấm nút Sửa sẽ mở form chỉnh sửa món đồ", () => {
    render(<WishlistItemCard item={sampleItem} balance={1_000_000} />);

    fireEvent.click(screen.getByText("Sửa"));
    expect(screen.getByDisplayValue("Tai nghe chống ồn")).toBeDefined();
    expect(screen.getByText("Lưu thay đổi")).toBeDefined();
  });
});