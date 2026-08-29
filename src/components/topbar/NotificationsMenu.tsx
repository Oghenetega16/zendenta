"use client";

import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { usePopover } from "@/hooks/usePopover";
import { useNotifications } from "@/hooks/useNotifications";
import { formatCurrency } from "@/lib/utils";

export function NotificationsMenu() {
  const { open, setOpen, ref, toggle } = usePopover<HTMLDivElement>();
  const { notifications, loading, dismiss, dismissAll } = useNotifications();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        title="Notifications"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-600"
      >
        <Bell size={17} />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-96 max-w-[90vw] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-50 px-3.5 py-2.5">
            <p className="text-[10.5px] font-semibold tracking-wide text-slate-400 uppercase">
              Unpaid bills
            </p>
            {notifications.length > 0 && (
              <button
                onClick={dismissAll}
                title="Dismiss all"
                className="cursor-pointer text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Dismiss all
              </button>
            )}
          </div>

          {loading ? (
            <p className="px-3.5 py-4 text-[12px] text-slate-400">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="px-3.5 py-4 text-[12px] text-slate-400">
              You&apos;re all caught up &mdash; no unpaid bills.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start justify-between gap-2 px-3.5 py-2.5 hover:bg-slate-50"
                >
                  <NotificationRouterLink n={n} onNavigate={() => setOpen(false)} />
                  <button
                    onClick={() => dismiss(n.id)}
                    title="Dismiss"
                    aria-label="Dismiss notification"
                    className="mt-0.5 shrink-0 cursor-pointer text-slate-300 hover:text-slate-500"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationRouterLink({
  n,
  onNavigate,
}: {
  n: ReturnType<typeof useNotifications>["notifications"][number];
  onNavigate: () => void;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        onNavigate();
        router.push("/sales");
      }}
      title={`Open ${n.reservationId} in Sales`}
      className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 text-left"
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-slate-700 ${n.avatarColor}`}
      >
        {n.patientInitials}
      </div>
      <div className="min-w-0">
        <p className="text-[12.5px] text-slate-600">
          <span className="font-semibold text-slate-800">{n.patientName}</span> {n.message}
        </p>
        <p className="text-[11px] font-medium text-slate-400">{formatCurrency(n.amount)}</p>
      </div>
    </button>
  );
}
