import { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
        <Icon size={26} strokeWidth={1.8} />
      </div>
      <h2 className="mb-1.5 text-[16px] font-bold text-slate-800">{title}</h2>
      <p className="max-w-[320px] text-[13px] leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}
