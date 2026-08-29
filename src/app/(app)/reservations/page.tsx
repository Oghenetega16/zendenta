"use client";

import { useState } from "react";
import { Bookmark, Flag, Search } from "lucide-react";
import { fetchReservations } from "@/lib/api-client";
import { useApiData } from "@/hooks/useApiData";
import { useMarkedReservations } from "@/hooks/useMarkedReservations";
import { PageLoader, ErrorState } from "@/components/PageStates";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, cn } from "@/lib/utils";

export default function ReservationsPage() {
  const { data: reservations, error, reload } = useApiData(fetchReservations);
  const [query, setQuery] = useState("");
  const bookmarks = useMarkedReservations("zendenta_bookmarks");
  const flags = useMarkedReservations("zendenta_flags");

  if (error) {
    return (
      <div className="pt-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!reservations) {
    return (
      <div className="pt-6">
        <PageLoader label="Loading reservations..." />
      </div>
    );
  }

  const filtered = reservations.filter(
    (r) =>
      r.patientName.toLowerCase().includes(query.toLowerCase()) ||
      r.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5 pt-6">
      <div className="rounded-2xl border border-slate-100 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="relative w-full max-w-[260px]">
            <Search
              size={14}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-300"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search name or reservation ID"
              title="Search reservations"
              aria-label="Search reservations"
              className="w-full rounded-lg border border-slate-100 bg-slate-50/60 py-2 pr-3 pl-8 text-[12.5px] text-slate-600 placeholder:text-slate-350 outline-none focus:border-indigo-200 focus:bg-white"
            />
          </div>
          <p className="text-[12px] text-slate-400">{filtered.length} reservations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-y border-slate-100 text-left text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                <th className="px-5 py-2.5">Reservation ID</th>
                <th className="px-5 py-2.5">Patient</th>
                <th className="px-5 py-2.5">Date</th>
                <th className="px-5 py-2.5">Total</th>
                <th className="px-5 py-2.5">Payment</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const bookmarked = bookmarks.isMarked(r.id);
                const flagged = flags.isMarked(r.id);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-slate-50 text-[13px] text-slate-600 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-700">{r.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-slate-700 ${r.avatarColor}`}
                        >
                          {r.patientInitials}
                        </div>
                        <span className="font-medium text-slate-700">{r.patientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{r.reservationDate}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {formatCurrency(r.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.paymentStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => bookmarks.toggle(r.id)}
                          title={bookmarked ? `Remove ${r.id} from bookmarks` : `Bookmark ${r.id}`}
                          aria-label={bookmarked ? `Remove ${r.id} from bookmarks` : `Bookmark ${r.id}`}
                          aria-pressed={bookmarked}
                          className={cn(
                            "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-slate-100",
                            bookmarked ? "text-indigo-600" : "text-slate-300"
                          )}
                        >
                          <Bookmark size={14} fill={bookmarked ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => flags.toggle(r.id)}
                          title={flagged ? `Remove flag from ${r.id}` : `Flag ${r.id} for follow-up`}
                          aria-label={flagged ? `Remove flag from ${r.id}` : `Flag ${r.id} for follow-up`}
                          aria-pressed={flagged}
                          className={cn(
                            "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-slate-100",
                            flagged ? "text-rose-500" : "text-slate-300"
                          )}
                        >
                          <Flag size={14} fill={flagged ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
