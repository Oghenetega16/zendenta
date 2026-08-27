"use client";

import { Wallet } from "lucide-react";
import { fetchAccounts } from "@/lib/api-client";
import { useApiData } from "@/hooks/useApiData";
import { PageLoader, ErrorState } from "@/components/PageStates";
import { formatCurrency } from "@/lib/utils";

const dotColor: Record<string, string> = {
  "bg-emerald-500": "bg-emerald-500",
  "bg-sky-500": "bg-sky-500",
  "bg-rose-500": "bg-rose-500",
  "bg-amber-500": "bg-amber-500",
};

export default function AccountsPage() {
  const { data: accounts, error, reload } = useApiData(fetchAccounts);

  if (error) {
    return (
      <div className="pt-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!accounts) {
    return (
      <div className="pt-6">
        <PageLoader label="Loading accounts..." />
      </div>
    );
  }

  const grandTotal = accounts.reduce((sum, a) => sum + a.totalReceived, 0);

  return (
    <div className="space-y-5 pt-6">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Wallet size={18} strokeWidth={2} />
        </div>
        <div>
          <p className="text-[12px] text-slate-400">Total across all accounts</p>
          <p className="text-[18px] font-bold text-slate-900">{formatCurrency(grandTotal)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${dotColor[account.colorClass] ?? "bg-slate-400"}`}
                />
                <h2 className="text-[14px] font-bold text-slate-800">{account.name}</h2>
                {account.isDefault && (
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-400 uppercase">
                    Default
                  </span>
                )}
              </div>
              <span className="text-[12px] text-slate-400">
                {account.transactionCount} transaction{account.transactionCount === 1 ? "" : "s"}
              </span>
            </div>

            <p className="mb-4 text-[24px] font-bold text-slate-900">
              {formatCurrency(account.totalReceived)}
            </p>

            {account.recentBills.length > 0 ? (
              <div className="space-y-2 border-t border-slate-50 pt-3">
                <p className="text-[10.5px] font-semibold tracking-wide text-slate-400 uppercase">
                  Recent transactions
                </p>
                {account.recentBills.map((bill) => (
                  <div key={bill.billNo} className="flex items-center justify-between text-[12.5px]">
                    <span className="text-slate-500">
                      {bill.patientName} &middot; {bill.billNo}
                    </span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(bill.total)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="border-t border-slate-50 pt-3 text-[12px] text-slate-400">
                No transactions routed to this account yet.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
