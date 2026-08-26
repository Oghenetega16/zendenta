"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StatsCards } from "@/components/StatsCards";
import { BillsTable } from "@/components/BillsTable";
import { PaymentDrawer } from "@/components/payment/PaymentDrawer";
import { PageLoader, ErrorState } from "@/components/PageStates";
import { useApiData } from "@/hooks/useApiData";
import { fetchReservations, fetchStats, payBillRequest } from "@/lib/api-client";
import { Bill, Reservation } from "@/types";

async function loadSales() {
  const [reservations, stats] = await Promise.all([fetchReservations(), fetchStats()]);
  return { reservations, stats };
}

export default function SalesPage() {
  const { data, error, reload } = useApiData(loadSales);
  const [localReservations, setLocalReservations] = useState<Reservation[] | null>(null);
  const [activePayment, setActivePayment] = useState<{
    reservation: Reservation;
    bill: Bill;
  } | null>(null);

  // Server data is the source of truth on load/reload; local edits (from
  // paying a bill) are layered on top until the next full reload.
  const reservations = localReservations ?? data?.reservations ?? null;

  function handleSetPayment(reservation: Reservation, bill: Bill) {
    setActivePayment({ reservation, bill });
  }

  async function handlePaid() {
    if (!activePayment) return;
    const { reservation, bill } = activePayment;
    const updated = await payBillRequest(reservation.id, bill.billNo);
    setLocalReservations((prev) => {
      const base = prev ?? data?.reservations ?? [];
      return base.map((r) => (r.id === updated.id ? updated : r));
    });
  }

  if (error) {
    return (
      <div className="pt-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!data || !reservations) {
    return (
      <div className="pt-6">
        <PageLoader label="Loading sales data..." />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-6">
      <StatsCards revenue={data.stats.revenue} profit={data.stats.profit} />
      <BillsTable reservations={reservations} onSetPayment={handleSetPayment} />

      <AnimatePresence>
        {activePayment && (
          <PaymentDrawer
            reservation={activePayment.reservation}
            bill={activePayment.bill}
            onClose={() => setActivePayment(null)}
            onPaid={handlePaid}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
