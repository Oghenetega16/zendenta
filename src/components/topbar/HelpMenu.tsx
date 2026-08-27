"use client";

import Link from "next/link";
import { HelpCircle, Keyboard, LifeBuoy, Mail } from "lucide-react";
import { usePopover } from "@/hooks/usePopover";

const shortcuts = [
  { keys: "Ctrl / Cmd + K", action: "Focus search" },
  { keys: "Esc", action: "Close dialogs and menus" },
  { keys: "\u2191 / \u2193", action: "Navigate search results" },
];

export function HelpMenu() {
  const { open, setOpen, ref, toggle } = usePopover<HTMLDivElement>();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        title="Help"
        aria-label="Help"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-600"
      >
        <HelpCircle size={17} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg"
        >
          <Link
            href="/support"
            role="menuitem"
            onClick={() => setOpen(false)}
            title="Go to Customer Support"
            className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50"
          >
            <LifeBuoy size={15} className="text-slate-400" />
            <span className="text-[12.5px] font-medium text-slate-700">Contact support</span>
          </Link>

          <a
            href="mailto:support@zendenta.app"
            role="menuitem"
            title="Email support@zendenta.app"
            className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50"
          >
            <Mail size={15} className="text-slate-400" />
            <span className="text-[12.5px] font-medium text-slate-700">Email us</span>
          </a>

          <div className="mt-1 border-t border-slate-50 px-3.5 pt-2 pb-1.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wide text-slate-400 uppercase">
              <Keyboard size={11} />
              Keyboard shortcuts
            </p>
            <ul className="space-y-1">
              {shortcuts.map((s) => (
                <li key={s.action} className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-500">{s.action}</span>
                  <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                    {s.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
