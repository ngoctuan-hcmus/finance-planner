# Finance Planner – Ứng dụng Quản lý Tài chính Cá nhân (PHY10615)

**Finance Planner** là ứng dụng web giúp sinh viên và cá nhân theo dõi thu chi hằng ngày theo 8 danh mục, trực quan hoá cơ cấu chi tiêu bằng biểu đồ và lập kế hoạch tiết kiệm cho các mục tiêu mong muốn (Wishlist). Ứng dụng hỗ trợ xác thực đa phương thức (Email/Mật khẩu & GitHub OAuth), cô lập dữ liệu tuyệt đối theo từng người dùng, tự động chúc mừng khi số dư đạt các mốc tiết kiệm 50% / 75% / 100% và cho phép nhập/xuất dữ liệu giao dịch qua file CSV.

- 🔗 **Link Production (Vercel):** [https://finance-planner-lilac-three.vercel.app](https://finance-planner-lilac-three.vercel.app)
- 👤 **Tài khoản Demo:**
  - **Email:** `demo@phy10615.vn`
  - **Mật khẩu:** `Demo@12345`
- 🤖 **Nhật ký sử dụng AI (Mức 3):** Xem chi tiết tại [AI_LOG.md](./AI_LOG.md)
- 📜 **Quy tắc dự án:** Xem chi tiết tại [AGENTS.md](./AGENTS.md)

---

## Công nghệ & Phiên bản chính

| Thành phần | Công nghệ & Phiên bản |
| :--- | :--- |
| **Framework** | Next.js `16.4.6` (App Router, Turbopack, `cacheComponents: true`, `proxy.ts`), React `19.3.0`, TypeScript `5` |
| **Giao diện (UI)** | Tailwind CSS `4.3.3` (cấu hình `@theme` trong CSS), `next-themes` (Sáng/Tối), `sonner` (Toast), `recharts` (Biểu đồ) |
| **Cơ sở dữ liệu & ORM** | PostgreSQL trên **Neon** + Prisma ORM `7.10.1` (`prisma-client` generator, `@prisma/adapter-pg`, `prisma.config.ts`) |
| **Xác thực (Auth)** | Better Auth `1.7.27` (Email/Password + GitHub OAuth, Prisma Adapter, `nextCookies()`) |
| **Kiểm tra dữ liệu** | Zod `4.6.7` (`z.flattenError()`, Server Actions validation) |
| **Kiểm thử & CI/CD** | Vitest `5.1.0` + React Testing Library (`@testing-library/react`), GitHub Actions CI (Node.js 24), Vercel |

---

## Hướng dẫn cài đặt và chạy Local

1. **Yêu cầu hệ thống:** Cài đặt **Node.js 24** (hoặc Node.js >= 22) và tài khoản PostgreSQL (ví dụ: Neon).
2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm ci
   ```
3. **Thiết lập biến môi trường:**
   Tạo file `.env` ở thư mục gốc từ file mẫu `.env.example` và điền thông tin kết nối thật:
   ```bash
   cp .env.example .env
   ```
   *(Trên Windows PowerShell: `Copy-Item .env.example .env`)*
4. **Chạy Migration để tạo bảng trong Database:**
   ```bash
   npx prisma migrate dev
   ```
5. **Nạp dữ liệu mẫu (30 giao dịch + 3 mục tiêu Wishlist + tài khoản Demo):**
   ```bash
   npx prisma db seed
   ```
6. **Khởi động server phát triển:**
   ```bash
   npm run dev
   ```

---

## Hướng dẫn chạy Kiểm thử (Test & Quality Checks)

```bash
# 1. Kiểm tra quy tắc code (ESLint)
npm run lint

# 2. Kiểm tra kiểu dữ liệu (Next Typegen + TypeScript)
npm run typecheck

# 3. Chạy 12 Unit Tests + 2 Component Tests (Vitest + React Testing Library)
npx vitest run

# 4. Kiểm tra đóng gói bản Production
npm run build
```

---

## Checklist Tính năng

### Tính năng cốt lõi
- [x] ✅ **Xác thực & Hồ sơ:** Đăng ký / đăng nhập bằng Email + Mật khẩu và GitHub OAuth (Better Auth); hiển thị tên người dùng, nút đăng xuất; bảo vệ mọi trang, Server Action và Route Handler bằng `requireUser()` / `getCurrentUser()`.
- [x] ✅ **Giao dịch (CRUD):** Thêm, xem, sửa, xoá giao dịch (Số tiền nguyên dương VND, Mô tả 1–120 ký tự, Loại Thu/Chi, đủ 8 Danh mục tiếng Việt, Ngày). Validate phía server bằng Zod 4, hiển thị lỗi dưới từng ô và thông báo Toast (Sonner).
- [x] ✅ **Lọc giao dịch qua URL (`searchParams`):** Lọc phía server theo Thời gian (`this-month`, `last-month`, `all`), theo Loại (`INCOME`, `EXPENSE`) và theo Danh mục (8 danh mục); chia sẻ được đường dẫn URL.
- [x] ✅ **Route Handler API:** `GET /api/transactions` trả về mã `401` khi chưa đăng nhập và chỉ trả về dữ liệu của chính người dùng đang đăng nhập.
- [x] ✅ **Wishlist (CRUD & Thanh tiến độ):** Thêm, xem, sửa, xoá mục tiêu mua sắm (Tên, Giá dự kiến VND, Mức ưu tiên Thấp / Trung bình / Cao); thanh tiến độ tự động tính `số dư ÷ giá × 100%` giới hạn trong khoảng `0–100%`.
- [x] ✅ **Dashboard & Biểu đồ:** Hiển thị nổi bật Số dư hiện tại (`Tổng thu - Tổng chi`), Biểu đồ tròn (`PieChart`) cơ cấu chi tiêu theo danh mục trong tháng hiện tại **kèm bảng số liệu thay thế `<table className="sr-only">` cho trình đọc màn hình**, và danh sách tiến độ các món Wishlist.
- [x] ✅ **Thông báo mốc tiết kiệm (50%, 75%, 100%):** Tự động hiển thị Toast chúc mừng khi số dư vượt mốc giá trị món đồ trong Wishlist và **không lặp lại** cho mốc đã báo; hàm thuần `crossedMilestones` có đầy đủ Unit Test.

### Tính năng mở rộng
- [x] ✅ **Tính năng mở rộng 1 – Báo cáo so sánh các tháng (Biểu đồ cột & Xu hướng chi tiêu):** Biểu đồ cột (`BarChart`) so sánh Thu nhập và Chi tiêu giữa Tháng trước và Tháng này trên Dashboard, kèm hàm thuần `compareMonths` nhận xét % xu hướng tăng/giảm chi tiêu và bảng `sr-only`.
- [x] ✅ **Tính năng mở rộng 2 – Nhập / Xuất CSV qua Route Handler (`/api/transactions/csv`):** Xuất toàn bộ giao dịch của người dùng ra file `.csv` (kèm BOM UTF-8 hiển thị chuẩn tiếng Việt trên Excel) và nhập giao dịch hàng loạt từ file `.csv` có kiểm tra định dạng từng dòng bằng Zod 4 (`parseTransactionsCsv`).

---

## Quyết định kỹ thuật & Giới hạn đã biết

1. **Lưu mốc thông báo tiết kiệm trong Database (`notifiedMilestone Int @default(0)` trên bảng `WishlistItem`):**
   - *Lý do:* Thay vì lưu trong `localStorage` của trình duyệt (sẽ bị báo lặp lại nếu người dùng đăng nhập trên điện thoại hoặc trình duyệt khác), dự án lưu mốc phần trăm cao nhất đã thông báo (`0`, `50`, `75`, `100`) ngay trên từng dòng `WishlistItem` trong PostgreSQL. Khi hàm thuần `crossedMilestones(item.notifiedMilestone, progress)` phát hiện vượt mốc mới, Server Action `checkAndNotifyMilestones` cập nhật ngay cột `notifiedMilestone` và trả thông điệp về Client để bật Toast.
2. **Bảo mật chống lỗ hổng IDOR bằng `updateMany` / `deleteMany`:**
   - Mọi thao tác Sửa / Xoá giao dịch và Wishlist đều không tin tưởng `id` đơn lẻ từ Client mà luôn truy vấn với điều kiện kép `where: { id, userId: user.id }` (lấy `user.id` từ session phía server) và kiểm tra `count === 0`.
3. **Tương thích `cacheComponents: true` (Partial Prerendering) trên Next.js 16.4:**
   - Các Server Component truy cập dữ liệu động (`headers()`, `searchParams`, Database) đều được tách riêng và bọc trong `<Suspense>` để trang có khung tĩnh phản hồi tức thì.
4. **Giới hạn đã biết:**
   - Các tag tiến độ hằng tuần (`fp1`, `fp2`, `fp3`) chưa được gắn đúng thời điểm ở các tuần trước do mã nguồn được đẩy lên GitHub muộn vào tuần cuối; toàn bộ yêu cầu của cả 4 mốc cùng 2 tính năng mở rộng và bộ kiểm thử tự động đã được hoàn thiện đầy đủ trong bản phát hành `v1.0`.