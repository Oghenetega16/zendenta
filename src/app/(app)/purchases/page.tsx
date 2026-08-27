"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2, PackageCheck } from "lucide-react";
import { fetchPurchases, receivePurchaseRequest } from "@/lib/api-client";
import { useApiData } from "@/hooks/useApiData";
import { PageLoader, ErrorState } from "@/components/PageStates";
import { formatCurrency } from "@/lib/utils";
import { Purchase } from "@/types";

export default function PurchasesPage() {
  const { data, error, reload } = useApiData(fetchPurchases);
  const [localPurchases, setLocalPurchases] = useState<Purchase[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [justReceived, setJustReceived] = useState<{ id: string; stockName: string } | null>(null);

  const purchases = localPurchases ?? data;

  async function receive(purchase: Purchase) {
    setPendingId(purchase.id);
    try {
      const { purchase: updated, stock } = await receivePurchaseRequest(purchase.id);
      setLocalPurchases((prev) =>
        (prev ?? data ?? []).map((p) => (p.id === updated.id ? updated : p))
      );
      setJustReceived({ id: updated.id, stockName: stock.name });
      setTimeout(() => setJustReceived(null), 4000);
    } finally {
      setPendingId(null);
    }
  }

  if (error) {
    return (
      <div className="pt-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!purchases) {
    return (
      <div className="pt-6">
        <PageLoader label="Loading purchases..." />
      </div>
    );
  }

  const pendingCount = purchases.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-5 pt-6">
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4">
        <div>
          <p className="text-[12px] text-slate-400">Pending orders</p>
          <p className="text-[18px] font-bold text-slate-900">{pendingCount}</p>
        </div>
        <Link
          href="/stocks"
          title="View stock levels"
          className="flex cursor-pointer items-center gap-1 text-[12.5px] font-semibold text-indigo-600 hover:underline"
        >
          View stock levels
          <ArrowUpRight size={13} />
        </Link>
      </div>

      {justReceived && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12.5px] text-emerald-700">
          <PackageCheck size={16} />
          Order {justReceived.id} received &mdash; {justReceived.stockName} restocked.
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Item</th>
              <th className="px-5 py-3">Supplier</th>
              <th className="px-5 py-3">Qty</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Order Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => {
              const isPending = pendingId === p.id;
              return (
                <tr key={p.id} className="border-b border-slate-50 text-[13px] text-slate-600">
                  <td className="px-5 py-3.5 font-medium text-slate-700">{p.id}</td>
                  <td className="px-5 py-3.5">{p.item}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.supplier}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.quantity}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">
                    {formatCurrency(p.total)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{p.orderDate}</td>
                  <td className="px-5 py-3.5">
                    {p.status === "received" ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 uppercase">
                        Received
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600 uppercase">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {p.status === "pending" && (
                      <button
                        onClick={() => receive(p)}
                        disabled={isPending}
                        title={`Mark ${p.id} as received`}
                        aria-label={`Mark ${p.id} as received`}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-70"
                      >
                        {isPending && <Loader2 size={12} className="animate-spin" />}
                        Mark received
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
