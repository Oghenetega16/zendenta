"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { usePopover } from "@/hooks/usePopover";

export function ProfileMenu() {
  const { open, setOpen, ref, toggle } = usePopover<HTMLDivElement>();
  const router = useRouter();

  return (
    <div ref={ref} className="relative ml-1 border-l border-slate-100 pl-3">
      <button
        onClick={toggle}
        title="Account menu"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2.5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-amber-900 text-xs font-semibold text-white">
          OS
        </div>
        <div className="hidden text-left leading-tight md:block">
          <p className="text-[13px] font-semibold text-slate-800">Oghenetega Sukuru</p>
          <p className="text-[11px] text-slate-400">Super admin</p>
        </div>
        <ChevronDown
          size={14}
          className={`hidden text-slate-300 transition-transform md:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-64 max-w-[90vw] overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg"
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            title="View profile"
            className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50"
          >
            <User size={15} className="text-slate-400" />
            <span className="text-[12.5px] font-medium text-slate-700">View profile</span>
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            title="Account settings"
            className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50"
          >
            <Settings size={15} className="text-slate-400" />
            <span className="text-[12.5px] font-medium text-slate-700">Account settings</span>
          </Link>
          <div className="my-1 border-t border-slate-50" />
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              router.push("/signed-out");
            }}
            title="Sign out"
            className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left hover:bg-rose-50"
          >
            <LogOut size={15} className="text-rose-500" />
            <span className="text-[12.5px] font-medium text-rose-500">Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
