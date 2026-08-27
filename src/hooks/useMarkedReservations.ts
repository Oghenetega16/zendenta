"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persists a set of reservation IDs to localStorage under `storageKey`.
 * Used for both "bookmarked" and "flagged" reservations - same mechanism,
 * different key, so the Topbar's Bookmarks/Flags menus and any toggle
 * buttons in the Reservations table all read/write the same source of truth.
 */
export function useMarkedReservations(storageKey: string) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        setIds(raw ? (JSON.parse(raw) as string[]) : []);
      } catch {
        setIds([]);
      }
      setHydrated(true);
    });
  }, [storageKey]);

  const persist = useCallback(
    (next: string[]) => {
      setIds(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // localStorage unavailable (private browsing, etc.) - state still
        // updates for this session, it just won't persist across reloads.
      }
      // Let other components (e.g. the Topbar menu) using the same key know.
      window.dispatchEvent(new CustomEvent("zendenta:marked-reservations", { detail: { storageKey } }));
    },
    [storageKey]
  );

  // Stay in sync if another component updates the same key.
  useEffect(() => {
    function onExternalChange(e: Event) {
      const detail = (e as CustomEvent<{ storageKey: string }>).detail;
      if (detail?.storageKey !== storageKey) return;
      try {
        const raw = window.localStorage.getItem(storageKey);
        setIds(raw ? (JSON.parse(raw) as string[]) : []);
      } catch {
        setIds([]);
      }
    }
    window.addEventListener("zendenta:marked-reservations", onExternalChange);
    return () => window.removeEventListener("zendenta:marked-reservations", onExternalChange);
  }, [storageKey]);

  const isMarked = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      persist(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    },
    [ids, persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(ids.filter((x) => x !== id));
    },
    [ids, persist]
  );

  return { ids, hydrated, isMarked, toggle, remove };
}
