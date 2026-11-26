import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Mọi request tới /api/auth/... (đăng nhập, đăng ký, đăng xuất, callback GitHub)
// đều do Better Auth xử lý
export const { GET, POST } = toNextJsHandler(auth);