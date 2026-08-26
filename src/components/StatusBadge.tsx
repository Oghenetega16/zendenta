import { cn } from "@/lib/utils";
import { PaymentStatus } from "@/types";

const statusStyles: Record<PaymentStatus, string> = {
  fully_paid: "bg-emerald-50 text-emerald-600",
  partially_paid: "bg-violet-50 text-violet-500",
  unpaid: "bg-rose-50 text-rose-500",
};

const statusLabels: Record<PaymentStatus, string> = {
  fully_paid: "Fully Paid",
  partially_paid: "Partially Paid",
  unpaid: "Unpaid",
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
        statusStyles[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
