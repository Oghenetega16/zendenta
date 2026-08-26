import { Loader2 } from "lucide-react";

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 size={22} className="animate-spin" />
      <p className="text-[13px]">{label}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-[13px] text-rose-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          title="Retry"
          aria-label="Retry"
          className="cursor-pointer rounded-lg border border-slate-200 px-3.5 py-1.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
        >
          Try again
        </button>
      )}
    </div>
  );
}
