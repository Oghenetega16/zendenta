import { Archive } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function StocksPage() {
  return (
    <div className="pt-6">
      <ComingSoon
        icon={Archive}
        title="Stocks"
        description="Track medicine and supply stock levels here. This page is a placeholder ready for you to build out."
      />
    </div>
  );
}
