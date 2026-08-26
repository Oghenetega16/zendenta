"use client";

import { ArrowDownRight, ReceiptText, Wallet2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  delta: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={18} strokeWidth={2} />
      </div>
      <div>
        <p className="text-[12.5px] text-slate-400">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-bold text-slate-900">
            {formatCurrency(value)}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-rose-500">
            <ArrowDownRight size={12} />
            {formatCurrency(delta)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StatsCards({
  revenue,
  profit,
}: {
  revenue: number;
  profit: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard icon={Wallet2} label="Revenue this month" value={revenue} delta={43} />
      <StatCard icon={ReceiptText} label="Profit this month" value={profit} delta={43} />
    </div>
  );
}
