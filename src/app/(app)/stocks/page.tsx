"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { fetchStocks } from "@/lib/api-client";
import { useApiData } from "@/hooks/useApiData";
import { PageLoader, ErrorState } from "@/components/PageStates";

export default function StocksPage() {
  const { data: stocks, error, reload } = useApiData(fetchStocks);

  if (error) {
    return (
      <div className="pt-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!stocks) {
    return (
      <div className="pt-6">
        <PageLoader label="Loading stock levels..." />
      </div>
    );
  }

  const lowStock = stocks.filter((s) => s.quantity <= s.reorderThreshold);

  return (
    <div className="space-y-5 pt-6">
      {lowStock.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-2.5 text-amber-700">
            <AlertTriangle size={17} />
            <p className="text-[13px] font-medium">
              {lowStock.length} item{lowStock.length === 1 ? "" : "s"} at or below reorder level
            </p>
          </div>
          <Link
            href="/purchases"
            title="Go to purchases"
            className="flex cursor-pointer items-center gap-1 text-[12.5px] font-semibold text-amber-700 hover:underline"
          >
            Order more
            <ArrowUpRight size={13} />
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">On Hand</th>
                <th className="px-5 py-3">Reorder At</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => {
                const low = s.quantity <= s.reorderThreshold;
                return (
                  <tr key={s.id} className="border-b border-slate-50 text-[13px] text-slate-600">
                    <td className="px-5 py-3.5 font-medium text-slate-700">{s.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.category}</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {s.quantity} {s.unit}
                      {s.quantity === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{s.reorderThreshold}</td>
                    <td className="px-5 py-3.5">
                      {low ? (
                        <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-500 uppercase">
                          Low stock
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 uppercase">
                          In stock
                        </span>
                      )}
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
