"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarCheck2, TrendingUp, Users, Wallet2 } from "lucide-react";
import { fetchReservations, fetchStats } from "@/lib/api-client";
import { useApiData } from "@/hooks/useApiData";
import { PageLoader, ErrorState } from "@/components/PageStates";
import { RevenueByPatientChart } from "@/components/dashboard/RevenueByPatientChart";
import { PaymentStatusDonut } from "@/components/dashboard/PaymentStatusDonut";
import { formatCurrency } from "@/lib/utils";

async function loadDashboard() {
  const [reservations, stats] = await Promise.all([fetchReservations(), fetchStats()]);
  return { reservations, stats };
}

const cardStyles = [
  { icon: Wallet2, bg: "bg-indigo-50", fg: "text-indigo-600" },
  { icon: TrendingUp, bg: "bg-emerald-50", fg: "text-emerald-600" },
  { icon: Users, bg: "bg-amber-50", fg: "text-amber-600" },
  { icon: CalendarCheck2, bg: "bg-rose-50", fg: "text-rose-600" },
];

export default function DashboardPage() {
  const { data, error, reload } = useApiData(loadDashboard);

  if (error) {
    return (
      <div className="pt-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pt-6">
        <PageLoader label="Loading dashboard..." />
      </div>
    );
  }

  const { reservations, stats } = data;
  const totalPatients = new Set(reservations.map((r) => r.patientName)).size;
  const unpaidBills = reservations.flatMap((r) => r.bills).filter((b) => b.status === "unpaid").length;
  const recent = reservations.slice(0, 5);

  const cards = [
    { label: "Revenue this month", value: formatCurrency(stats.revenue) },
    { label: "Profit this month", value: formatCurrency(stats.profit) },
    { label: "Patients seen", value: String(totalPatients) },
    { label: "Unpaid bills", value: String(unpaidBills) },
  ];

  return (
    <div className="space-y-5 pt-6">
      <div>
        <h2 className="text-[15px] font-bold text-slate-800">Welcome back, Darrell</h2>
        <p className="text-[12.5px] text-slate-400">Here&apos;s an overview of the clinic&apos;s activity.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const style = cardStyles[i];
          return (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.fg}`}>
                <style.icon size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[12px] text-slate-400">{c.label}</p>
                <p className="text-[16px] font-bold text-slate-900">{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueByPatientChart reservations={reservations} />
        </div>
        <PaymentStatusDonut reservations={reservations} />
      </div>

      {/* Activity feed */}
      <div className="rounded-2xl border border-slate-100 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-[14px] font-bold text-slate-800">Recent activity</h2>
          <Link
            href="/sales"
            title="Go to billing"
            className="flex cursor-pointer items-center gap-1 text-[12.5px] font-semibold text-indigo-600 hover:underline"
          >
            Go to billing
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <ul className="px-5">
          {recent.map((r, i) => (
            <li
              key={r.id}
              className={`flex items-center gap-3 py-3.5 ${i !== recent.length - 1 ? "border-b border-slate-50" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-slate-700 ${r.avatarColor}`}
              >
                {r.patientInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-slate-600">
                  <span className="font-semibold text-slate-800">{r.patientName}</span>{" "}
                  {r.paymentStatus === "fully_paid" ? "completed payment" : "has a pending bill"}
                  {" "}for {r.id}
                </p>
                <p className="text-[11px] text-slate-400">{r.reservationDate}</p>
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-slate-700">
                {formatCurrency(r.totalAmount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
