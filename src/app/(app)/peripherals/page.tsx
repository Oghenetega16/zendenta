"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchPeripherals, updatePeripheralStatusRequest } from "@/lib/api-client";
import { useApiData } from "@/hooks/useApiData";
import { PageLoader, ErrorState } from "@/components/PageStates";
import { Peripheral, PeripheralStatus } from "@/types";

const statusStyles: Record<PeripheralStatus, string> = {
  active: "bg-emerald-50 text-emerald-600",
  maintenance: "bg-amber-50 text-amber-600",
  retired: "bg-slate-100 text-slate-500",
};

const nextStatus: Record<PeripheralStatus, PeripheralStatus> = {
  active: "maintenance",
  maintenance: "active",
  retired: "retired",
};

const actionLabel: Record<PeripheralStatus, string> = {
  active: "Send to maintenance",
  maintenance: "Mark active",
  retired: "Retired",
};

export default function PeripheralsPage() {
  const { data, error, reload } = useApiData(fetchPeripherals);
  const [localPeripherals, setLocalPeripherals] = useState<Peripheral[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const peripherals = localPeripherals ?? data;

  async function cycleStatus(p: Peripheral) {
    if (p.status === "retired") return;
    setPendingId(p.id);
    try {
      const updated = await updatePeripheralStatusRequest(p.id, nextStatus[p.status]);
      setLocalPeripherals((prev) =>
        (prev ?? data ?? []).map((item) => (item.id === updated.id ? updated : item))
      );
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

  if (!peripherals) {
    return (
      <div className="pt-6">
        <PageLoader label="Loading equipment..." />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-6">
      <div className="rounded-2xl border border-slate-100 bg-white">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              <th className="px-5 py-3">Equipment</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Assigned To</th>
              <th className="px-5 py-3">Last Serviced</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {peripherals.map((p) => {
              const isPending = pendingId === p.id;
              return (
                <tr key={p.id} className="border-b border-slate-50 text-[13px] text-slate-600">
                  <td className="px-5 py-3.5 font-medium text-slate-700">{p.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.type}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.assignedTo}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.lastServiced}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${statusStyles[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {p.status !== "retired" && (
                      <button
                        onClick={() => cycleStatus(p)}
                        disabled={isPending}
                        title={actionLabel[p.status]}
                        aria-label={actionLabel[p.status]}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
                      >
                        {isPending && <Loader2 size={12} className="animate-spin" />}
                        {actionLabel[p.status]}
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
