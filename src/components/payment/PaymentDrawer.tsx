"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  History,
  Landmark,
  Printer,
  Smartphone,
  X,
} from "lucide-react";
import { Account, Bill, PaymentMethodType, Reservation } from "@/types";
import { accounts } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";

type Step = "detail" | "cash" | "success";

const methodOptions: { id: PaymentMethodType; label: string; icon: React.ElementType }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "credit_card", label: "Credit card", icon: CreditCard },
  { id: "bank_transfer", label: "Bank transfer", icon: Landmark },
  { id: "e_wallet", label: "E-wallet", icon: Smartphone },
];

const quickAmounts = [20, 30, 50, 100];

const panelTransition = { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.9 };
const backdropTransition = { duration: 0.2, ease: "easeOut" as const };
const overlayTransition = { type: "spring" as const, stiffness: 480, damping: 34 };

export function PaymentDrawer({
  reservation,
  bill,
  onClose,
  onPaid,
}: {
  reservation: Reservation;
  bill: Bill;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [step, setStep] = useState<Step>("detail");
  const [account, setAccount] = useState<Account>(accounts[0]);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [note, setNote] = useState("");
  const [cashInput, setCashInput] = useState(bill.total.toFixed(2));
  const [showAllMethods, setShowAllMethods] = useState(false);

  // Lock scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (step === "cash") setStep("detail");
        else onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step, onClose]);

  const cashValue = parseFloat(cashInput || "0") || 0;
  const change = Math.max(cashValue - bill.total, 0);

  function selectMethod(id: PaymentMethodType) {
    if (id === "cash") {
      setStep("cash");
    } else {
      // Non-cash methods: treat as instantly confirmable for this demo
      setStep("success");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={backdropTransition}
        aria-label="Close payment panel"
        title="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-slate-900/30"
      />

      {/* Main detail / method panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={panelTransition}
        className="relative flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl"
      >
        <AnimatePresence mode="wait" initial={false}>
          {step !== "success" ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="flex h-full flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-[11px] text-slate-400">Bill ID</p>
                  <p className="text-[14px] font-bold text-slate-800">{bill.billNo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    title="View history and comments"
                    aria-label="View history and comments"
                    className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-600"
                  >
                    <History size={14} />
                    History &amp; comment
                  </button>
                  <button
                    onClick={onClose}
                    title="Close"
                    aria-label="Close payment panel"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {/* Select account */}
                <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  Select Account
                </p>
                <div className="relative mb-5">
                  <button
                    onClick={() => setAccountMenuOpen((v) => !v)}
                    title="Select account"
                    aria-label="Select account"
                    aria-haspopup="listbox"
                    aria-expanded={accountMenuOpen}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-left"
                  >
                    <span className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
                      <span className={cn("h-2 w-2 rounded-full", account.colorClass)} />
                      {account.name}
                      {account.isDefault && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-400 uppercase">
                          Default
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      size={15}
                      className={cn(
                        "text-slate-400 transition-transform",
                        accountMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {accountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        role="listbox"
                        className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-100 bg-white py-1 shadow-lg"
                      >
                        {accounts.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => {
                              setAccount(a);
                              setAccountMenuOpen(false);
                            }}
                            title={a.name}
                            role="option"
                            aria-selected={account.id === a.id}
                            className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-slate-50"
                          >
                            <span className="flex items-center gap-2 font-medium text-slate-700">
                              <span className={cn("h-2 w-2 rounded-full", a.colorClass)} />
                              {a.name}
                              {a.isDefault && (
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-400 uppercase">
                                  Default
                                </span>
                              )}
                            </span>
                            {account.id === a.id && (
                              <Check size={14} className="text-indigo-600" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bill to */}
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      Bill To
                    </p>
                    <p className="text-[13.5px] font-semibold text-slate-800">
                      {bill.billTo.name}
                    </p>
                    <p className="max-w-[180px] text-[11.5px] leading-snug text-slate-400">
                      {bill.billTo.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      Bill Date
                    </p>
                    <p className="text-[12.5px] text-slate-600">{bill.billDate}</p>
                    <span className="mt-1 inline-block rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-500 uppercase">
                      Unpaid
                    </span>
                  </div>
                </div>

                {/* Line items */}
                <div className="mb-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-400 uppercase">
                    <span>Bill Name</span>
                    <span>Amount</span>
                  </div>
                  {bill.lineItems.map((li) => (
                    <div
                      key={li.id}
                      className="flex items-center justify-between px-3.5 py-2.5 text-[13px] text-slate-600"
                    >
                      <span>{li.label}</span>
                      <span className="font-medium text-slate-700">
                        Total {formatCurrency(li.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Note */}
                <div className="mb-5">
                  <label
                    htmlFor="bill-note"
                    className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-400 uppercase"
                  >
                    Add Note (Optional)
                  </label>
                  <textarea
                    id="bill-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Type a message..."
                    title="Add a note to this bill"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-[12.5px] text-slate-600 placeholder:text-slate-300 outline-none focus:border-indigo-200 focus:bg-white"
                  />
                </div>

                {/* Totals */}
                <div className="space-y-1.5 border-t border-dashed border-slate-200 pt-3">
                  <div className="flex items-center justify-between text-[13px] text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(bill.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px] text-slate-500">
                    <span>Tax</span>
                    <span className="font-medium text-slate-700">{formatCurrency(bill.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[14px] font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(bill.total)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[11.5px] text-emerald-600">
                  <CheckCircle2 size={13} />
                  All your transactions are secure and fast.
                </div>
              </div>

              {/* Payment method selector */}
              <div className="border-t border-slate-100 px-5 py-4">
                <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  Select a Payment Method
                </p>
                <div className="space-y-1.5">
                  {(showAllMethods ? methodOptions : methodOptions.slice(0, 2)).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => selectMethod(m.id)}
                      title={`Pay with ${m.label}`}
                      aria-label={`Pay with ${m.label}`}
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-100 px-3.5 py-2.5 text-left hover:border-indigo-200 hover:bg-indigo-50/40"
                    >
                      <span className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
                        <m.icon size={16} className="text-slate-400" />
                        {m.label}
                      </span>
                      <ChevronRight size={15} className="text-slate-300" />
                    </button>
                  ))}
                </div>
                {!showAllMethods && (
                  <button
                    onClick={() => setShowAllMethods(true)}
                    title="Show more payment methods"
                    aria-label="Show more payment methods"
                    className="mt-2.5 flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-indigo-600"
                  >
                    Show More
                    <ChevronDown size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <SuccessPanel
                reservation={reservation}
                bill={bill}
                amountPaid={cashValue || bill.total}
                change={change}
                onClose={() => {
                  onPaid();
                  onClose();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cash entry overlay panel */}
      <AnimatePresence>
        {step === "cash" && (
          <div className="absolute inset-0 flex items-end justify-end p-0 sm:items-center sm:p-8 sm:pr-[420px]">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={backdropTransition}
              aria-label="Close cash panel"
              title="Close"
              onClick={() => setStep("detail")}
              className="absolute inset-0 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={overlayTransition}
              className="relative w-full max-w-[340px] rounded-t-2xl border border-slate-100 bg-white p-5 shadow-2xl sm:rounded-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                  <Banknote size={16} className="text-slate-400" />
                  Cash
                </span>
                <button
                  onClick={() => setStep("detail")}
                  title="Back"
                  aria-label="Back to bill detail"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <p className="mb-1 text-[12px] text-slate-400">Total Payment</p>
              <p className="mb-4 text-[24px] font-bold text-slate-900">
                {formatCurrency(bill.total)}
              </p>

              <label
                htmlFor="cash-amount"
                className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-400 uppercase"
              >
                Input amount
              </label>
              <div className="mb-3 flex items-center rounded-lg border border-slate-200 px-3 py-2.5">
                <span className="mr-1 text-[14px] font-medium text-slate-400">$</span>
                <input
                  id="cash-amount"
                  type="number"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  title="Cash amount received"
                  className="w-full text-[14px] font-semibold text-slate-800 outline-none"
                />
              </div>

              <div className="mb-5 grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashInput(amt.toFixed(2))}
                    title={`Set amount to $${amt}`}
                    aria-label={`Set amount to $${amt}`}
                    className="cursor-pointer rounded-lg border border-slate-100 py-1.5 text-[12px] font-medium text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep("success")}
                disabled={cashValue < bill.total}
                title="Confirm payment"
                aria-label="Confirm payment"
                className="w-full cursor-pointer rounded-lg bg-indigo-600 py-2.5 text-[13.5px] font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                Pay
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessPanel({
  bill,
  amountPaid,
  change,
  onClose,
}: {
  reservation: Reservation;
  bill: Bill;
  amountPaid: number;
  change: number;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-end px-5 pt-4">
        <button
          onClick={onClose}
          title="Close"
          aria-label="Close payment panel"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col items-center px-8 pt-2 pb-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.05 }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
        >
          <CheckCircle2 size={34} className="text-emerald-500" strokeWidth={2} />
        </motion.div>
        <h2 className="mb-1 text-[17px] font-bold text-slate-900">Payment success</h2>
        <p className="text-[12px] text-slate-400">Amount</p>
        <p className="text-[26px] font-bold text-slate-900">{formatCurrency(bill.total)}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-slate-400">
          <CalendarClock size={12} />
          {bill.billDate} &middot; Bill ID: {bill.billNo}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <div className="rounded-xl border border-slate-100">
          <p className="border-b border-slate-100 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            Payment Details
          </p>
          {bill.lineItems.map((li) => (
            <div
              key={li.id}
              className="flex items-center justify-between px-3.5 py-2.5 text-[13px] text-slate-600"
            >
              <span>{li.label}</span>
              <span className="font-medium text-slate-700">Total {formatCurrency(li.total)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            Detail Transaction
          </p>
          <div className="space-y-1.5 text-[13px]">
            <div className="flex items-center justify-between text-slate-500">
              <span>Amount paid</span>
              <span className="font-medium text-slate-700">{formatCurrency(amountPaid)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Change money</span>
              <span className="font-medium text-slate-700">{formatCurrency(change)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Payment method</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Banknote size={13} className="text-slate-400" />
                Cash
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
        <button
          onClick={onClose}
          title="Back to calendar"
          aria-label="Back to calendar"
          className="flex-1 cursor-pointer rounded-lg border border-slate-200 py-2.5 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          Back to calendar
        </button>
        <button
          onClick={() => window.print()}
          title="Print receipt"
          aria-label="Print receipt"
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-[12.5px] font-semibold text-white hover:bg-indigo-500"
        >
          <Printer size={14} />
          Print Receipt
        </button>
      </div>
    </div>
  );
}
