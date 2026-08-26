"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Reservation } from "@/types";

const statusMeta = {
  fully_paid: { label: "Fully Paid", color: "#22c55e" },
  partially_paid: { label: "Partially Paid", color: "#8b5cf6" },
  unpaid: { label: "Unpaid", color: "#f43f5e" },
} as const;

export function PaymentStatusDonut({ reservations }: { reservations: Reservation[] }) {
  const counts = { fully_paid: 0, partially_paid: 0, unpaid: 0 };
  for (const r of reservations) counts[r.paymentStatus] += 1;

  const data = (Object.keys(counts) as (keyof typeof counts)[])
    .map((key) => ({
      key,
      name: statusMeta[key].label,
      value: counts[key],
      color: statusMeta[key].color,
    }))
    .filter((d) => d.value > 0);

  const total = reservations.length;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <h2 className="mb-1 text-[14px] font-bold text-slate-800">Payment status</h2>
      <p className="mb-2 text-[11.5px] text-slate-400">Across all reservations</p>

      <div className="relative h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={74}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} reservations`, name]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #f1f5f9",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[20px] font-bold text-slate-900">{total}</span>
          <span className="text-[10.5px] text-slate-400">total</span>
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        {data.map((d) => (
          <div key={d.key} className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}
            </span>
            <span className="font-medium text-slate-700">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
