"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { getPageTitle } from "@/lib/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7fb]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar title={getPageTitle(pathname)} />
        <main className="flex-1 px-8 pb-10">{children}</main>
      </div>
    </div>
  );
}
