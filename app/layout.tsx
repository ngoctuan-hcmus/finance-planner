import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance Planner",
  description: "Quản lý thu chi và mục tiêu tiết kiệm",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Header đọc session (dữ liệu động) nên phải nằm trong Suspense */}
        <Suspense fallback={<header className="border-b p-4">Finance Planner</header>}>
          <SiteHeader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}