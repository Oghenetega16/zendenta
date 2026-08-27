import { Mail, Phone, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-5 pt-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-amber-900 text-lg font-semibold text-white">
            DS
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-slate-900">Darrell Steward</h1>
            <p className="flex items-center gap-1.5 text-[12.5px] text-slate-400">
              <ShieldCheck size={13} />
              Super admin at Avicena Clinic
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-slate-50 pt-5 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
              <Mail size={15} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Email</p>
              <p className="text-[13px] font-medium text-slate-700">darrell.steward@avicena.clinic</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
              <Phone size={15} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Phone</p>
              <p className="text-[13px] font-medium text-slate-700">+1 (555) 019-2837</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
