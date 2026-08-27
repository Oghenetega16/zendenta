import {
  Account,
  Bill,
  PaymentMethodConfig,
  Peripheral,
  PeripheralStatus,
  Purchase,
  Reservation,
  Stock,
} from "@/types";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- Reservations & bills ---------------------------------------------------

export async function fetchReservations(): Promise<Reservation[]> {
  const res = await fetch("/api/reservations", { cache: "no-store" });
  const data = await handle<{ reservations: Reservation[] }>(res);
  return data.reservations;
}

export async function fetchStats(): Promise<{ revenue: number; profit: number }> {
  const res = await fetch("/api/stats", { cache: "no-store" });
  return handle(res);
}

export async function payBillRequest(
  reservationId: string,
  billNo: string,
  accountId?: string
): Promise<Reservation> {
  const res = await fetch(
    `/api/reservations/${encodeURIComponent(reservationId)}/bills/${encodeURIComponent(
      billNo
    )}/pay`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    }
  );
  const data = await handle<{ reservation: Reservation }>(res);
  return data.reservation;
}

export interface PatientSummary {
  name: string;
  initials: string;
  avatarColor: string;
  visits: number;
  totalBilled: number;
  status: string;
}

export async function fetchPatients(): Promise<PatientSummary[]> {
  const res = await fetch("/api/patients", { cache: "no-store" });
  const data = await handle<{ patients: PatientSummary[] }>(res);
  return data.patients;
}

// --- Accounts ----------------------------------------------------------------

export interface AccountWithTotals extends Account {
  totalReceived: number;
  transactionCount: number;
  recentBills: (Bill & { patientName: string })[];
}

export async function fetchAccounts(): Promise<AccountWithTotals[]> {
  const res = await fetch("/api/accounts", { cache: "no-store" });
  const data = await handle<{ accounts: AccountWithTotals[] }>(res);
  return data.accounts;
}

// --- Purchases & stocks --------------------------------------------------------

export async function fetchPurchases(): Promise<Purchase[]> {
  const res = await fetch("/api/purchases", { cache: "no-store" });
  const data = await handle<{ purchases: Purchase[] }>(res);
  return data.purchases;
}

export async function fetchStocks(): Promise<Stock[]> {
  const res = await fetch("/api/stocks", { cache: "no-store" });
  const data = await handle<{ stocks: Stock[] }>(res);
  return data.stocks;
}

export async function receivePurchaseRequest(
  id: string
): Promise<{ purchase: Purchase; stock: Stock }> {
  const res = await fetch(`/api/purchases/${encodeURIComponent(id)}/receive`, {
    method: "POST",
  });
  return handle(res);
}

// --- Peripherals ---------------------------------------------------------------

export async function fetchPeripherals(): Promise<Peripheral[]> {
  const res = await fetch("/api/peripherals", { cache: "no-store" });
  const data = await handle<{ peripherals: Peripheral[] }>(res);
  return data.peripherals;
}

export async function updatePeripheralStatusRequest(
  id: string,
  status: PeripheralStatus
): Promise<Peripheral> {
  const res = await fetch(`/api/peripherals/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await handle<{ peripheral: Peripheral }>(res);
  return data.peripheral;
}

// --- Payment methods -------------------------------------------------------------

export async function fetchPaymentMethods(): Promise<PaymentMethodConfig[]> {
  const res = await fetch("/api/payment-methods", { cache: "no-store" });
  const data = await handle<{ methods: PaymentMethodConfig[] }>(res);
  return data.methods;
}

export async function setPaymentMethodEnabledRequest(
  id: string,
  enabled: boolean
): Promise<PaymentMethodConfig> {
  const res = await fetch(`/api/payment-methods/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
  const data = await handle<{ method: PaymentMethodConfig }>(res);
  return data.method;
}
