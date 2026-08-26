"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Reservation } from "@/types";
import { formatCurrency } from "@/lib/utils";

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { name: string; total: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, total } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-[12px] shadow-lg">
      <p className="font-semibold text-slate-700">{name}</p>
      <p className="text-slate-500">{formatCurrency(total)}</p>
    </div>
  );
}

export function RevenueByPatientChart({ reservations }: { reservations: Reservation[] }) {
  const data = reservations
    .map((r) => ({
      name: r.patientName.split(" ")[0],
      total: r.totalAmount,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-slate-800">Billed by patient</h2>
          <p className="text-[11.5px] text-slate-400">Total amount per reservation, this period</p>
        </div>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f2f6" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={{ stroke: "#f1f2f6" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip cursor={{ fill: "#f8f9fc" }} content={<CustomTooltip />} />
            <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
