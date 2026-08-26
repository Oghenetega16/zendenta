"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Flag,
  HelpCircle,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { fetchReservations } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Reservation } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";

const MAX_RESULTS = 6;

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Reservation[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState(false);

  function onQueryChange(value: string) {
    setQuery(value);
    if (value.trim()) {
      setLoading(true);
      setError(false);
    } else {
      setLoading(false);
      setError(false);
      setResults([]);
      setOpen(false);
    }
  }

  // Debounced search: filters reservations by patient name or reservation ID.
  // All state updates happen inside the async callback (not synchronously in
  // the effect body) so a stale, superseded request can never win a race.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let ignore = false;
    const timeoutId = setTimeout(async () => {
      try {
        const all = await fetchReservations();
        if (ignore) return;
        const q = trimmed.toLowerCase();
        const matches = all.filter(
          (r) =>
            r.patientName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
        );
        setResults(matches.slice(0, MAX_RESULTS));
        setActiveIndex(0);
        setOpen(true);
        setLoading(false);
      } catch {
        if (ignore) return;
        setError(true);
        setResults([]);
        setOpen(true);
        setLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goToReservation(reservation: Reservation) {
    // Billing detail for any reservation lives on the Sales page; pass the
    // id along so that page can deep-link/highlight it in the future.
    router.push(`/sales?reservation=${encodeURIComponent(reservation.id)}`);
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.blur();
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (e.key === "Escape") {
        clearSearch();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = results[activeIndex];
      if (chosen) goToReservation(chosen);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <header className="flex items-center justify-between gap-4 px-8 py-5">
      <h1 className="text-[22px] font-bold text-slate-900">{title}</h1>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div ref={containerRef} className="relative w-full max-w-[280px]">
          {loading ? (
            <Loader2
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 animate-spin text-slate-300"
            />
          ) : (
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-300"
            />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => {
              if (query.trim().length > 0) setOpen(true);
            }}
            placeholder="Search for anything here..."
            title="Search reservations by patient name or ID"
            aria-label="Search reservations by patient name or ID"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="topbar-search-results"
            aria-autocomplete="list"
            autoComplete="off"
            className="w-full rounded-lg border border-slate-100 bg-white py-2 pr-8 pl-9 text-[13px] text-slate-600 placeholder:text-slate-300 outline-none focus:border-indigo-200 focus:ring-2 focus:ring-indigo-50"
          />

          {query.length > 0 && (
            <button
              onClick={clearSearch}
              title="Clear search"
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-slate-300 hover:text-slate-500"
            >
              <X size={14} />
            </button>
          )}

          {showDropdown && (
            <div
              id="topbar-search-results"
              role="listbox"
              className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-100 bg-white py-1 shadow-lg"
            >
              {error ? (
                <p className="px-3.5 py-3 text-[12.5px] text-rose-500">
                  Couldn&apos;t reach the server. Try again.
                </p>
              ) : results.length === 0 ? (
                !loading && (
                  <p className="px-3.5 py-3 text-[12.5px] text-slate-400">
                    No reservations match &ldquo;{query}&rdquo;.
                  </p>
                )
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.id}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goToReservation(r)}
                    title={`Open ${r.patientName} (${r.id}) in Sales`}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-left ${
                      i === activeIndex ? "bg-indigo-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-slate-700 ${r.avatarColor}`}
                      >
                        {r.patientInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-slate-700">
                          {r.patientName}
                        </p>
                        <p className="text-[11px] text-slate-400">{r.id}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[12px] font-semibold text-slate-700">
                        {formatCurrency(r.totalAmount)}
                      </span>
                      <StatusBadge status={r.paymentStatus} />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          title="Create new"
          aria-label="Create new"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
        >
          <Plus size={17} />
        </button>

        <div className="hidden items-center gap-1 text-slate-400 sm:flex">
          <button
            title="Help"
            aria-label="Help"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-600"
          >
            <HelpCircle size={17} />
          </button>
          <button
            title="Bookmarks"
            aria-label="Bookmarks"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-600"
          >
            <Bookmark size={17} />
          </button>
          <button
            title="Flagged items"
            aria-label="Flagged items"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-600"
          >
            <Flag size={17} />
          </button>
          <button
            title="Notifications"
            aria-label="Notifications"
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-600"
          >
            <Bell size={17} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
        </div>

        <div className="ml-1 flex items-center gap-2.5 border-l border-slate-100 pl-3">
          <div
            title="Darrell Steward"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-amber-700 to-amber-900 text-xs font-semibold text-white"
          >
            DS
          </div>
          <div className="hidden text-left leading-tight md:block">
            <p className="text-[13px] font-semibold text-slate-800">Darrell Steward</p>
            <p className="text-[11px] text-slate-400">Super admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}