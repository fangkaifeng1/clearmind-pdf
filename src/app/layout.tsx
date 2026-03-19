import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearMind PDF - PDF to Structured Notes",
  description: "专为 Obsidian/Notion 深度用户设计的论文/书籍转结构化笔记工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
