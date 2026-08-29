"use client";

import Link from "next/link";
import { CalendarPlus, Plus, ReceiptText, UserPlus } from "lucide-react";
import { usePopover } from "@/hooks/usePopover";

const actions = [
  {
    label: "New reservation",
    description: "Book a new patient visit",
    href: "/reservations",
    icon: CalendarPlus,
  },
  {
    label: "New bill",
    description: "Start a bill in Sales",
    href: "/sales",
    icon: ReceiptText,
  },
  {
    label: "New patient",
    description: "View the patient list",
    href: "/patients",
    icon: UserPlus,
  },
];

export function CreateMenu() {
  const { open, setOpen, ref, toggle } = usePopover<HTMLDivElement>();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        title="Create new"
        aria-label="Create new"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
      >
        <Plus size={17} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-72 max-w-[90vw] overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg"
        >
          <p className="px-3.5 pt-1.5 pb-1 text-[10.5px] font-semibold tracking-wide text-slate-400 uppercase">
            Quick create
          </p>
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              role="menuitem"
              title={action.label}
              onClick={() => setOpen(false)}
              className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <action.icon size={15} />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-slate-700">{action.label}</p>
                <p className="text-[11px] text-slate-400">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
