import { redirect } from "next/navigation";

// Trang chủ: chuyển thẳng tới Dashboard
// (chưa đăng nhập thì Dashboard sẽ tự chuyển tiếp sang /login)
export default function Home() {
  redirect("/dashboard");
}