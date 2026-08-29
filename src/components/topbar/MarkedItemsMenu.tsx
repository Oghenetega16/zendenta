"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Flag, X } from "lucide-react";
import { usePopover } from "@/hooks/usePopover";
import { useMarkedReservations } from "@/hooks/useMarkedReservations";
import { fetchReservations } from "@/lib/api-client";
import { Reservation } from "@/types";

interface MarkedItemsMenuProps {
  kind: "bookmark" | "flag";
  storageKey: string;
}

const kindMeta = {
  bookmark: { Icon: Bookmark, emptyText: "No bookmarks yet. Star a reservation in Reservations to add one." },
  flag: { Icon: Flag, emptyText: "No flagged reservations. Flag one in Reservations to follow up later." },
};

export function MarkedItemsMenu({ kind, storageKey }: MarkedItemsMenuProps) {
  const { open, setOpen, ref, toggle } = usePopover<HTMLDivElement>();
  const router = useRouter();
  const { ids, remove } = useMarkedReservations(storageKey);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const { Icon, emptyText } = kindMeta[kind];

  // Only fetch reservation details when the menu is opened, and only once
  // there's something to show for.
  useEffect(() => {
    if (!open || ids.length === 0) return;
    let ignore = false;
    fetchReservations().then((res) => {
      if (!ignore) setAllReservations(res);
    });
    return () => {
      ignore = true;
    };
  }, [open, ids.length]);

  const marked = ids
    .map((id) => allReservations.find((r) => r.id === id))
    .filter((r): r is Reservation => Boolean(r));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        title={kind === "bookmark" ? "Bookmarks" : "Flagged items"}
        aria-label={kind === "bookmark" ? "Bookmarks" : "Flagged items"}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-600"
      >
        <Icon size={17} />
        {ids.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[8.5px] font-bold text-white">
            {ids.length > 9 ? "9+" : ids.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg"
        >
          <p className="border-b border-slate-50 px-3.5 py-2.5 text-[10.5px] font-semibold tracking-wide text-slate-400 uppercase">
            {kind === "bookmark" ? "Bookmarked reservations" : "Flagged reservations"}
          </p>

          {ids.length === 0 ? (
            <p className="px-3.5 py-4 text-[12px] text-slate-400">{emptyText}</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {ids.map((id) => {
                const reservation = marked.find((r) => r.id === id);
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between gap-2 px-3.5 py-2.5 hover:bg-slate-50"
                  >
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push("/sales");
                      }}
                      title={`Open ${id} in Sales`}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                    >
                      {reservation ? (
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-slate-700 ${reservation.avatarColor}`}
                        >
                          {reservation.patientInitials}
                        </div>
                      ) : (
                        <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-slate-100" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-slate-700">
                          {reservation?.patientName ?? "Loading..."}
                        </p>
                        <p className="text-[11px] text-slate-400">{id}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => remove(id)}
                      title={`Remove ${id}`}
                      aria-label={`Remove ${id}`}
                      className="cursor-pointer text-slate-300 hover:text-slate-500"
                    >
                      <X size={13} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
