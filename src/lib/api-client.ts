import { Reservation } from "@/types";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

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
  billNo: string
): Promise<Reservation> {
  const res = await fetch(
    `/api/reservations/${encodeURIComponent(reservationId)}/bills/${encodeURIComponent(
      billNo
    )}/pay`,
    { method: "POST" }
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
