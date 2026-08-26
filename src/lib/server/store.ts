import { reservations as seedReservations } from "@/lib/data";
import { Reservation } from "@/types";

/**
 * In-memory "database". This stands in for a real datastore (Postgres, etc).
 * It's a module-level singleton cached on globalThis so it survives Next.js
 * dev-mode hot reloads instead of resetting on every file edit. Swap the
 * functions below for real queries when you wire up a database - the API
 * route handlers that call this module don't need to change shape.
 */

type Store = {
  reservations: Reservation[];
};

const globalForStore = globalThis as unknown as { __zendentaStore?: Store };

function cloneSeed(): Reservation[] {
  return JSON.parse(JSON.stringify(seedReservations)) as Reservation[];
}

const store: Store =
  globalForStore.__zendentaStore ?? (globalForStore.__zendentaStore = { reservations: cloneSeed() });

// Small artificial latency so loading states in the UI are meaningful,
// like a real network round trip. Remove once a real DB is in place.
function delay(ms = 260) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listReservations(): Promise<Reservation[]> {
  await delay();
  return store.reservations;
}

export async function getReservation(id: string): Promise<Reservation | undefined> {
  await delay(150);
  return store.reservations.find((r) => r.id === id);
}

export async function payBill(
  reservationId: string,
  billNo: string
): Promise<Reservation | null> {
  await delay(400);
  const reservation = store.reservations.find((r) => r.id === reservationId);
  if (!reservation) return null;

  const bill = reservation.bills.find((b) => b.billNo === billNo);
  if (!bill) return null;

  bill.status = "paid";
  const paidCount = reservation.bills.filter((b) => b.status === "paid").length;
  reservation.numberOfBillsPaid = paidCount;
  reservation.paymentStatus =
    paidCount === reservation.bills.length ? "fully_paid" : "partially_paid";

  return reservation;
}

export async function getStats(): Promise<{ revenue: number; profit: number }> {
  await delay(150);
  // In a real backend this would aggregate paid invoices for the current month.
  return { revenue: 154, profit: 154 };
}

export async function listPatients() {
  await delay(200);
  const byName = new Map<
    string,
    { name: string; initials: string; avatarColor: string; visits: number; totalBilled: number; status: string }
  >();

  for (const r of store.reservations) {
    const existing = byName.get(r.patientName);
    const paidTotal = r.bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.total, 0);
    if (existing) {
      existing.visits += 1;
      existing.totalBilled += paidTotal;
    } else {
      byName.set(r.patientName, {
        name: r.patientName,
        initials: r.patientInitials,
        avatarColor: r.avatarColor,
        visits: 1,
        totalBilled: paidTotal,
        status: r.paymentStatus,
      });
    }
  }

  return Array.from(byName.values());
}
