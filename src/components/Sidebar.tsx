"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { bottomNavItems, navGroups } from "@/lib/nav";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col bg-white transition-[width] duration-200 ease-out",
        collapsed ? "w-[76px]" : "w-[248px]"
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Stethoscope size={18} strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              Zendenta
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600",
            collapsed && "absolute -right-3 top-8 border border-slate-100 bg-white shadow-sm"
          )}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Clinic card */}
      <div className="px-3 pb-4">
        <button
          title="Avicena Clinic - switch clinic"
          aria-label="Switch clinic"
          className={cn(
            "flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-2.5 py-2.5 text-left hover:bg-slate-100",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <span className="text-xs font-bold">AC</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-slate-800">
                Avicena Clinic
              </p>
              <p className="truncate text-[11px] text-slate-400">
                645 Euclid Avenue, CA
              </p>
            </div>
          )}
          {!collapsed && (
            <ChevronsUpDown size={13} className="shrink-0 text-slate-300" />
          )}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Primary">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                        collapsed && "justify-center",
                        active
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      )}
                    >
                      <item.icon
                        size={17}
                        strokeWidth={2}
                        className={active ? "text-indigo-600" : "text-slate-400"}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="border-t border-slate-100 px-3 py-4">
        <ul className="space-y-0.5">
          {bottomNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium",
                    collapsed && "justify-center",
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  )}
                >
                  <item.icon
                    size={17}
                    strokeWidth={2}
                    className={active ? "text-indigo-600" : "text-slate-400"}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
