import {
  accounts as seedAccounts,
  paymentMethods as seedPaymentMethods,
  peripherals as seedPeripherals,
  purchases as seedPurchases,
  reservations as seedReservations,
  stocks as seedStocks,
} from "@/lib/data";
import {
  Account,
  PaymentMethodConfig,
  Peripheral,
  PeripheralStatus,
  Purchase,
  Reservation,
  Stock,
} from "@/types";

/**
 * In-memory "database". This stands in for a real datastore (Postgres, etc).
 * It's a module-level singleton cached on globalThis so it survives Next.js
 * dev-mode hot reloads instead of resetting on every file edit. Swap the
 * functions below for real queries when you wire up a database - the API
 * route handlers that call this module don't need to change shape.
 */

type Store = {
  reservations: Reservation[];
  accounts: Account[];
  stocks: Stock[];
  purchases: Purchase[];
  peripherals: Peripheral[];
  paymentMethods: PaymentMethodConfig[];
};

const globalForStore = globalThis as unknown as { __zendentaStore?: Store };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seedStore(): Store {
  return {
    reservations: clone(seedReservations),
    accounts: clone(seedAccounts),
    stocks: clone(seedStocks),
    purchases: clone(seedPurchases),
    peripherals: clone(seedPeripherals),
    paymentMethods: clone(seedPaymentMethods),
  };
}

const store: Store = globalForStore.__zendentaStore ?? (globalForStore.__zendentaStore = seedStore());

// Small artificial latency so loading states in the UI are meaningful,
// like a real network round trip. Remove once a real DB is in place.
function delay(ms = 260) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Reservations & bills
// ---------------------------------------------------------------------------

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
  billNo: string,
  accountId?: string
): Promise<Reservation | null> {
  await delay(400);
  const reservation = store.reservations.find((r) => r.id === reservationId);
  if (!reservation) return null;

  const bill = reservation.bills.find((b) => b.billNo === billNo);
  if (!bill) return null;

  bill.status = "paid";
  bill.accountId = accountId ?? store.accounts.find((a) => a.isDefault)?.id ?? store.accounts[0]?.id;

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

// ---------------------------------------------------------------------------
// Accounts (Finance) - balances are derived from bills actually paid into them
// ---------------------------------------------------------------------------

export async function listAccountsWithTotals() {
  await delay(200);
  const paidBills = store.reservations.flatMap((r) =>
    r.bills.filter((b) => b.status === "paid").map((b) => ({ ...b, patientName: r.patientName }))
  );

  return store.accounts.map((account) => {
    const bills = paidBills.filter((b) => (b.accountId ?? store.accounts.find((a) => a.isDefault)?.id) === account.id);
    return {
      ...account,
      totalReceived: bills.reduce((sum, b) => sum + b.total, 0),
      transactionCount: bills.length,
      recentBills: bills.slice(-4).reverse(),
    };
  });
}

// ---------------------------------------------------------------------------
// Purchases <-> Stocks (Physical Asset) - receiving a purchase restocks it
// ---------------------------------------------------------------------------

export async function listPurchases(): Promise<Purchase[]> {
  await delay(200);
  return store.purchases;
}

export async function listStocks(): Promise<Stock[]> {
  await delay(200);
  return store.stocks;
}

export async function receivePurchase(id: string): Promise<{ purchase: Purchase; stock: Stock } | null> {
  await delay(350);
  const purchase = store.purchases.find((p) => p.id === id);
  if (!purchase || purchase.status === "received") return null;

  purchase.status = "received";
  const stock = store.stocks.find((s) => s.id === purchase.stockId);
  if (stock) {
    stock.quantity += purchase.quantity;
  }

  return { purchase, stock: stock ?? store.stocks[0] };
}

// ---------------------------------------------------------------------------
// Peripherals (Physical Asset)
// ---------------------------------------------------------------------------

export async function listPeripherals(): Promise<Peripheral[]> {
  await delay(200);
  return store.peripherals;
}

export async function updatePeripheralStatus(
  id: string,
  status: PeripheralStatus
): Promise<Peripheral | null> {
  await delay(250);
  const peripheral = store.peripherals.find((p) => p.id === id);
  if (!peripheral) return null;
  peripheral.status = status;
  return peripheral;
}

// ---------------------------------------------------------------------------
// Payment methods (Finance) - drives which methods PaymentDrawer offers
// ---------------------------------------------------------------------------

export async function listPaymentMethods(): Promise<PaymentMethodConfig[]> {
  await delay(150);
  return store.paymentMethods;
}

export async function setPaymentMethodEnabled(
  id: string,
  enabled: boolean
): Promise<PaymentMethodConfig | null> {
  await delay(200);
  const method = store.paymentMethods.find((m) => m.id === id);
  if (!method) return null;
  method.enabled = enabled;
  return method;
}
