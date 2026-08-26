"use client";

import { Fragment, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Download,
  MoreVertical,
  Printer,
  Search,
  Upload,
} from "lucide-react";
import { Bill, Reservation } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export function BillsTable({
  reservations,
  onSetPayment,
}: {
  reservations: Reservation[];
  onSetPayment: (reservation: Reservation, bill: Bill) => void;
}) {
  const [tab, setTab] = useState<"bill" | "received">("bill");
  const [expanded, setExpanded] = useState<string | null>("#RSV002");
  const [query, setQuery] = useState("");

  const filtered = reservations.filter(
    (r) =>
      r.patientName.toLowerCase().includes(query.toLowerCase()) ||
      r.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-100 px-5 pt-4">
        <button
          onClick={() => setTab("bill")}
          title="Bill"
          role="tab"
          aria-selected={tab === "bill"}
          className={cn(
            "relative cursor-pointer pb-3 text-[13.5px] font-semibold",
            tab === "bill" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Bill
          {tab === "bill" && (
            <span className="absolute -bottom-px left-0 h-[2px] w-full rounded-full bg-indigo-600" />
          )}
        </button>
        <button
          onClick={() => setTab("received")}
          title="Payment Received"
          role="tab"
          aria-selected={tab === "received"}
          className={cn(
            "relative cursor-pointer pb-3 text-[13.5px] font-semibold",
            tab === "received" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Payment Received
          {tab === "received" && (
            <span className="absolute -bottom-px left-0 h-[2px] w-full rounded-full bg-indigo-600" />
          )}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <div className="relative w-full max-w-[240px]">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-300"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search name or reservation ID"
            title="Search name or reservation ID"
            aria-label="Search name or reservation ID"
            className="w-full rounded-lg border border-slate-100 bg-slate-50/60 py-2 pr-3 pl-8 text-[12.5px] text-slate-600 placeholder:text-slate-350 outline-none focus:border-indigo-200 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            title="Filter by date range"
            aria-label="Filter by date range"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-[12.5px] font-medium text-slate-500 hover:bg-slate-50"
          >
            <CalendarDays size={14} className="text-slate-400" />
            1 May 2021 - 30 May 2022
            <ChevronDown size={13} className="text-slate-400" />
          </button>
          <button
            title="Export bills"
            aria-label="Export bills"
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-indigo-500"
          >
            <Upload size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-y border-slate-100 text-left text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              <th className="px-5 py-2.5 font-semibold">Reservation ID</th>
              <th className="px-5 py-2.5 font-semibold">Patient Name</th>
              <th className="px-5 py-2.5 font-semibold">Number of Bill</th>
              <th className="px-5 py-2.5 font-semibold">Reservation Date</th>
              <th className="px-5 py-2.5 font-semibold">Total Amount</th>
              <th className="px-5 py-2.5 font-semibold">Payment</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const isOpen = expanded === r.id;
              return (
                <Fragment key={r.id}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                    title={`${isOpen ? "Collapse" : "Expand"} bills for ${r.patientName}`}
                    aria-expanded={isOpen}
                    className="cursor-pointer border-b border-slate-50 text-[13px] text-slate-600 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{r.id}</span>
                        {r.isNew && (
                          <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-500">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-slate-700",
                            r.avatarColor
                          )}
                        >
                          {r.patientInitials}
                        </div>
                        <span className="font-medium text-indigo-600">{r.patientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {r.numberOfBillsPaid}/{r.numberOfBillsTotal}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{r.reservationDate}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {formatCurrency(r.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.paymentStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 text-slate-300">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          title="More options"
                          aria-label="More options"
                          className="cursor-pointer hover:text-slate-500"
                        >
                          <MoreVertical size={15} />
                        </button>
                        <ChevronDown
                          size={15}
                          className={cn(
                            "transition-transform",
                            isOpen && "rotate-180 text-slate-500"
                          )}
                        />
                      </div>
                    </td>
                  </tr>

                  {isOpen &&
                    r.bills.map((bill) => (
                      <tr
                        key={bill.billNo}
                        className="border-b border-slate-50 bg-slate-50/40 text-[12.5px] text-slate-500"
                      >
                        <td className="px-5 py-3 pl-10 text-slate-400">
                          Bill ID <span className="text-slate-500">{bill.id}</span>
                        </td>
                        <td className="px-5 py-3" colSpan={2}>
                          For <span className="text-slate-600">{bill.label}</span>
                        </td>
                        <td className="px-5 py-3">
                          Amount{" "}
                          <span className="font-medium text-slate-700">
                            {formatCurrency(bill.amount)}
                          </span>
                        </td>
                        <td className="px-5 py-3" colSpan={2}>
                          {bill.status === "paid" ? (
                            <span className="text-[11px] font-semibold tracking-wide text-emerald-500 uppercase">
                              Paid
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold tracking-wide text-rose-500 uppercase">
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {bill.status === "unpaid" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetPayment(r, bill);
                              }}
                              title={`Set payment for ${bill.billNo}`}
                              aria-label={`Set payment for ${bill.billNo}`}
                              className="cursor-pointer rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap text-white hover:bg-indigo-500"
                            >
                              Set Payment
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                              <button
                                onClick={(e) => e.stopPropagation()}
                                title="Download receipt"
                                aria-label="Download receipt"
                                className="cursor-pointer hover:text-slate-600"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                title="Print receipt"
                                aria-label="Print receipt"
                                className="cursor-pointer hover:text-slate-600"
                              >
                                <Printer size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
