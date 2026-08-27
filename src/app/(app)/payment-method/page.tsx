"use client";

import { useState } from "react";
import { Banknote, CreditCard, Landmark, Smartphone } from "lucide-react";
import { fetchPaymentMethods, setPaymentMethodEnabledRequest } from "@/lib/api-client";
import { useApiData } from "@/hooks/useApiData";
import { PageLoader, ErrorState } from "@/components/PageStates";
import { PaymentMethodConfig, PaymentMethodType } from "@/types";

const icons: Record<PaymentMethodType, React.ElementType> = {
  cash: Banknote,
  credit_card: CreditCard,
  bank_transfer: Landmark,
  e_wallet: Smartphone,
};

export default function PaymentMethodPage() {
  const { data: methods, error, reload } = useApiData(fetchPaymentMethods);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [localMethods, setLocalMethods] = useState<PaymentMethodConfig[] | null>(null);

  const list = localMethods ?? methods;

  async function toggle(method: PaymentMethodConfig) {
    setPendingId(method.id);
    try {
      const updated = await setPaymentMethodEnabledRequest(method.id, !method.enabled);
      setLocalMethods((prev) =>
        (prev ?? methods ?? []).map((m) => (m.id === updated.id ? updated : m))
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

  if (!list) {
    return (
      <div className="pt-6">
        <PageLoader label="Loading payment methods..." />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-6">
      <div className="rounded-2xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-[14px] font-bold text-slate-800">Accepted payment methods</h2>
          <p className="text-[12px] text-slate-400">
            Turning a method off here removes it from the payment options staff see when
            collecting a bill in Sales.
          </p>
        </div>

        <div className="divide-y divide-slate-50">
          {list.map((method) => {
            const Icon = icons[method.id];
            const isPending = pendingId === method.id;
            return (
              <div key={method.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold text-slate-800">{method.label}</p>
                    <p className="text-[11.5px] text-slate-400">
                      {method.processingFee > 0
                        ? `${method.processingFee}% processing fee`
                        : "No processing fee"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggle(method)}
                  disabled={isPending}
                  title={method.enabled ? `Disable ${method.label}` : `Enable ${method.label}`}
                  aria-label={method.enabled ? `Disable ${method.label}` : `Enable ${method.label}`}
                  role="switch"
                  aria-checked={method.enabled}
                  className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${
                    method.enabled ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      method.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
