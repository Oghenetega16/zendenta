"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { fetchPatients } from "@/lib/api-client";
import { useApiData } from "@/hooks/useApiData";
import { PageLoader, ErrorState } from "@/components/PageStates";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { PaymentStatus } from "@/types";

export default function PatientsPage() {
  const { data: patients, error, reload } = useApiData(fetchPatients);
  const [query, setQuery] = useState("");

  if (error) {
    return (
      <div className="pt-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!patients) {
    return (
      <div className="pt-6">
        <PageLoader label="Loading patients..." />
      </div>
    );
  }

  const filtered = patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5 pt-6">
      <div className="rounded-2xl border border-slate-100 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="relative w-full max-w-[260px]">
            <Search
              size={14}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-300"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search patient name"
              title="Search patients"
              aria-label="Search patients"
              className="w-full rounded-lg border border-slate-100 bg-slate-50/60 py-2 pr-3 pl-8 text-[12.5px] text-slate-600 placeholder:text-slate-350 outline-none focus:border-indigo-200 focus:bg-white"
            />
          </div>
          <p className="text-[12px] text-slate-400">{filtered.length} patients</p>
        </div>

        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-y border-slate-100 text-left text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              <th className="px-5 py-2.5">Patient</th>
              <th className="px-5 py-2.5">Visits</th>
              <th className="px-5 py-2.5">Total Billed</th>
              <th className="px-5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.name}
                className="border-b border-slate-50 text-[13px] text-slate-600 hover:bg-slate-50/60"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-slate-700 ${p.avatarColor}`}
                    >
                      {p.initials}
                    </div>
                    <span className="font-medium text-slate-700">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{p.visits}</td>
                <td className="px-5 py-3.5 font-medium text-slate-700">
                  {formatCurrency(p.totalBilled)}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={p.status as PaymentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
