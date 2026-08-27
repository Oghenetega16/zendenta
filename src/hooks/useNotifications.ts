"use client";

import { useEffect, useState } from "react";
import { fetchReservations } from "@/lib/api-client";
import { Reservation } from "@/types";

const DISMISSED_KEY = "zendenta_dismissed_notifications";

export interface NotificationItem {
  id: string; // billNo, used as the stable identity for dismissal
  reservationId: string;
  patientName: string;
  avatarColor: string;
  patientInitials: string;
  message: string;
  amount: number;
}

function readDismissed(): string[] {
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function buildNotifications(reservations: Reservation[], dismissed: string[]): NotificationItem[] {
  return reservations
    .flatMap((r) =>
      r.bills
        .filter((b) => b.status === "unpaid")
        .map((b) => ({
          id: b.billNo,
          reservationId: r.id,
          patientName: r.patientName,
          avatarColor: r.avatarColor,
          patientInitials: r.patientInitials,
          message: `has an unpaid bill for ${b.label.toLowerCase()}`,
          amount: b.total,
        }))
    )
    .filter((n) => !dismissed.includes(n.id));
}

export function useNotifications() {
  const [all, setAll] = useState<NotificationItem[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) setDismissed(readDismissed());
    });

    fetchReservations()
      .then((reservations) => {
        if (ignore) return;
        setAll(buildNotifications(reservations, readDismissed()));
        setLoading(false);
      })
      .catch(() => {
        if (ignore) return;
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const visible = all.filter((n) => !dismissed.includes(n.id));

  function dismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // best-effort persistence only
    }
  }

  function dismissAll() {
    const next = [...dismissed, ...visible.map((n) => n.id)];
    setDismissed(next);
    try {
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // best-effort persistence only
    }
  }

  return { notifications: visible, loading, dismiss, dismissAll };
}
