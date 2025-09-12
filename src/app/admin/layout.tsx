"use client";

import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <div className="min-h-screen flex bg-gradient-to-br from-[#fdfeff] via-[#fafdff] to-[#f9ffff]">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
