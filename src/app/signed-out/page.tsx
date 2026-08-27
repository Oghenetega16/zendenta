"use client";

import Link from "next/link";
import { LogIn, Stethoscope } from "lucide-react";

export default function SignedOutPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#f6f7fb] px-6 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <Stethoscope size={22} strokeWidth={2.2} />
      </div>
      <h1 className="mb-1.5 text-[18px] font-bold text-slate-900">You&apos;ve been signed out</h1>
      <p className="mb-6 max-w-[320px] text-[13px] text-slate-400">
        Thanks for using Zendenta. Sign back in to pick up right where you left off.
      </p>
      <Link
        href="/"
        title="Sign back in"
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-500"
      >
        <LogIn size={15} />
        Sign back in
      </Link>
    </div>
  );
}
