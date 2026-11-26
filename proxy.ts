import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Chạy TRƯỚC khi trang được render: chưa có cookie đăng nhập -> về /login.
// Đây chỉ là lớp chặn nhanh (chỉ xem cookie có tồn tại hay không);
// kiểm tra thật sự vẫn là requireUser() trong từng trang/action.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/wishlist/:path*"],
};