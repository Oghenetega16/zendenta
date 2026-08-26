import { CreditCard } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function PurchasesPage() {
  return (
    <div className="pt-6">
      <ComingSoon
        icon={CreditCard}
        title="Purchases"
        description="Track supply and equipment purchases here. This page is a placeholder ready for you to build out."
      />
    </div>
  );
}
